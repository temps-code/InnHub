import { canAccess } from "../../app/routes/routeMetadata";
import { createInsForgeClient } from "../../shared/services/insforgeClient";
import {
	assignPropertyOwnership,
	scopeOperationalQuery,
} from "../../shared/services/propertyScope";
import {
	executeServiceQuery,
	serviceFailure,
	serviceSuccess,
	type ServiceResult,
} from "../../shared/services/serviceResult";
import { withServiceContext } from "../../shared/services/serviceContext";
import type { AppSession } from "../auth/types";
import { validateRoomAvailability } from "./reservationAvailability";
import type {
	Reservation,
	ReservationCreateData,
	ReservationItem,
	ReservationItemInput,
	ReservationListParams,
	ReservationListResult,
	ReservationPurgeResult,
	ReservationStatus,
	ReservationUpdateData,
} from "./types";
import { reservationCreateSchema } from "./types";

const DEFAULT_PAGE_SIZE = 20;
const EDITABLE_STATUSES: ReservationStatus[] = ["pending", "confirmed"];
const CANCELLABLE_STATUSES: ReservationStatus[] = ["pending", "confirmed"];
const IN_PROGRESS_STATUSES: ReservationStatus[] = [
	"checked_in",
	"partially_checked_in",
];

export interface ReservationServiceDeps {
	readonly from: (table: string) => {
		readonly select: (
			columns: string,
			options?: unknown,
		) => ReservationServiceDepsQuery;
		readonly insert: (data: unknown) => ReservationServiceDepsQuery;
		readonly update: (data: unknown) => ReservationServiceDepsQuery;
		readonly delete: () => ReservationServiceDepsQuery;
	};
}

export interface ReservationServiceDepsQuery {
	readonly eq: (column: string, value: unknown) => this;
	readonly is: (column: string, value: unknown) => this;
	readonly neq: (column: string, value: unknown) => this;
	readonly in: (column: string, values: unknown[]) => this;
	readonly or: (expression: string) => this;
	readonly order: (column: string, options?: unknown) => this;
	readonly range: (from: number, to: number) => this;
	readonly lt: (column: string, value: unknown) => this;
	readonly gt: (column: string, value: unknown) => this;
	readonly select: (columns?: string, options?: unknown) => this;
	readonly then: <TResult>(
		onfulfilled?: (value: {
			readonly data: unknown;
			readonly error: unknown;
			readonly count?: number | null;
		}) => TResult | PromiseLike<TResult>,
		onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
	) => Promise<TResult>;
}

export async function list(
	session: AppSession | null,
	params: ReservationListParams = {},
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<ReservationListResult>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		const { page, pageSize } = resolvePagination(params);
		const query = scopeOperationalQuery(
			from("reservations").select("*", { count: "exact" }),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.order("planned_check_in_date", { ascending: true });
		const result = await executeServiceQuery<Reservation[] | Reservation>(
			query as never,
		);
		if (!result.ok) {
			return result;
		}
		const hydrated = await hydrateReservationsWithPrimaryItems(
			normalizeArray(result.data),
			ctx.propertyScope,
			from,
		);
		const filtered = await applyReservationFilters(
			hydrated,
			params,
			ctx.propertyScope,
			from,
		);
		const reservations = paginateRows(filtered, page, pageSize);
		return serviceSuccess({
			reservations,
			page,
			pageSize,
			total: filtered.length,
		});
	});
}

export async function listTrash(
	session: AppSession | null,
	params: ReservationListParams = {},
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<ReservationListResult>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		const profile = session?.profile;
		if (!profile || !canAccess("manager", profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}
		const { page, pageSize } = resolvePagination(params);
		const query = scopeOperationalQuery(
			from("reservations").select("*", { count: "exact" }),
			ctx.propertyScope,
		).order("planned_check_in_date", { ascending: true });
		const result = await executeServiceQuery<Reservation[] | Reservation>(
			query as never,
		);
		if (!result.ok) {
			return result;
		}
		const hydrated = await hydrateReservationsWithPrimaryItems(
			normalizeArray(result.data),
			ctx.propertyScope,
			from,
		);
		const archived = hydrated.filter((row) => row.deleted_at !== null);
		const filtered = await applyReservationFilters(
			archived,
			params,
			ctx.propertyScope,
			from,
		);
		const reservations = paginateRows(filtered, page, pageSize);
		return serviceSuccess({
			reservations,
			page,
			pageSize,
			total: filtered.length,
		});
	});
}

export async function getById(
	session: AppSession | null,
	id: string,
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<Reservation>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		const query = scopeOperationalQuery(
			from("reservations").select("*"),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);
		return normalizeSingle(await executeServiceQuery(query as never));
	});
}

export async function create(
	session: AppSession | null,
	data: ReservationCreateData,
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<Reservation>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		if (!session?.profile || !canAccess("receptionist", session.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}
		const validated = reservationCreateSchema.safeParse(data);
		if (!validated.success) {
			return serviceFailure("validation-error", "invalid-reservation-data");
		}
		if (
			validated.data.planned_check_out_date <=
			validated.data.planned_check_in_date
		) {
			return serviceFailure(
				"validation-error",
				"check-out-must-be-after-check-in",
			);
		}
		const ownership = assignPropertyOwnership(
			validated.data,
			ctx.propertyScope,
		);
		if (!ownership.ok) {
			return serviceFailure("property-scope-error");
		}

		const reservationItems = normalizeReservationItems(ownership.value);
		if (reservationItems.length === 0) {
			return serviceFailure("validation-error", "reservation-items-required");
		}
		if (hasDuplicateAssignedRooms(reservationItems)) {
			return serviceFailure("validation-error", "duplicate-assigned-room");
		}

		for (const item of reservationItems) {
			if (item.room_id) {
				const availability = await validateRoomAvailability(session, {
					roomId: item.room_id,
					checkInDate: ownership.value.planned_check_in_date,
					checkOutDate: ownership.value.planned_check_out_date,
				});
				if (!availability.ok) {
					return availability;
				}
			}
		}

		const reservationPayload = {
			property_id: ownership.value.property_id,
			primary_guest_id: ownership.value.primary_guest_id,
			planned_check_in_date: ownership.value.planned_check_in_date,
			planned_check_out_date: ownership.value.planned_check_out_date,
			status: ownership.value.status ?? "pending",
			notes: ownership.value.notes,
		};

		const reservationInsert = await executeServiceQuery<
			Reservation | Reservation[]
		>(from("reservations").insert(reservationPayload).select() as never);
		const reservation = normalizeSingle(reservationInsert);
		if (!reservation.ok) {
			return reservation;
		}

		const itemPayload = reservationItems.map((item) => ({
			property_id: ownership.value.property_id,
			reservation_id: reservation.data.id,
			room_type_id: item.room_type_id,
			room_id: item.room_id,
			status:
				ownership.value.status === "confirmed" ||
				ownership.value.status === "checked_in"
					? "confirmed"
					: "pending",
			guest_count: item.guest_count,
			notes: ownership.value.notes,
		}));
		const itemInsert = await executeServiceQuery<
			ReservationItem | ReservationItem[]
		>(from("reservation_items").insert(itemPayload).select() as never);
		if (!itemInsert.ok) {
			return serviceFailure("backend-error");
		}

		return reservation;
	});
}

export async function update(
	session: AppSession | null,
	id: string,
	data: ReservationUpdateData,
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<Reservation>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		if (!session?.profile || !canAccess("receptionist", session.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}
		const loaded = await getById(session, id, deps);
		if (!loaded.ok) {
			return loaded;
		}
		if (!EDITABLE_STATUSES.includes(loaded.data.status)) {
			return serviceFailure(
				"validation-error",
				"reservation-status-not-editable",
			);
		}
		const validated = reservationCreateSchema.safeParse(data);
		if (!validated.success) {
			return serviceFailure("validation-error", "invalid-reservation-data");
		}
		if (
			validated.data.planned_check_out_date <=
			validated.data.planned_check_in_date
		) {
			return serviceFailure(
				"validation-error",
				"check-out-must-be-after-check-in",
			);
		}
		const reservationItems = normalizeReservationItems(validated.data);
		if (reservationItems.length === 0) {
			return serviceFailure("validation-error", "reservation-items-required");
		}
		if (hasDuplicateAssignedRooms(reservationItems)) {
			return serviceFailure("validation-error", "duplicate-assigned-room");
		}
		for (const item of reservationItems) {
			if (item.room_id) {
				const availability = await validateRoomAvailability(session, {
					roomId: item.room_id,
					checkInDate: validated.data.planned_check_in_date,
					checkOutDate: validated.data.planned_check_out_date,
					excludeReservationId: id,
				});
				if (!availability.ok) {
					return availability;
				}
			}
		}

		const updateData = {
			primary_guest_id: validated.data.primary_guest_id,
			planned_check_in_date: validated.data.planned_check_in_date,
			planned_check_out_date: validated.data.planned_check_out_date,
			notes: validated.data.notes,
			status: validated.data.status ?? loaded.data.status,
		};
		const query = scopeOperationalQuery(
			from("reservations").update(updateData).select(),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);
		const updatedReservation = normalizeSingle(
			await executeServiceQuery<Reservation | Reservation[]>(query as never),
		);
		if (!updatedReservation.ok) {
			return updatedReservation;
		}

		const deleteItemsQuery = scopeOperationalQuery(
			from("reservation_items").delete().eq("reservation_id", id).select(),
			ctx.propertyScope,
		) as never;
		const deleteItemsResponse = (await deleteItemsQuery) as {
			readonly error: unknown;
		};
		if (deleteItemsResponse.error) {
			return serviceFailure("backend-error");
		}
		const itemInsertPayload = reservationItems.map((item) => ({
			property_id: ctx.propertyScope.propertyId,
			reservation_id: id,
			room_type_id: item.room_type_id,
			room_id: item.room_id,
			status:
				(validated.data.status ?? loaded.data.status) === "confirmed" ||
				(validated.data.status ?? loaded.data.status) === "checked_in"
					? "confirmed"
					: "pending",
			guest_count: item.guest_count,
			notes: validated.data.notes,
		}));
		const itemInsert = await executeServiceQuery(
			scopeOperationalQuery(
				from("reservation_items").insert(itemInsertPayload).select(),
				ctx.propertyScope,
			) as never,
		);
		if (!itemInsert.ok) {
			return serviceFailure("backend-error");
		}
		return updatedReservation;
	});
}

export async function cancel(
	session: AppSession | null,
	id: string,
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<Reservation>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		if (!session?.profile || !canAccess("receptionist", session.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}
		const loaded = await getById(session, id, deps);
		if (!loaded.ok) {
			return loaded;
		}
		if (!CANCELLABLE_STATUSES.includes(loaded.data.status)) {
			return serviceFailure(
				"validation-error",
				"reservation-status-not-cancellable",
			);
		}
		const query = scopeOperationalQuery(
			from("reservations").update({ status: "cancelled" }).select(),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);
		return normalizeSingle(await executeServiceQuery(query as never));
	});
}

export async function softDelete(
	session: AppSession | null,
	id: string,
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<Reservation>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		if (!session?.profile || !canAccess("manager", session.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}
		const loaded = await getById(session, id, deps);
		if (!loaded.ok) {
			return loaded;
		}
		if (IN_PROGRESS_STATUSES.includes(loaded.data.status)) {
			return serviceFailure(
				"validation-error",
				"reservation-has-active-check-in",
			);
		}

		const reservationItemsResult = await executeServiceQuery<
			Array<{ id: string }> | { id: string }
		>(
			scopeOperationalQuery(
				from("reservation_items").select("id"),
				ctx.propertyScope,
			)
				.eq("reservation_id", id)
				.is("deleted_at", null) as never,
		);
		if (reservationItemsResult.ok) {
			const itemIds = normalizeArray(reservationItemsResult.data).map((item) =>
				String(item.id),
			);
			if (itemIds.length > 0) {
				const staysResult = await executeServiceQuery<
					Array<{ id: string; status: string }> | { id: string; status: string }
				>(
					scopeOperationalQuery(
						from("stays").select("id, status"),
						ctx.propertyScope,
					)
						.in("reservation_item_id", itemIds)
						.is("deleted_at", null) as never,
				);
				if (
					staysResult.ok &&
					normalizeArray(staysResult.data).some(
						(stay) => stay.status === "active",
					)
				) {
					return serviceFailure(
						"validation-error",
						"reservation-has-active-check-in",
					);
				}
			}
		}
		const query = scopeOperationalQuery(
			from("reservations")
				.update({ deleted_at: new Date().toISOString() })
				.select(),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);
		return normalizeSingle(await executeServiceQuery(query as never));
	});
}

export async function restore(
	session: AppSession | null,
	id: string,
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<Reservation>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		if (!session?.profile || !canAccess("manager", session.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}
		const query = scopeOperationalQuery(
			from("reservations").select("*"),
			ctx.propertyScope,
		).eq("id", id);
		const loaded = normalizeSingle(
			await executeServiceQuery<Reservation | Reservation[]>(query as never),
		);
		if (!loaded.ok) {
			return loaded;
		}
		if (loaded.data.deleted_at === null) {
			return serviceFailure("not-found");
		}
		const itemQuery = scopeOperationalQuery(
			from("reservation_items").select("*"),
			ctx.propertyScope,
		).eq("reservation_id", id);
		const itemResult = await executeServiceQuery<
			ReservationItem | ReservationItem[]
		>(itemQuery as never);
		if (!itemResult.ok) {
			return itemResult;
		}
		const availability = await validateReservationItemsAvailability(
			session,
			normalizeArray(itemResult.data),
			{
				checkInDate: loaded.data.planned_check_in_date,
				checkOutDate: loaded.data.planned_check_out_date,
				excludeReservationId: id,
			},
		);
		if (!availability.ok) {
			return availability;
		}
		const updateQuery = scopeOperationalQuery(
			from("reservations").update({ deleted_at: null }).select(),
			ctx.propertyScope,
		).eq("id", id);
		return normalizeSingle(await executeServiceQuery(updateQuery as never));
	});
}

export async function purge(
	session: AppSession | null,
	id: string,
	deps?: ReservationServiceDeps,
): Promise<ServiceResult<ReservationPurgeResult>> {
	const from = resolveFrom(deps);
	return withServiceContext(session, async (ctx) => {
		if (
			!session?.profile ||
			!canAccess("administrator", session.profile.role)
		) {
			return serviceFailure("validation-error", "permission-denied");
		}
		const query = scopeOperationalQuery(
			from("reservations").select("*"),
			ctx.propertyScope,
		).eq("id", id);
		const loaded = normalizeSingle(
			await executeServiceQuery<Reservation | Reservation[]>(query as never),
		);
		if (!loaded.ok) {
			return loaded as ServiceResult<ReservationPurgeResult>;
		}
		if (loaded.data.deleted_at === null) {
			return serviceFailure(
				"validation-error",
				"reservation-must-be-archived-before-purge",
			);
		}

		const invoicesResult = await executeServiceQuery<
			{ id: string }[] | { id: string }
		>(
			scopeOperationalQuery(
				from("invoices").select("id"),
				ctx.propertyScope,
			).eq("reservation_id", id) as never,
		);
		const invoiceCount = invoicesResult.ok
			? normalizeArray(invoicesResult.data).length
			: 0;
		let paymentCount = 0;
		if (invoiceCount > 0 && invoicesResult.ok) {
			const invoiceIds = normalizeArray(invoicesResult.data).map((invoice) =>
				String(invoice.id),
			);
			const paymentResult = await executeServiceQuery<
				{ id: string }[] | { id: string }
			>(
				scopeOperationalQuery(
					from("payments").select("id"),
					ctx.propertyScope,
				).in("invoice_id", invoiceIds) as never,
			);
			paymentCount = paymentResult.ok
				? normalizeArray(paymentResult.data).length
				: 0;
		}
		if (invoiceCount > 0 || paymentCount > 0) {
			return serviceFailure(
				"foreign-key-conflict",
				`reservation-has-financial-records invoiceCount=${invoiceCount} paymentCount=${paymentCount}`,
			);
		}

		const deleted = await executeServiceQuery<Reservation | Reservation[]>(
			scopeOperationalQuery(
				from("reservations").delete().eq("id", id),
				ctx.propertyScope,
			) as never,
		);
		const normalizedDeleted = normalizeSingle(deleted);
		if (!normalizedDeleted.ok) {
			return normalizedDeleted as ServiceResult<ReservationPurgeResult>;
		}
		return serviceSuccess({
			reservation: normalizedDeleted.data,
			blockers: { invoiceCount, paymentCount },
		});
	});
}

async function hydrateReservationsWithPrimaryItems(
	reservations: Reservation[],
	propertyScope: { readonly propertyId: string },
	from: ReservationServiceDeps["from"],
): Promise<Reservation[]> {
	if (reservations.length === 0) {
		return reservations;
	}

	const reservationIds = reservations.map((reservation) => reservation.id);
	const itemsResult = await executeServiceQuery<
		| Array<
				Pick<
					ReservationItem,
					"reservation_id" | "room_type_id" | "room_id" | "guest_count"
				>
		  >
		| Pick<
				ReservationItem,
				"reservation_id" | "room_type_id" | "room_id" | "guest_count"
		  >
	>(
		scopeOperationalQuery(
			from("reservation_items").select(
				"reservation_id, room_type_id, room_id, guest_count",
			),
			propertyScope,
		)
			.in("reservation_id", reservationIds)
			.is("deleted_at", null) as never,
	);
	if (!itemsResult.ok) {
		return reservations.map((reservation) => ({
			...reservation,
			reference: formatReservationReference(reservation.id),
		}));
	}

	const itemsByReservationId = new Map<
		string,
		Array<
			Pick<
				ReservationItem,
				"reservation_id" | "room_type_id" | "room_id" | "guest_count"
			>
		>
	>();
	for (const item of normalizeArray(itemsResult.data)) {
		const existing = itemsByReservationId.get(item.reservation_id) ?? [];
		existing.push(item);
		itemsByReservationId.set(item.reservation_id, existing);
	}

	const guestIds = Array.from(
		new Set(reservations.map((row) => row.primary_guest_id)),
	);
	const roomTypeIds = Array.from(
		new Set(
			normalizeArray(itemsResult.data)
				.map((item) => item.room_type_id)
				.filter((value): value is string => typeof value === "string"),
		),
	);
	const roomIds = Array.from(
		new Set(
			normalizeArray(itemsResult.data)
				.map((item) => item.room_id)
				.filter(
					(value): value is string =>
						typeof value === "string" && value.length > 0,
				),
		),
	);

	const [guestsResult, roomTypesResult, roomsResult] = await Promise.all([
		guestIds.length > 0
			? executeServiceQuery<
					| Array<{ id: string; first_name?: string; last_name?: string }>
					| { id: string; first_name?: string; last_name?: string }
				>(
					scopeOperationalQuery(
						from("guests").select("id, first_name, last_name"),
						propertyScope,
					).in("id", guestIds) as never,
				)
			: Promise.resolve(
					serviceSuccess(
						[] as Array<{
							id: string;
							first_name?: string;
							last_name?: string;
						}>,
					),
				),
		roomTypeIds.length > 0
			? executeServiceQuery<
					| Array<{ id: string; name?: string | null }>
					| { id: string; name?: string | null }
				>(
					scopeOperationalQuery(
						from("room_types").select("id, name"),
						propertyScope,
					).in("id", roomTypeIds) as never,
				)
			: Promise.resolve(
					serviceSuccess([] as Array<{ id: string; name?: string | null }>),
				),
		roomIds.length > 0
			? executeServiceQuery<
					| Array<{ id: string; identifier?: string | null }>
					| { id: string; identifier?: string | null }
				>(
					scopeOperationalQuery(
						from("rooms").select("id, identifier"),
						propertyScope,
					).in("id", roomIds) as never,
				)
			: Promise.resolve(
					serviceSuccess(
						[] as Array<{ id: string; identifier?: string | null }>,
					),
				),
	]);

	const guestNameById = new Map<string, string>();
	if (guestsResult.ok) {
		for (const guest of normalizeArray(guestsResult.data)) {
			const name = `${guest.first_name ?? ""} ${guest.last_name ?? ""}`.trim();
			if (name.length > 0) guestNameById.set(guest.id, name);
		}
	}

	const roomTypeNameById = new Map<string, string>();
	if (roomTypesResult.ok) {
		for (const roomType of normalizeArray(roomTypesResult.data)) {
			if (roomType.name) roomTypeNameById.set(roomType.id, roomType.name);
		}
	}

	const roomIdentifierById = new Map<string, string>();
	if (roomsResult.ok) {
		for (const room of normalizeArray(roomsResult.data)) {
			if (room.identifier) roomIdentifierById.set(room.id, room.identifier);
		}
	}

	return reservations.map((reservation) => {
		const reservationItems = itemsByReservationId.get(reservation.id) ?? [];
		const primary = reservationItems[0];
		const roomTypeName = primary?.room_type_id
			? (roomTypeNameById.get(primary.room_type_id) ?? null)
			: null;
		const roomIdentifier = primary?.room_id
			? (roomIdentifierById.get(primary.room_id) ?? null)
			: null;
		const itemSummary = reservationItems
			.map((item) => {
				const itemRoomTypeName = item.room_type_id
					? (roomTypeNameById.get(item.room_type_id) ?? null)
					: null;
				const itemRoomIdentifier = item.room_id
					? (roomIdentifierById.get(item.room_id) ?? null)
					: null;
				return [itemRoomIdentifier, itemRoomTypeName]
					.filter((value): value is string =>
						Boolean(value && value.trim().length > 0),
					)
					.join(" · ");
			})
			.filter((value) => value.length > 0)
			.join(", ");
		return {
			...reservation,
			reference: formatReservationReference(reservation.id),
			primary_guest_name:
				guestNameById.get(reservation.primary_guest_id) ??
				reservation.primary_guest_name ??
				null,
			room_type_id: primary?.room_type_id ?? null,
			room_type_name: roomTypeName,
			room_id: primary?.room_id ?? null,
			room_identifier: roomIdentifier,
			item_summary: itemSummary.length > 0 ? itemSummary : roomTypeName,
			guest_count: primary?.guest_count ?? null,
			reservation_items: reservationItems.map((item) => ({
				room_type_id: item.room_type_id,
				room_id: item.room_id,
				guest_count: item.guest_count,
			})),
		};
	});
}

async function applyReservationFilters(
	reservations: Reservation[],
	params: ReservationListParams,
	propertyScope: { readonly propertyId: string },
	from: ReservationServiceDeps["from"],
): Promise<Reservation[]> {
	let filtered = reservations;
	if (params.status && params.status !== "all") {
		filtered = filtered.filter(
			(reservation) => reservation.status === params.status,
		);
	}
	if (params.guest_id) {
		filtered = filtered.filter(
			(reservation) => reservation.primary_guest_id === params.guest_id,
		);
	}
	if (params.checkInFrom) {
		filtered = filtered.filter(
			(reservation) => reservation.planned_check_in_date >= params.checkInFrom!,
		);
	}
	if (params.checkInTo) {
		filtered = filtered.filter(
			(reservation) => reservation.planned_check_in_date <= params.checkInTo!,
		);
	}
	if (params.checkOutFrom) {
		filtered = filtered.filter(
			(reservation) =>
				reservation.planned_check_out_date >= params.checkOutFrom!,
		);
	}
	if (params.checkOutTo) {
		filtered = filtered.filter(
			(reservation) => reservation.planned_check_out_date <= params.checkOutTo!,
		);
	}
	if (params.room_id) {
		const roomItemsResult = await executeServiceQuery<
			Array<{ reservation_id: string }> | { reservation_id: string }
		>(
			scopeOperationalQuery(
				from("reservation_items").select("reservation_id"),
				propertyScope,
			).eq("room_id", params.room_id) as never,
		);
		if (!roomItemsResult.ok) {
			return [];
		}
		const reservationIds = new Set(
			normalizeArray(roomItemsResult.data).map((item) => item.reservation_id),
		);
		filtered = filtered.filter((reservation) =>
			reservationIds.has(reservation.id),
		);
	}
	if (params.search && params.search.trim().length > 0) {
		const term = params.search.trim().toLowerCase();
		const byReference = filtered.filter((reservation) =>
			reservation.id.toLowerCase().includes(term),
		);
		const guestsResult = await executeServiceQuery<
			| Array<{ id: string; first_name?: string; last_name?: string }>
			| { id: string; first_name?: string; last_name?: string }
		>(
			scopeOperationalQuery(
				from("guests").select("id, first_name, last_name"),
				propertyScope,
			) as never,
		);
		if (guestsResult.ok) {
			const guestIds = new Set(
				normalizeArray(guestsResult.data)
					.filter((guest) => {
						const fullName =
							`${guest.first_name ?? ""} ${guest.last_name ?? ""}`
								.trim()
								.toLowerCase();
						return fullName.includes(term);
					})
					.map((guest) => String(guest.id)),
			);
			const byGuestName = filtered.filter((reservation) =>
				guestIds.has(reservation.primary_guest_id),
			);
			const merged = new Map<string, Reservation>();
			for (const reservation of [...byReference, ...byGuestName]) {
				merged.set(reservation.id, reservation);
			}
			filtered = Array.from(merged.values());
		} else {
			filtered = byReference;
		}
	}
	return filtered;
}

function normalizeReservationItems(
	data: ReservationCreateData | ReservationUpdateData,
): ReservationItemInput[] {
	if (data.reservation_items && data.reservation_items.length > 0) {
		return data.reservation_items.map((item) => ({
			room_type_id: item.room_type_id,
			room_id: item.room_id,
			guest_count: item.guest_count,
		}));
	}
	if (data.room_type_id && typeof data.guest_count === "number") {
		return [
			{
				room_type_id: data.room_type_id,
				room_id: data.room_id ?? null,
				guest_count: data.guest_count,
			},
		];
	}
	return [];
}

function hasDuplicateAssignedRooms(items: ReservationItemInput[]): boolean {
	const assignedRoomIds = items
		.map((item) => item.room_id)
		.filter((roomId): roomId is string => Boolean(roomId));
	return new Set(assignedRoomIds).size !== assignedRoomIds.length;
}

async function validateReservationItemsAvailability(
	session: AppSession | null,
	items: Array<{ room_id?: string | null; id?: string | null }>,
	request: {
		checkInDate: string;
		checkOutDate: string;
		excludeReservationId?: string;
	},
): Promise<ServiceResult<void>> {
	for (const item of items) {
		if (!item.room_id) {
			continue;
		}
		const availability = await validateRoomAvailability(session, {
			roomId: item.room_id,
			checkInDate: request.checkInDate,
			checkOutDate: request.checkOutDate,
			excludeReservationId: request.excludeReservationId,
			excludeReservationItemId: item.id ?? undefined,
		});
		if (!availability.ok) {
			return availability;
		}
	}

	return serviceSuccess(undefined);
}

function formatReservationReference(id: string): string {
	return `RES-${id.slice(0, 8).toUpperCase()}`;
}

function paginateRows<T>(rows: T[], page: number, pageSize: number): T[] {
	const offset = (page - 1) * pageSize;
	return rows.slice(offset, offset + pageSize);
}

function resolvePagination(params: ReservationListParams): {
	page: number;
	pageSize: number;
} {
	const pageSize = Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE);
	const page = Math.max(1, params.page ?? 1);
	return { page, pageSize };
}

function normalizeArray<T>(data: T | T[] | null | undefined): T[] {
	if (data == null) {
		return [];
	}
	return Array.isArray(data) ? data : [data];
}

function normalizeSingle<T>(result: ServiceResult<T | T[]>): ServiceResult<T> {
	if (!result.ok) {
		return result;
	}
	const rows = normalizeArray(result.data);
	if (rows.length === 0) {
		return serviceFailure("not-found");
	}
	return serviceSuccess(rows[0] as T);
}

function resolveFrom(
	deps?: ReservationServiceDeps,
): ReservationServiceDeps["from"] {
	if (deps) {
		return deps.from;
	}
	const client = createInsForgeClient();
	if (!client) {
		return (() => {
			throw new Error("InsForge client unavailable");
		}) as never;
	}
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			ReservationServiceDeps["from"]
		>;
}
