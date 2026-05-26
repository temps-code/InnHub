import { describe, expect, it } from "vitest";

import {
	getAllDemoAccounts,
	getDemoAccount,
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

describe("getDemoAccount", () => {
	const ALL_ROLES: AppProfileRole[] = [
		"administrator",
		"manager",
		"receptionist",
		"housekeeping",
		"maintenance",
	];

	it.each(ALL_ROLES)(
		"returns LoginCredentials for %s role",
		(role) => {
			const result = getDemoAccount(role);
			expect(result).toBeDefined();
			expect(result!.email).toContain("@innhub.test");
			expect(typeof result!.password).toBe("string");
			expect(result!.password.length).toBeGreaterThan(0);
		},
	);

	it("returns undefined for role without configured credentials", () => {
		expect(getDemoAccount("unknown" as AppProfileRole)).toBeUndefined();
	});
});

describe("getAllDemoAccounts", () => {
	it("returns 5 demo accounts with correct DemoAccount shape", () => {
		const accounts = getAllDemoAccounts();
		expect(accounts).toHaveLength(5);

		for (const account of accounts) {
			expect(account).toHaveProperty("role");
			expect(account).toHaveProperty("email");
			expect(account).toHaveProperty("password");
			expect(account.email).toContain("@innhub.test");
			expect(typeof account.password).toBe("string");
			expect(account.password.length).toBeGreaterThan(0);
		}
	});

	it("contains one account per AppProfileRole", () => {
		const accounts = getAllDemoAccounts();
		const roles = accounts.map((a) => a.role);
		expect(roles).toContain("administrator");
		expect(roles).toContain("manager");
		expect(roles).toContain("receptionist");
		expect(roles).toContain("housekeeping");
		expect(roles).toContain("maintenance");
	});
});
