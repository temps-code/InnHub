import { executeServiceQuery } from "../../shared/services/serviceResult";
import { withServiceContext } from "../../shared/services/serviceContext";
import { scopeCurrentPropertyQuery } from "../../shared/services/propertyScope";
import { createInsForgeClient } from "../../shared/services/insforgeClient";
import type { ServiceResult } from "../../shared/services/serviceResult";
import type { AppSession } from "../auth/types";
import type { Property, PropertyFormData } from "./types";

// ── Minimal query interface for dependency injection ───────────────────
// Satisfies both EqQuery (for scopeCurrentPropertyQuery) and ServiceQuery
// (for executeServiceQuery) so tests can inject a fake.

export interface PropertyServiceDeps {
	readonly from: (table: string) => {
		readonly select: (columns: string) => PropertyServiceDepsQuery;
		readonly update: (data: unknown) => PropertyServiceDepsQuery;
	};
}

export interface PropertyServiceDepsQuery {
	readonly eq: (column: string, value: string) => this;
	readonly then: <TResult>(
		onfulfilled?: (value: {
			readonly data: unknown;
			readonly error: unknown;
		}) => TResult | PromiseLike<TResult>,
		onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
	) => Promise<TResult>;
}

// ── Public API ──────────────────────────────────────────────────────────

export async function getCurrentProperty(
	session: AppSession | null,
	deps?: PropertyServiceDeps,
): Promise<ServiceResult<Property>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = scopeCurrentPropertyQuery(
			from("properties").select("*"),
			ctx.propertyScope,
		);
		const result = await executeServiceQuery<Property | Property[]>(
			query as never,
		);
		return normalizeSinglePropertyResult(result);
	});
}

export async function updateCurrentProperty(
	session: AppSession | null,
	data: PropertyFormData,
	deps?: PropertyServiceDeps,
): Promise<ServiceResult<Property>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = from("properties")
			.update(data)
			.eq("id", ctx.propertyScope.propertyId);
		const result = await executeServiceQuery<Property | Property[]>(
			query as never,
		);

		if (result.ok) {
			return normalizeSinglePropertyResult(result);
		}

		// InsForge updates may succeed without returning a row payload.
		// In that case, re-read the scoped property so the caller gets the
		// updated object and the UI does not treat a successful update as a
		// not-found failure.
		if (result.error.code === "not-found") {
			return getCurrentProperty(session, deps);
		}

		return result;
	});
}

// ── Internal helpers ────────────────────────────────────────────────────

function normalizeSinglePropertyResult(
	result: ServiceResult<Property | Property[]>,
): ServiceResult<Property> {
	if (!result.ok) {
		return result;
	}

	if (!Array.isArray(result.data)) {
		return { ok: true, data: result.data };
	}

	const [property] = result.data;
	if (!property) {
		return {
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		};
	}

	return { ok: true, data: property };
}

function resolveFrom(deps?: PropertyServiceDeps): PropertyServiceDeps["from"] {
	if (deps?.from) {
		return deps.from;
	}

	const client = createInsForgeClient();
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			PropertyServiceDeps["from"]
		>;
}
