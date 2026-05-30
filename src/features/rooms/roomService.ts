import { canAccess } from "../../app/routes/routeMetadata";
import { executeServiceQuery } from "../../shared/services/serviceResult";
import { withServiceContext } from "../../shared/services/serviceContext";
import { scopeOperationalQuery, assignPropertyOwnership } from "../../shared/services/propertyScope";
import { createInsForgeClient } from "../../shared/services/insforgeClient";
import { serviceFailure, serviceSuccess } from "../../shared/services/serviceResult";
import type { ServiceResult } from "../../shared/services/serviceResult";
import type { AppSession } from "../auth/types";
import type { Room, RoomFormData, RoomFilters } from "./types";

// ── Minimal query interface for dependency injection ───────────────────

export interface RoomServiceDeps {
	readonly from: (table: string) => {
		readonly select: (columns: string) => RoomServiceDepsQuery;
		readonly insert: (data: unknown) => RoomServiceDepsQuery;
		readonly update: (data: unknown) => RoomServiceDepsQuery;
		readonly "delete": () => RoomServiceDepsDeleteQuery;
	};
}

export interface RoomServiceDepsQuery {
	readonly eq: (column: string, value: string) => this;
	readonly is: (column: string, value: string | null) => this;
	readonly neq: (column: string, value: unknown) => this;
	readonly in: (column: string, values: string[]) => this;
	readonly select: () => this;
	readonly then: <TResult>(
		onfulfilled?: (value: {
			readonly data: unknown;
			readonly error: unknown;
		}) => TResult | PromiseLike<TResult>,
		onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
	) => Promise<TResult>;
}

export interface RoomServiceDepsDeleteQuery {
	readonly eq: (column: string, value: string) => RoomServiceDepsQuery;
	readonly then: <TResult>(
		onfulfilled?: (value: {
			readonly data: unknown;
			readonly error: unknown;
		}) => TResult | PromiseLike<TResult>,
		onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
	) => Promise<TResult>;
}

// ── Public API ──────────────────────────────────────────────────────────

export async function list(
	session: AppSession | null,
	filters?: RoomFilters,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room[]>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = scopeOperationalQuery(
			from("rooms").select("*"),
			ctx.propertyScope,
		).is("deleted_at", null);
		const result = await executeServiceQuery<Room[]>(query as never);

		if (!result.ok) {
			return result;
		}

		let rooms = result.data;

		if (filters?.status) {
			rooms = rooms.filter((r) => r.state === filters.status);
		}

		if (filters?.room_type_id) {
			rooms = rooms.filter((r) => r.room_type_id === filters.room_type_id);
		}

		if (filters?.search) {
			const term = filters.search.toLowerCase();
			rooms = rooms.filter(
				(r) =>
					r.identifier.toLowerCase().includes(term) ||
					(r.description?.toLowerCase().includes(term) ?? false),
			);
		}

		return serviceSuccess(rooms);
	});
}

export async function getById(
	session: AppSession | null,
	id: string,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = scopeOperationalQuery(
			from("rooms").select("*"),
			ctx.propertyScope,
		).is("deleted_at", null).eq("id", id);

		const result = await executeServiceQuery<Room | Room[]>(
			query as never,
		);
		return normalizeSingle(result);
	});
}

export async function create(
	session: AppSession | null,
	data: RoomFormData,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const ownership = assignPropertyOwnership(data, ctx.propertyScope);
		if (!ownership.ok) {
			return serviceFailure("property-scope-error");
		}

		const query = from("rooms").insert(ownership.value).select();
		const { data: resultData, error } = await query;

		if (error) {
			return handleDatabaseError(error);
		}

		return normalizeSingle({ ok: true, data: resultData as Room | Room[] });
	});
}

export async function update(
	session: AppSession | null,
	id: string,
	data: RoomFormData,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const ownership = assignPropertyOwnership(data, ctx.propertyScope);
		if (!ownership.ok) {
			return serviceFailure("property-scope-error");
		}

		const updateData = { ...ownership.value };
		delete (updateData as Record<string, unknown>).property_id; // prevent setting partition key
		const query = scopeOperationalQuery(
			from("rooms").update(updateData).select(),
			ctx.propertyScope,
		).is("deleted_at", null).eq("id", id);

		const { data: resultData, error } = await query;

		if (error) {
			return handleDatabaseError(error);
		}

		return normalizeSingle({ ok: true, data: resultData as Room | Room[] });
	});
}

export async function softDelete(
	session: AppSession | null,
	id: string,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		// Load the room first
		const loadQuery = scopeOperationalQuery(
			from("rooms").select("*"),
			ctx.propertyScope,
		).is("deleted_at", null).eq("id", id);

		const loadResult = await executeServiceQuery<Room | Room[]>(
			loadQuery as never,
		);
		const loaded = normalizeSingle(loadResult);

		if (!loaded.ok) {
			return loaded;
		}

		// Check for active reservations via reservation_items (which has room_id)
		// A room is blocked if it has reservation_items linked to reservations
		// with status IN ('confirmed','checked_in') and planned_check_out_date >= today
		const reservationItemsQuery = scopeOperationalQuery(
			from("reservation_items").select("id, reservation_id"),
			ctx.propertyScope,
		).eq("room_id", id).is("deleted_at", null);

		const reservationItemsResult = await executeServiceQuery<
			{ id: string; reservation_id: string } | { id: string; reservation_id: string }[]
		>(reservationItemsQuery as never);

		if (reservationItemsResult.ok && !isResultEmpty(reservationItemsResult.data)) {
			const items = Array.isArray(reservationItemsResult.data)
				? reservationItemsResult.data
				: [reservationItemsResult.data];

			// Batch-query all linked reservations to avoid N+1
			const reservationIds = [...new Set(items.map((item) => item.reservation_id))];

			const reservationQuery = scopeOperationalQuery(
				from("reservations").select("id, status, planned_check_out_date"),
				ctx.propertyScope,
			).is("deleted_at", null);

			// Apply .in filter via the query interface
			const inQuery = (reservationQuery as RoomServiceDepsQuery).in("id", reservationIds);
			const reservationResult = await executeServiceQuery<
				{ id: string; status: string; planned_check_out_date: string } | { id: string; status: string; planned_check_out_date: string }[]
			>(inQuery as never);

			if (!reservationResult.ok) {
				return serviceFailure("backend-error");
			}

			if (!isResultEmpty(reservationResult.data)) {
				const reservations = Array.isArray(reservationResult.data)
					? reservationResult.data
					: [reservationResult.data];

				const today = new Date().toISOString().split("T")[0];
				const hasActive = reservations.some(
					(r) =>
						(r.status === "confirmed" || r.status === "checked_in") &&
						r.planned_check_out_date >= today,
				);

				if (hasActive) {
					return serviceFailure(
						"validation-error",
						"Cannot delete room with active reservations",
					);
				}
			}
		}

		// Soft delete
		const query = scopeOperationalQuery(
			from("rooms").update({ deleted_at: new Date().toISOString() }).select(),
			ctx.propertyScope,
		).is("deleted_at", null).eq("id", id);

		const { data: resultData, error } = await query;

		if (error) {
			return handleDatabaseError(error);
		}

		return normalizeSingle({ ok: true, data: resultData as Room | Room[] });
	});
}

export async function listArchived(
	session: AppSession | null,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room[]>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const query = scopeOperationalQuery(
			from("rooms").select("*"),
			ctx.propertyScope,
		);
		const result = await executeServiceQuery<Room[]>(query as never);

		if (!result.ok) {
			return result;
		}

		const archived = result.data.filter((r) => r.deleted_at !== null);
		return serviceSuccess(archived);
	});
}

export async function restore(
	session: AppSession | null,
	id: string,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		// Load the record — must be soft-deleted (deleted_at IS NOT NULL)
		const loadQuery = scopeOperationalQuery(
			from("rooms").select("*"),
			ctx.propertyScope,
		).eq("id", id);

		const loadResult = await executeServiceQuery<Room | Room[]>(
			loadQuery as never,
		);
		const loaded = normalizeSingle(loadResult);

		if (!loaded.ok) {
			return loaded;
		}

		if (loaded.data.deleted_at === null) {
			return serviceFailure("not-found");
		}

		// Check for duplicate active identifier
		const duplicateQuery = scopeOperationalQuery(
			from("rooms").select("id"),
			ctx.propertyScope,
		).eq("identifier", loaded.data.identifier).is("deleted_at", null);

		const duplicateResult = await executeServiceQuery<Room | Room[]>(
			duplicateQuery as never,
		);

		if (duplicateResult.ok && !isResultEmpty(duplicateResult.data)) {
			return serviceFailure(
				"validation-error",
				"A room with this identifier already exists.",
			);
		}

		// Restore: set deleted_at = null
		const updateQuery = scopeOperationalQuery(
			from("rooms").update({ deleted_at: null }).select(),
			ctx.propertyScope,
		).eq("id", id);

		const { data: resultData, error } = await updateQuery;

		if (error) {
			return handleDatabaseError(error);
		}

		return normalizeSingle({ ok: true, data: resultData as Room | Room[] });
	});
}

export async function purge(
	session: AppSession | null,
	id: string,
	deps?: RoomServiceDeps,
): Promise<ServiceResult<Room>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		// Load the record — must be soft-deleted (deleted_at IS NOT NULL)
		const loadQuery = scopeOperationalQuery(
			from("rooms").select("*"),
			ctx.propertyScope,
		).eq("id", id);

		const loadResult = await executeServiceQuery<Room | Room[]>(
			loadQuery as never,
		);
		const loaded = normalizeSingle(loadResult);

		if (!loaded.ok) {
			return loaded;
		}

		if (loaded.data.deleted_at === null) {
			return serviceFailure("not-found");
		}

		// Check reservation_items FK (reservation_items has room_id)
		const reservationItemsQuery = scopeOperationalQuery(
			from("reservation_items").select("id"),
			ctx.propertyScope,
		).eq("room_id", id).is("deleted_at", null);

		const reservationItemsResult = await executeServiceQuery<{ id: string } | { id: string }[]>(
			reservationItemsQuery as never,
		);

		if (reservationItemsResult.ok && !isResultEmpty(reservationItemsResult.data)) {
			return serviceFailure(
				"foreign-key-conflict",
				"This record is referenced by other data and cannot be deleted.",
			);
		}

		// Physical delete
		const deleteQuery = scopeOperationalQuery(
			from("rooms").delete(),
			ctx.propertyScope,
		).eq("id", id);

		const { error } = await deleteQuery;

		if (error) {
			return handleDatabaseError(error);
		}

		return serviceSuccess(loaded.data);
	});
}

// ── Internal helpers ────────────────────────────────────────────────────

function normalizeSingle(
	result: ServiceResult<Room | Room[]>,
): ServiceResult<Room> {
	if (!result.ok) {
		return result;
	}

	if (result.data === null || result.data === undefined) {
		return serviceFailure("not-found");
	}

	if (!Array.isArray(result.data)) {
		return { ok: true, data: result.data };
	}

	const [record] = result.data;
	if (!record) {
		return serviceFailure("not-found");
	}

	return { ok: true, data: record };
}

function isResultEmpty(data: unknown): boolean {
	if (data === null || data === undefined) {
		return true;
	}

	if (Array.isArray(data)) {
		return data.length === 0;
	}

	return false;
}

function handleDatabaseError(error: unknown): ServiceResult<never> {
	const err = error as { code?: string; message?: string };

	if (err.code === "23505") {
		return serviceFailure(
			"validation-error",
			"A room with this identifier already exists.",
		);
	}

	return serviceFailure("backend-error");
}

function resolveFrom(deps?: RoomServiceDeps): RoomServiceDeps["from"] {
	if (deps?.from) {
		return deps.from;
	}

	const client = createInsForgeClient();
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			RoomServiceDeps["from"]
		>;
}
