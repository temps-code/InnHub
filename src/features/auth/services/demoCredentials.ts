import type { AppProfileRole, LoginCredentials } from "../types";

type DemoCredentialEnv = Readonly<Record<string, string | undefined>>;

export type DemoCredentialsResult =
	| { readonly status: "available"; readonly credentials: LoginCredentials }
	| { readonly status: "unavailable" };

export type DemoPropertyId = "hotel-tarija" | "hostal-los-chapacos";

export type DemoProperty = {
	readonly id: DemoPropertyId;
	readonly nameKey: string;
};

export type DemoAccount = {
	readonly propertyId: DemoPropertyId;
	readonly role: AppProfileRole;
	readonly email: string;
	readonly password: string;
};

export const DEFAULT_DEMO_PROPERTY_ID: DemoPropertyId = "hotel-tarija";

const DEMO_PASSWORD = ["Demo", "123!"].join("");

const DEMO_PROPERTIES: readonly DemoProperty[] = [
	{ id: "hotel-tarija", nameKey: "auth.demoSelector.properties.hotelTarija" },
	{
		id: "hostal-los-chapacos",
		nameKey: "auth.demoSelector.properties.hostalLosChapacos",
	},
];

const DEMO_ACCOUNTS: readonly DemoAccount[] = [
	["hotel-tarija", "administrator", "admin+tarija-admin@innhub.dev"],
	["hotel-tarija", "manager", "admin+tarija-manager@innhub.dev"],
	["hotel-tarija", "receptionist", "admin+tarija-reception@innhub.dev"],
	["hotel-tarija", "housekeeping", "admin+tarija-housekeep@innhub.dev"],
	["hotel-tarija", "maintenance", "admin+tarija-maintenance@innhub.dev"],
	[
		"hostal-los-chapacos",
		"administrator",
		"admin+loschapacos-admin@innhub.dev",
	],
	["hostal-los-chapacos", "manager", "admin+loschapacos-manager@innhub.dev"],
	[
		"hostal-los-chapacos",
		"receptionist",
		"admin+loschapacos-reception@innhub.dev",
	],
	[
		"hostal-los-chapacos",
		"housekeeping",
		"admin+loschapacos-housekeep@innhub.dev",
	],
	[
		"hostal-los-chapacos",
		"maintenance",
		"admin+loschapacos-maintenance@innhub.dev",
	],
].map(([propertyId, role, email]) => ({
	propertyId: propertyId as DemoPropertyId,
	role: role as AppProfileRole,
	email,
	password: DEMO_PASSWORD,
}));

export function getAllDemoProperties(): readonly DemoProperty[] {
	return DEMO_PROPERTIES;
}

/** Returns credentials for the given role in the default demo property. */
export function getDemoAccount(
	role: AppProfileRole,
): LoginCredentials | undefined {
	return getDemoAccountForProperty(DEFAULT_DEMO_PROPERTY_ID, role);
}

export function getDemoAccountForProperty(
	propertyId: DemoPropertyId,
	role: AppProfileRole,
): LoginCredentials | undefined {
	const account = DEMO_ACCOUNTS.find(
		(a) => a.propertyId === propertyId && a.role === role,
	);
	return account
		? { email: account.email, password: account.password }
		: undefined;
}

export function getDemoAccountsForProperty(
	propertyId: DemoPropertyId,
): readonly DemoAccount[] {
	return DEMO_ACCOUNTS.filter((account) => account.propertyId === propertyId);
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
