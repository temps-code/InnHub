import { describe, expect, it } from "vitest";

import { resolveInsForgeConfig } from "./insforgeClient";

describe("resolveInsForgeConfig", () => {
	it("returns the InsForge SDK config from Vite environment values", () => {
		expect(
			resolveInsForgeConfig({
				VITE_INSFORGE_BASE_URL: "https://example.insforge.app",
				VITE_INSFORGE_ANON_KEY: "local-anon-key",
			}),
		).toEqual({
			baseUrl: "https://example.insforge.app",
			anonKey: "local-anon-key",
		});
	});

	it("reports a missing base URL without exposing the anon key", () => {
		expect(() =>
			resolveInsForgeConfig({
				VITE_INSFORGE_BASE_URL: "",
				VITE_INSFORGE_ANON_KEY: "secret-anon-key",
			}),
		).toThrow("Missing required environment variable: VITE_INSFORGE_BASE_URL");

		expect(() =>
			resolveInsForgeConfig({
				VITE_INSFORGE_BASE_URL: "",
				VITE_INSFORGE_ANON_KEY: "secret-anon-key",
			}),
		).not.toThrow("secret-anon-key");
	});

	it("reports a missing anon key without exposing the base URL", () => {
		expect(() =>
			resolveInsForgeConfig({
				VITE_INSFORGE_BASE_URL: "https://private-project.insforge.app",
				VITE_INSFORGE_ANON_KEY: undefined,
			}),
		).toThrow("Missing required environment variable: VITE_INSFORGE_ANON_KEY");

		expect(() =>
			resolveInsForgeConfig({
				VITE_INSFORGE_BASE_URL: "https://private-project.insforge.app",
				VITE_INSFORGE_ANON_KEY: undefined,
			}),
		).not.toThrow("https://private-project.insforge.app");
	});
});
