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
	{ role: "administrator", email: "admin@innhub.test", password: "demo-admin" },
	{ role: "manager", email: "manager@innhub.test", password: "demo-manager" },
	{
		role: "receptionist",
		email: "receptionist@innhub.test",
		password: "demo-receptionist",
	},
	{
		role: "housekeeping",
		email: "housekeeping@innhub.test",
		password: "demo-housekeeping",
	},
	{
		role: "maintenance",
		email: "maintenance@innhub.test",
		password: "demo-maintenance",
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
