import type {
	AppProfile,
	AuthGatewayResult,
	AuthSessionState,
	AuthUser,
	LoginCredentials,
	LoginResult,
} from "../types";

export type AuthSessionGateway = {
	readonly signInWithPassword: (
		credentials: LoginCredentials,
	) => Promise<AuthGatewayResult<AuthUser>>;
	readonly getCurrentUser: () => Promise<AuthGatewayResult<AuthUser | null>>;
	readonly signOut: () => Promise<AuthGatewayResult<void>>;
	readonly findProfileByAuthUserId: (
		authUserId: string,
	) => Promise<AuthGatewayResult<AppProfile | null>>;
};

const fallbackLoginError = "Unable to sign in with those credentials.";

export async function buildAppSession(
	gateway: AuthSessionGateway,
): Promise<AuthSessionState> {
	const userResult = await gateway.getCurrentUser();

	if (userResult.error) {
		return { status: "invalid", reason: "auth-error" };
	}

	if (!userResult.data) {
		return { status: "unauthenticated" };
	}

	return buildAppSessionForUser(gateway, userResult.data);
}

export async function buildAppSessionForUser(
	gateway: AuthSessionGateway,
	user: AuthUser,
): Promise<AuthSessionState> {
	const profileResult = await gateway.findProfileByAuthUserId(user.id);

	if (profileResult.error) {
		return { status: "invalid", reason: "profile-error" };
	}

	const profile = profileResult.data;

	if (!profile) {
		return { status: "invalid", reason: "missing-profile" };
	}

	if (profile.status !== "active") {
		return { status: "invalid", reason: "inactive-profile" };
	}

	const propertyId = profile.propertyId.trim();

	if (!propertyId) {
		return { status: "invalid", reason: "missing-property" };
	}

	return {
		status: "authenticated",
		session: {
			user,
			profile,
			propertyId,
		},
	};
}

export async function loginWithPassword(
	gateway: AuthSessionGateway,
	credentials: LoginCredentials,
): Promise<LoginResult> {
	const signInResult = await gateway.signInWithPassword(credentials);

	if (signInResult.error) {
		return {
			ok: false,
			message: signInResult.error.message || fallbackLoginError,
		};
	}

	const sessionState = await buildAppSessionForUser(gateway, signInResult.data);

	if (sessionState.status !== "authenticated") {
		return {
			ok: false,
			message: "Your account is not linked to an active InnHub profile.",
		};
	}

	return { ok: true, session: sessionState.session };
}

export async function logout(
	gateway: AuthSessionGateway,
): Promise<AuthSessionState> {
	const signOutResult = await gateway.signOut();

	if (signOutResult.error) {
		return { status: "invalid", reason: "auth-error" };
	}

	return { status: "unauthenticated" };
}
