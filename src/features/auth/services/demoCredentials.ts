import type { AppProfileRole, LoginCredentials } from "../types";

type DemoCredentialEnv = Readonly<Record<string, string | undefined>>;

export type DemoCredentialsResult =
	| { readonly status: "available"; readonly credentials: LoginCredentials }
	| { readonly status: "unavailable" };

export type DemoAccount = {
	readonly role: AppProfileRole;
	readonly email: string;
	readonly password: string;
};

const DEMO_ACCOUNTS: readonly DemoAccount[] = [
	{
		role: "administrator",
		email: "admin+tarija-admin@innhub.dev",
		password: "Demo123!",
	},
	{
		role: "manager",
		email: "admin+tarija-manager@innhub.dev",
		password: "Demo123!",
	},
	{
		role: "receptionist",
		email: "admin+tarija-reception@innhub.dev",
		password: "Demo123!",
	},
	{
		role: "housekeeping",
		email: "admin+tarija-housekeep@innhub.dev",
		password: "Demo123!",
	},
	{
		role: "maintenance",
		email: "admin+tarija-maintenance@innhub.dev",
		password: "Demo123!",
	},
];

/** Returns credentials for the given role, or undefined if not configured. */
export function getDemoAccount(
	role: AppProfileRole,
): LoginCredentials | undefined {
	const account = DEMO_ACCOUNTS.find((a) => a.role === role);
	return account
		? { email: account.email, password: account.password }
		: undefined;
}

/** Returns all configured demo accounts. */
export function getAllDemoAccounts(): readonly DemoAccount[] {
	return DEMO_ACCOUNTS;
}

export function resolveDemoCredentials(
	env?: DemoCredentialEnv,
): DemoCredentialsResult {
	const source = env ?? import.meta.env;
	const email = source.VITE_DEMO_LOGIN_EMAIL?.trim();
	const password = source.VITE_DEMO_LOGIN_PASSWORD?.trim();

	if (!email || !password) {
		return { status: "unavailable" };
	}

	return {
		status: "available",
		credentials: { email, password },
	};
}
