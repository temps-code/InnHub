export type AuthUser = {
	readonly id: string;
	readonly email?: string;
};

export type AppProfileRole =
	| "administrator"
	| "manager"
	| "receptionist"
	| "housekeeping"
	| "maintenance"
	| "any";

export type AppProfileStatus = "active" | "inactive";

export type AppProfile = {
	readonly id: string;
	readonly authUserId: string;
	readonly propertyId: string;
	readonly role: AppProfileRole;
	readonly status: AppProfileStatus;
	readonly fullName?: string | null;
};

export type AppSession = {
	readonly user: AuthUser;
	readonly profile: AppProfile;
	readonly propertyId: string;
};

export type InvalidSessionReason =
	| "missing-profile"
	| "inactive-profile"
	| "missing-property"
	| "auth-error"
	| "profile-error"
	| "configuration-error";

export type AuthSessionState =
	| { readonly status: "loading" }
	| { readonly status: "unauthenticated" }
	| { readonly status: "authenticated"; readonly session: AppSession }
	| { readonly status: "invalid"; readonly reason: InvalidSessionReason };

export type LoginCredentials = {
	readonly email: string;
	readonly password: string;
};

export type LoginResult =
	| { readonly ok: true; readonly session: AppSession }
	| { readonly ok: false; readonly message: string };

export type AuthGatewayError = {
	readonly message: string;
	readonly raw?: unknown;
};

export type AuthGatewayResult<T> =
	| { readonly data: T; readonly error: null }
	| { readonly data: null; readonly error: AuthGatewayError };
