import { describe, expect, it } from "vitest";

import {
	buildAppSession,
	loginWithPassword,
	logout,
	type AuthSessionGateway,
} from "../services/authSessionService";
import type { AppProfile, AuthGatewayResult, AuthUser } from "../types";

const authUser: AuthUser = {
	id: "auth-user-1",
	email: "frontdesk@innhub.test",
};

const activeProfile: AppProfile = {
	id: "profile-1",
	authUserId: authUser.id,
	propertyId: "property-1",
	role: "receptionist",
	status: "active",
	fullName: "Front Desk",
};

function ok<T>(data: T): AuthGatewayResult<T> {
	return { data, error: null };
}

function fail<T>(message: string, raw?: unknown): AuthGatewayResult<T> {
	return { data: null, error: { message, raw } };
}

function createGateway(
	overrides: Partial<AuthSessionGateway> = {},
): AuthSessionGateway {
	return {
		getCurrentUser: async () => ok(null),
		findProfileByAuthUserId: async () => ok(null),
		signInWithPassword: async () => ok(authUser),
		signOut: async () => ok(undefined),
		...overrides,
	};
}

describe("auth session service", () => {
	it("returns unauthenticated when no current user exists", async () => {
		await expect(buildAppSession(createGateway())).resolves.toEqual({
			status: "unauthenticated",
		});
	});

	it("builds an authenticated app session with a profile and property", async () => {
		const state = await buildAppSession(
			createGateway({
				getCurrentUser: async () => ok(authUser),
				findProfileByAuthUserId: async () => ok(activeProfile),
			}),
		);

		expect(state).toEqual({
			status: "authenticated",
			session: {
				user: authUser,
				profile: activeProfile,
				propertyId: activeProfile.propertyId,
			},
		});
	});

	it("marks the session invalid when the linked profile is missing", async () => {
		await expect(
			buildAppSession(
				createGateway({
					getCurrentUser: async () => ok(authUser),
					findProfileByAuthUserId: async () => ok(null),
				}),
			),
		).resolves.toEqual({ status: "invalid", reason: "missing-profile" });
	});

	it("marks the session invalid when the linked profile is inactive", async () => {
		await expect(
			buildAppSession(
				createGateway({
					getCurrentUser: async () => ok(authUser),
					findProfileByAuthUserId: async () =>
						ok({ ...activeProfile, status: "inactive" }),
				}),
			),
		).resolves.toEqual({ status: "invalid", reason: "inactive-profile" });
	});

	it("marks the session invalid when the linked profile has no property", async () => {
		await expect(
			buildAppSession(
				createGateway({
					getCurrentUser: async () => ok(authUser),
					findProfileByAuthUserId: async () =>
						ok({ ...activeProfile, propertyId: "  " }),
				}),
			),
		).resolves.toEqual({ status: "invalid", reason: "missing-property" });
	});

	it("returns a UI-safe login error without leaking raw token payloads", async () => {
		const result = await loginWithPassword(
			createGateway({
				signInWithPassword: async () =>
					fail("Invalid credentials", {
						access_token: "secret-token",
						jwt: "secret-jwt",
					}),
			}),
			{ email: "frontdesk@innhub.test", password: "bad-password" },
		);

		expect(result).toEqual({ ok: false, message: "Invalid credentials" });
		expect(JSON.stringify(result)).not.toContain("secret-token");
		expect(JSON.stringify(result)).not.toContain("secret-jwt");
	});

	it("keeps the session invalid when the auth boundary cannot sign out", async () => {
		await expect(
			logout(
				createGateway({
					signOut: async () =>
						fail("Sign out failed", { access_token: "secret-token" }),
				}),
			),
		).resolves.toEqual({ status: "invalid", reason: "auth-error" });
	});
});
