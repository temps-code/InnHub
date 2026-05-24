import type { InsForgeClient } from "@insforge/sdk";

import { createInsForgeClient } from "../../../shared/services/insforgeClient";
import type {
	AppProfile,
	AppProfileRole,
	AppProfileStatus,
	AuthGatewayError,
	AuthUser,
	LoginCredentials,
} from "../types";
import type { AuthSessionGateway } from "./authSessionService";

type InsForgeUserLike = {
	readonly id?: unknown;
	readonly email?: unknown;
};

type SignInResponseLike = {
	readonly user?: InsForgeUserLike | null;
};

type ProfileRow = {
	readonly id?: unknown;
	readonly auth_user_id?: unknown;
	readonly property_id?: unknown;
	readonly role?: unknown;
	readonly status?: unknown;
	readonly full_name?: unknown;
};

type QueryResult = {
	readonly data: ProfileRow | ProfileRow[] | null;
	readonly error: unknown;
};

const allowedRoles = new Set<AppProfileRole>([
	"administrator",
	"manager",
	"receptionist",
	"housekeeping",
	"maintenance",
]);

const allowedStatuses = new Set<AppProfileStatus>(["active", "inactive"]);

function toGatewayError(error: unknown, fallback: string): AuthGatewayError {
	if (error instanceof Error && error.message) {
		return { message: error.message, raw: error };
	}

	if (typeof error === "object" && error !== null && "message" in error) {
		const message = (error as { readonly message?: unknown }).message;
		if (typeof message === "string" && message) {
			return { message, raw: error };
		}
	}

	return { message: fallback, raw: error };
}

function normalizeUser(
	user: InsForgeUserLike | null | undefined,
): AuthUser | null {
	if (!user || typeof user.id !== "string" || !user.id) {
		return null;
	}

	return {
		id: user.id,
		email: typeof user.email === "string" ? user.email : undefined,
	};
}

function normalizeProfile(row: ProfileRow | null): AppProfile | null {
	if (!row) {
		return null;
	}

	const role = row.role;
	const status = row.status;

	if (
		typeof row.id !== "string" ||
		typeof row.auth_user_id !== "string" ||
		typeof row.property_id !== "string" ||
		typeof role !== "string" ||
		typeof status !== "string" ||
		!allowedRoles.has(role as AppProfileRole) ||
		!allowedStatuses.has(status as AppProfileStatus)
	) {
		return null;
	}

	return {
		id: row.id,
		authUserId: row.auth_user_id,
		propertyId: row.property_id,
		role: role as AppProfileRole,
		status: status as AppProfileStatus,
		fullName: typeof row.full_name === "string" ? row.full_name : null,
	};
}

export function createInsForgeAuthSessionGateway(
	client: InsForgeClient = createInsForgeClient(),
): AuthSessionGateway {
	return {
		async signInWithPassword(credentials: LoginCredentials) {
			const { data, error } = await client.auth.signInWithPassword(credentials);

			if (error) {
				return { data: null, error: toGatewayError(error, "Sign in failed.") };
			}

			const user = normalizeUser((data as SignInResponseLike | null)?.user);

			if (!user) {
				return {
					data: null,
					error: { message: "Sign in did not return an authenticated user." },
				};
			}

			return { data: user, error: null };
		},

		async getCurrentUser() {
			const { data, error } = await client.auth.getCurrentUser();

			if (error) {
				return {
					data: null,
					error: toGatewayError(error, "Current user lookup failed."),
				};
			}

			return { data: normalizeUser(data.user), error: null };
		},

		async signOut() {
			const { error } = await client.auth.signOut();

			if (error) {
				return { data: null, error: toGatewayError(error, "Sign out failed.") };
			}

			return { data: undefined, error: null };
		},

		async findProfileByAuthUserId(authUserId: string) {
			const query = client.database
				.from("profiles")
				.select("id, auth_user_id, property_id, role, status, full_name")
				.eq("auth_user_id", authUserId)
				.limit(1);
			const { data, error } = (await query) as QueryResult;

			if (error) {
				return {
					data: null,
					error: toGatewayError(error, "Profile lookup failed."),
				};
			}

			const row = Array.isArray(data) ? (data[0] ?? null) : data;
			return { data: normalizeProfile(row), error: null };
		},
	};
}
