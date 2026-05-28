import { canAccess } from "../../app/routes/routeMetadata";
import { executeServiceQuery } from "../../shared/services/serviceResult";
import { withServiceContext } from "../../shared/services/serviceContext";
import { scopeOperationalQuery, assignPropertyOwnership } from "../../shared/services/propertyScope";
import { createInsForgeClient } from "../../shared/services/insforgeClient";
import { serviceFailure } from "../../shared/services/serviceResult";
import type { ServiceResult } from "../../shared/services/serviceResult";
import type { AppSession } from "../auth/types";
import type { RoomType, RoomTypeFormData } from "./types";

// ── Minimal query interface for dependency injection ───────────────────

export interface RoomTypeServiceDeps {
	readonly from: (table: string) => {
		readonly select: (columns: string) => RoomTypeServiceDepsQuery;
		readonly insert: (data: unknown) => RoomTypeServiceDepsQuery;
		readonly update: (data: unknown) => RoomTypeServiceDepsQuery;
	};
}

export interface RoomTypeServiceDepsQuery {
	readonly eq: (column: string, value: string) => this;
	readonly is: (column: string, value: string | null) => this;
	readonly select: () => this;
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
	deps?: RoomTypeServiceDeps,
): Promise<ServiceResult<RoomType[]>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = scopeOperationalQuery(
			from("room_types").select("*"),
			ctx.propertyScope,
		).is("deleted_at", null);
		return executeServiceQuery<RoomType[]>(query as never);
	});
}

export async function getById(
	session: AppSession | null,
	id: string,
	deps?: RoomTypeServiceDeps,
): Promise<ServiceResult<RoomType>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = scopeOperationalQuery(
			from("room_types").select("*"),
			ctx.propertyScope,
		).is("deleted_at", null).eq("id", id);

		const result = await executeServiceQuery<RoomType | RoomType[]>(
			query as never,
		);
		return normalizeSingle(result);
	});
}

export async function create(
	session: AppSession | null,
	data: RoomTypeFormData,
	deps?: RoomTypeServiceDeps,
): Promise<ServiceResult<RoomType>> {
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

		const query = from("room_types").insert(ownership.value).select();
		const { data: resultData, error } = await query;

		if (error) {
			return handleDatabaseError(error);
		}

		return normalizeSingle({ ok: true, data: resultData as RoomType | RoomType[] });
	});
}

export async function update(
	session: AppSession | null,
	id: string,
	data: RoomTypeFormData,
	deps?: RoomTypeServiceDeps,
): Promise<ServiceResult<RoomType>> {
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
			from("room_types").update(updateData).select(),
			ctx.propertyScope,
		).is("deleted_at", null).eq("id", id);

		const { data: resultData, error } = await query;

		if (error) {
			return handleDatabaseError(error);
		}

		return normalizeSingle({ ok: true, data: resultData as RoomType | RoomType[] });
	});
}

export async function softDelete(
	session: AppSession | null,
	id: string,
	deps?: RoomTypeServiceDeps,
): Promise<ServiceResult<RoomType>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (serviceCtx) => {
		const ctx = { ...serviceCtx, profile: session?.profile };
		if (!ctx.profile || !canAccess("manager", ctx.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}

		const query = scopeOperationalQuery(
			from("room_types").update({ deleted_at: new Date().toISOString() }).select(),
			ctx.propertyScope,
		).is("deleted_at", null).eq("id", id);

		const { data: resultData, error } = await query;

		if (error) {
			return handleDatabaseError(error);
		}

		return normalizeSingle({ ok: true, data: resultData as RoomType | RoomType[] });
	});
}

// ── Internal helpers ────────────────────────────────────────────────────

function normalizeSingle(
	result: ServiceResult<RoomType | RoomType[]>,
): ServiceResult<RoomType> {
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

function handleDatabaseError(error: unknown): ServiceResult<never> {
	const err = error as { code?: string; message?: string };

	if (err.code === "23505") {
		return serviceFailure(
			"validation-error",
			"A room type with this name already exists.",
		);
	}

	return serviceFailure("backend-error");
}

function resolveFrom(deps?: RoomTypeServiceDeps): RoomTypeServiceDeps["from"] {
	if (deps?.from) {
		return deps.from;
	}

	const client = createInsForgeClient();
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			RoomTypeServiceDeps["from"]
		>;
}
