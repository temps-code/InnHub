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
import type {
	Guest,
	GuestActivityFilter,
	GuestFormData,
	GuestListParams,
	GuestListResult,
} from "./types";

const DEFAULT_PAGE_SIZE = 20;
const ACTIVE_RESERVATION_STATUSES = ["pending", "confirmed", "checked_in"];

export interface GuestServiceDeps {
	readonly from: (table: string) => {
		readonly select: (
			columns: string,
			options?: unknown,
		) => GuestServiceDepsQuery;
		readonly insert: (data: unknown) => GuestServiceDepsQuery;
		readonly update: (data: unknown) => GuestServiceDepsQuery;
		readonly delete: () => GuestServiceDepsQuery;
	};
}

export interface GuestServiceDepsQuery {
	readonly eq: (column: string, value: unknown) => this;
	readonly is: (column: string, value: unknown) => this;
	readonly neq: (column: string, value: unknown) => this;
	readonly in: (column: string, values: unknown[]) => this;
	readonly gte: (column: string, value: unknown) => this;
	readonly range: (from: number, to: number) => this;
	readonly order: (column: string, options?: unknown) => this;
	readonly or: (expression: string) => this;
	readonly ilike: (column: string, value: string) => this;
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
	params: GuestListParams = {},
	deps?: GuestServiceDeps,
): Promise<ServiceResult<GuestListResult>> {
	return listByMode(session, false, params, deps);
}

export async function listTrash(
	session: AppSession | null,
	params: GuestListParams = {},
	deps?: GuestServiceDeps,
): Promise<ServiceResult<GuestListResult>> {
	return listByMode(session, true, params, deps);
}

export async function getById(
	session: AppSession | null,
	id: string,
	deps?: GuestServiceDeps,
): Promise<ServiceResult<Guest>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = scopeOperationalQuery(
			from("guests").select("*"),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);

		const result = await executeServiceQuery<Guest | Guest[]>(query as never);
		return normalizeSingle(result);
	});
}

export async function create(
	session: AppSession | null,
	data: GuestFormData,
	deps?: GuestServiceDeps,
): Promise<ServiceResult<Guest>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("receptionist", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const ownership = assignPropertyOwnership(data, ctx.propertyScope);
		if (!ownership.ok) {
			return serviceFailure("property-scope-error");
		}

		const query = from("guests").insert(ownership.value).select();
		const { data: resultData, error } = await query;
		if (error) {
			return serviceFailure("backend-error");
		}

		return normalizeSingle({ ok: true, data: resultData as Guest | Guest[] });
	});
}

export async function update(
	session: AppSession | null,
	id: string,
	data: GuestFormData,
	deps?: GuestServiceDeps,
): Promise<ServiceResult<Guest>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("receptionist", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const ownership = assignPropertyOwnership(data, ctx.propertyScope);
		if (!ownership.ok) {
			return serviceFailure("property-scope-error");
		}

		const updateData = { ...ownership.value } as Record<string, unknown>;
		delete updateData.property_id;

		const query = scopeOperationalQuery(
			from("guests").update(updateData).select(),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);

		const { data: resultData, error } = await query;
		if (error) {
			return serviceFailure("backend-error");
		}

		return normalizeSingle({ ok: true, data: resultData as Guest | Guest[] });
	});
}

export async function softDelete(
	session: AppSession | null,
	id: string,
	deps?: GuestServiceDeps,
): Promise<ServiceResult<Guest>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const loadQuery = scopeOperationalQuery(
			from("guests").select("*"),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);
		const loaded = normalizeSingle(
			await executeServiceQuery<Guest | Guest[]>(loadQuery as never),
		);
		if (!loaded.ok) {
			return loaded;
		}

		const today = new Date().toISOString().slice(0, 10);
		const reservationGuardQuery = scopeOperationalQuery(
			from("reservations").select("id, status, planned_check_out_date"),
			ctx.propertyScope,
		)
			.eq("primary_guest_id", id)
			.is("deleted_at", null)
			.in("status", ACTIVE_RESERVATION_STATUSES)
			.gte("planned_check_out_date", today);

		const guardResult = await executeServiceQuery<
			| { id: string; status: string; planned_check_out_date: string }
			| { id: string; status: string; planned_check_out_date: string }[]
		>(reservationGuardQuery as never);

		if (guardResult.ok && !isResultEmpty(guardResult.data)) {
			const reservations = normalizeArray(
				guardResult.data as
					| { id: string; status: string; planned_check_out_date: string }
					| { id: string; status: string; planned_check_out_date: string }[]
					| null
					| undefined,
			);
			const isBlocked = reservations.some(
				(reservation) =>
					ACTIVE_RESERVATION_STATUSES.includes(reservation.status) &&
					reservation.planned_check_out_date >= today,
			);
			if (isBlocked) {
				return serviceFailure(
					"validation-error",
					"guest-has-active-or-future-reservations",
				);
			}
		}

		if (!guardResult.ok && guardResult.error.code !== "not-found") {
			return serviceFailure("backend-error");
		}

		const query = scopeOperationalQuery(
			from("guests").update({ deleted_at: new Date().toISOString() }).select(),
			ctx.propertyScope,
		)
			.is("deleted_at", null)
			.eq("id", id);

		const { data: resultData, error } = await query;
		if (error) {
			return serviceFailure("backend-error");
		}

		return normalizeSingle({ ok: true, data: resultData as Guest | Guest[] });
	});
}

export async function restore(
	session: AppSession | null,
	id: string,
	deps?: GuestServiceDeps,
): Promise<ServiceResult<Guest>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const loadQuery = scopeOperationalQuery(
			from("guests").select("*"),
			ctx.propertyScope,
		).eq("id", id);
		const loaded = normalizeSingle(
			await executeServiceQuery<Guest | Guest[]>(loadQuery as never),
		);
		if (!loaded.ok) {
			return loaded;
		}
		if (loaded.data.deleted_at === null) {
			return serviceFailure("not-found");
		}

		const query = scopeOperationalQuery(
			from("guests").update({ deleted_at: null }).select(),
			ctx.propertyScope,
		).eq("id", id);

		const { data: resultData, error } = await query;
		if (error) {
			return serviceFailure("backend-error");
		}

		return normalizeSingle({ ok: true, data: resultData as Guest | Guest[] });
	});
}

export async function purge(
	session: AppSession | null,
	id: string,
	deps?: GuestServiceDeps,
): Promise<ServiceResult<{ guest: Guest; blockingCount: number }>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("administrator", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const loadQuery = scopeOperationalQuery(
			from("guests").select("*"),
			ctx.propertyScope,
		).eq("id", id);
		const loaded = normalizeSingle(
			await executeServiceQuery<Guest | Guest[]>(loadQuery as never),
		);
		if (!loaded.ok) {
			return loaded;
		}
		if (loaded.data.deleted_at === null) {
			return serviceFailure("not-found");
		}

		const reservationRefsQuery = scopeOperationalQuery(
			from("reservations").select("id"),
			ctx.propertyScope,
		).eq("primary_guest_id", id);
		const refsResult = await executeServiceQuery<
			{ id: string } | { id: string }[]
		>(reservationRefsQuery as never);

		const blockingCount = refsResult.ok
			? Array.isArray(refsResult.data)
				? refsResult.data.length
				: refsResult.data
					? 1
					: 0
			: refsResult.error.code === "not-found"
				? 0
				: -1;

		if (blockingCount < 0) {
			return serviceFailure("backend-error");
		}
		if (blockingCount > 0) {
			return serviceFailure(
				"foreign-key-conflict",
				`guest-has-reservation-references:${blockingCount}`,
			);
		}

		const deleteQuery = scopeOperationalQuery(
			from("guests").delete(),
			ctx.propertyScope,
		).eq("id", id);
		const { error } = await deleteQuery;
		if (error) {
			return serviceFailure("backend-error");
		}

		return serviceSuccess({ guest: loaded.data, blockingCount: 0 });
	});
}

async function listByMode(
	session: AppSession | null,
	trash: boolean,
	params: GuestListParams,
	deps?: GuestServiceDeps,
): Promise<ServiceResult<GuestListResult>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (trash && (!ctx.profile || !canAccess("manager", ctx.profile.role))) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const page = normalizePage(params.page);
		const pageSize = normalizePageSize(params.pageSize);
		const rangeFrom = (page - 1) * pageSize;
		const rangeTo = rangeFrom + pageSize - 1;

		const activity = params.activity ?? "all";
		const openGuestIdsResult = await fetchOpenReservationGuestIds(
			from,
			ctx.propertyScope,
		);
		if (!openGuestIdsResult.ok) {
			return openGuestIdsResult;
		}

		let query = scopeOperationalQuery(
			from("guests").select("*"),
			ctx.propertyScope,
		).order("created_at", { ascending: false });

		if (!trash) {
			query = query.is("deleted_at", null);
		}

		const search = params.search?.trim();
		if (search) {
			const escaped = escapeLike(search);
			query = query.or(
				[
					`first_name.ilike.%${escaped}%`,
					`last_name.ilike.%${escaped}%`,
					`email.ilike.%${escaped}%`,
					`document_number.ilike.%${escaped}%`,
				].join(","),
			);
		}

		const response = await query;
		if (response.error) {
			return serviceFailure("backend-error");
		}

		const allRows = normalizeArray<Guest>(
			response.data as Guest | Guest[] | null | undefined,
		);
		const lifecycleScopedRows = trash
			? allRows.filter((guest) => guest.deleted_at !== null)
			: allRows;

		const openGuestSet = new Set(openGuestIdsResult.data);
		const activityFiltered = filterGuestsByActivity(
			lifecycleScopedRows,
			activity,
			openGuestSet,
		);
		const guests = activityFiltered.slice(rangeFrom, rangeTo + 1);
		return serviceSuccess({
			guests,
			page,
			pageSize,
			total: activityFiltered.length,
		});
	});
}

async function fetchOpenReservationGuestIds(
	from: GuestServiceDeps["from"],
	propertyScope: { readonly propertyId: string },
): Promise<ServiceResult<string[]>> {
	const today = new Date().toISOString().slice(0, 10);
	const reservationsQuery = scopeOperationalQuery(
		from("reservations").select("primary_guest_id"),
		propertyScope,
	)
		.is("deleted_at", null)
		.in("status", ACTIVE_RESERVATION_STATUSES)
		.gte("planned_check_out_date", today);

	const result = await executeServiceQuery<
		{ primary_guest_id: string | null } | { primary_guest_id: string | null }[]
	>(reservationsQuery as never);

	if (!result.ok) {
		if (result.error.code === "not-found") {
			return serviceSuccess([]);
		}
		return serviceFailure("backend-error");
	}

	const rows = normalizeArray(result.data);
	const ids = rows
		.map((row) => row.primary_guest_id)
		.filter((id): id is string => Boolean(id));

	return serviceSuccess(Array.from(new Set(ids)));
}

function filterGuestsByActivity(
	guests: Guest[],
	activity: GuestActivityFilter,
	openGuestSet: Set<string>,
): Guest[] {
	if (activity === "withOpenReservations") {
		return guests.filter((guest) => openGuestSet.has(guest.id));
	}
	if (activity === "withoutOpenReservations") {
		return guests.filter((guest) => !openGuestSet.has(guest.id));
	}
	return guests;
}

function normalizeSingle(
	result: ServiceResult<Guest | Guest[]>,
): ServiceResult<Guest> {
	if (!result.ok) {
		return result;
	}
	if (!Array.isArray(result.data)) {
		return result.data
			? serviceSuccess(result.data)
			: serviceFailure("not-found");
	}
	const [first] = result.data;
	return first ? serviceSuccess(first) : serviceFailure("not-found");
}

function normalizeArray<T>(value: T | T[] | null | undefined): T[] {
	if (!value) {
		return [];
	}
	return Array.isArray(value) ? value : [value];
}

function isResultEmpty(value: unknown): boolean {
	if (value == null) {
		return true;
	}
	return Array.isArray(value) ? value.length === 0 : false;
}

function normalizePage(page: number | undefined): number {
	if (!page || page < 1) {
		return 1;
	}
	return Math.floor(page);
}

function normalizePageSize(pageSize: number | undefined): number {
	if (!pageSize || pageSize < 1) {
		return DEFAULT_PAGE_SIZE;
	}
	return Math.floor(pageSize);
}

function escapeLike(value: string): string {
	return value.replace(/[%_]/g, "");
}

function resolveFrom(deps?: GuestServiceDeps): GuestServiceDeps["from"] {
	if (deps?.from) {
		return deps.from;
	}

	const client = createInsForgeClient();
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			GuestServiceDeps["from"]
		>;
}
