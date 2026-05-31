import { describe, expect, it } from "vitest";

import {
	getAllDemoAccounts,
	getAllDemoProperties,
	getDemoAccount,
	getDemoAccountForProperty,
	getDemoAccountsForProperty,
	resolveDemoCredentials,
} from "../services/demoCredentials";
import type { AppProfileRole } from "../types";

describe("resolveDemoCredentials", () => {
	it("returns available demo credentials when email and password are configured", () => {
		expect(
			resolveDemoCredentials({
				VITE_DEMO_LOGIN_EMAIL: " demo@innhub.test ",
				VITE_DEMO_LOGIN_PASSWORD: "demo-password",
			}),
		).toEqual({
			status: "available",
			credentials: {
				email: "demo@innhub.test",
				password: "demo-password",
			},
		});
	});

	it.each([
		{ VITE_DEMO_LOGIN_EMAIL: "", VITE_DEMO_LOGIN_PASSWORD: "demo-password" },
		{ VITE_DEMO_LOGIN_EMAIL: "demo@innhub.test", VITE_DEMO_LOGIN_PASSWORD: "" },
		{ VITE_DEMO_LOGIN_EMAIL: "   ", VITE_DEMO_LOGIN_PASSWORD: "demo-password" },
		{
			VITE_DEMO_LOGIN_EMAIL: "demo@innhub.test",
			VITE_DEMO_LOGIN_PASSWORD: "   ",
		},
	])("returns unavailable when demo config is incomplete", (env) => {
		expect(resolveDemoCredentials(env)).toEqual({ status: "unavailable" });
	});

	it("does not expose partial raw credential values when unavailable", () => {
		const result = resolveDemoCredentials({
			VITE_DEMO_LOGIN_EMAIL: "demo@innhub.test",
			VITE_DEMO_LOGIN_PASSWORD: "   ",
		});

		expect(result).toEqual({ status: "unavailable" });
		expect(JSON.stringify(result)).not.toContain("demo@innhub.test");
	});
});

const ALL_ROLES: AppProfileRole[] = [
	"administrator",
	"manager",
	"receptionist",
	"housekeeping",
	"maintenance",
];

describe("getAllDemoProperties", () => {
	it("returns the two seeded demo properties", () => {
		expect(getAllDemoProperties()).toEqual([
			{
				id: "hotel-tarija",
				nameKey: "auth.demoSelector.properties.hotelTarija",
			},
			{
				id: "hostal-los-chapacos",
				nameKey: "auth.demoSelector.properties.hostalLosChapacos",
			},
		]);
	});
});

describe("getDemoAccount", () => {
	it.each(
		ALL_ROLES,
	)("returns Hotel Tarija LoginCredentials by default for %s role", (role) => {
		const result = getDemoAccount(role);
		expect(result).toBeDefined();
		expect(result!.email).toContain("admin+tarija-");
		expect(result!.email).toContain("@innhub.dev");
		expect(result!.password).toBe("Demo123!");
	});

	it("returns undefined for role without configured credentials", () => {
		expect(getDemoAccount("unknown" as AppProfileRole)).toBeUndefined();
	});
});

describe("property-aware demo accounts", () => {
	it("returns 10 demo accounts with property-aware DemoAccount shape", () => {
		const accounts = getAllDemoAccounts();
		expect(accounts).toHaveLength(10);

		for (const account of accounts) {
			expect(account).toHaveProperty("propertyId");
			expect(account).toHaveProperty("role");
			expect(account).toHaveProperty("email");
			expect(account).toHaveProperty("password");
			expect(account.email).toContain("@innhub.dev");
			expect(account.password).toBe("Demo123!");
		}
	});

	it.each([
		"hotel-tarija",
		"hostal-los-chapacos",
	] as const)("contains five roles for %s", (propertyId) => {
		const accounts = getDemoAccountsForProperty(propertyId);
		expect(accounts).toHaveLength(5);
		expect(accounts.map((account) => account.role).sort()).toEqual(
			[...ALL_ROLES].sort(),
		);
	});

	it("resolves Hostal Los Chapacos Manager credentials", () => {
		expect(getDemoAccountForProperty("hostal-los-chapacos", "manager")).toEqual(
			{
				email: "admin+loschapacos-manager@innhub.dev",
				password: "Demo123!",
			},
		);
	});
});
