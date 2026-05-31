import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInsForgeClient, resolveInsForgeConfig } from "./insforgeClient";

vi.mock("@insforge/sdk", () => ({
	createClient: vi.fn((config: unknown) => ({ config })),
}));

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

describe("createInsForgeClient", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reuses the same SDK client for the same configuration", async () => {
		const { createClient } = await import("@insforge/sdk");
		const config = {
			baseUrl: "https://example.insforge.app",
			anonKey: "local-anon-key",
		};

		const first = createInsForgeClient(config);
		const second = createInsForgeClient(config);

		expect(second).toBe(first);
		expect(createClient).toHaveBeenCalledTimes(1);
	});

	it("creates a new SDK client when the configuration changes", async () => {
		const { createClient } = await import("@insforge/sdk");

		const first = createInsForgeClient({
			baseUrl: "https://one.insforge.app",
			anonKey: "one-anon-key",
		});
		const second = createInsForgeClient({
			baseUrl: "https://two.insforge.app",
			anonKey: "two-anon-key",
		});

		expect(second).not.toBe(first);
		expect(createClient).toHaveBeenCalledTimes(2);
	});
});
