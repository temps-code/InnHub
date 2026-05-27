import { executeServiceQuery } from "../../shared/services/serviceResult";
import { withServiceContext } from "../../shared/services/serviceContext";
import { scopeCurrentPropertyQuery } from "../../shared/services/propertyScope";
import { createInsForgeClient } from "../../shared/services/insforgeClient";
import { serviceSuccess, serviceFailure } from "../../shared/services/serviceResult";
import type { ServiceResult } from "../../shared/services/serviceResult";
import type { AppSession } from "../auth/types";
import type { ProfileData } from "./types";

// ── Minimal query interface for dependency injection ───────────────────

export interface ProfileServiceDeps {
	readonly from: (table: string) => {
		readonly select: (columns: string) => ProfileServiceDepsQuery;
		readonly update: (data: unknown) => ProfileServiceDepsQuery;
	};
}

export interface ProfileServiceDepsQuery {
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

export async function getProfileData(
	session: AppSession | null,
	deps?: ProfileServiceDeps,
): Promise<ServiceResult<ProfileData>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const query = scopeCurrentPropertyQuery(
			from("properties").select("name"),
			ctx.propertyScope,
		);
		const propertyResult = await executeServiceQuery<
			{ readonly name: string } | ReadonlyArray<{ readonly name: string }>
		>(query as never);

		let propertyName: string | null = null;

		if (propertyResult.ok) {
			const raw = propertyResult.data;
			const record = Array.isArray(raw) ? raw[0] : raw;
			propertyName = record?.name ?? null;
		}

		// Fallback: if property name could not be resolved, show the raw
		// propertyId so the user still knows which property they are in.
		if (!propertyName) {
			propertyName = session!.propertyId;
		}

		return serviceSuccess({
			fullName: session!.profile.fullName ?? null,
			email: session!.user.email ?? "",
			role: session!.profile.role,
			propertyName,
		});
	});
}

export async function updateProfileFullName(
	session: AppSession | null,
	fullName: string,
	deps?: ProfileServiceDeps,
): Promise<ServiceResult<null>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (_ctx) => {
		const query = from("profiles")
			.update({ fullName })
			.eq("id", session!.profile.id);
		const result = await executeServiceQuery<unknown>(query as never);

		// The update DML may succeed without returning a row payload.
		// Treat not-found (null data) as success — the write went through.
		if (!result.ok && result.error.code !== "not-found") {
			return serviceFailure(result.error.code);
		}

		return serviceSuccess<null>(null);
	});
}

// ── Internal helpers ────────────────────────────────────────────────────

function resolveFrom(
	deps?: ProfileServiceDeps,
): ProfileServiceDeps["from"] {
	if (deps?.from) {
		return deps.from;
	}

	const client = createInsForgeClient();
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			ProfileServiceDeps["from"]
		>;
}
