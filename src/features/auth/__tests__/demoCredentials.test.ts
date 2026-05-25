import { describe, expect, it } from "vitest";

import { resolveDemoCredentials } from "../services/demoCredentials";

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
