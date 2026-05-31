import { createClient } from "@insforge/sdk";
import type { InsForgeClient } from "@insforge/sdk";

export type InsForgeEnvironment = {
	readonly VITE_INSFORGE_BASE_URL?: string;
	readonly VITE_INSFORGE_ANON_KEY?: string;
};

export type InsForgeConfig = {
	readonly baseUrl: string;
	readonly anonKey: string;
};

function getInsForgeEnvironment(): InsForgeEnvironment {
	return {
		VITE_INSFORGE_BASE_URL: import.meta.env.VITE_INSFORGE_BASE_URL,
		VITE_INSFORGE_ANON_KEY: import.meta.env.VITE_INSFORGE_ANON_KEY,
	};
}

function requireEnvValue(
	name: keyof InsForgeEnvironment,
	value: string | undefined,
): string {
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

export function resolveInsForgeConfig(
	env: InsForgeEnvironment = getInsForgeEnvironment(),
): InsForgeConfig {
	return {
		baseUrl: requireEnvValue(
			"VITE_INSFORGE_BASE_URL",
			env.VITE_INSFORGE_BASE_URL,
		),
		anonKey: requireEnvValue(
			"VITE_INSFORGE_ANON_KEY",
			env.VITE_INSFORGE_ANON_KEY,
		),
	};
}

let cachedClient: InsForgeClient | null = null;
let cachedConfigKey: string | null = null;

function getConfigKey(config: InsForgeConfig): string {
	return `${config.baseUrl}\n${config.anonKey}`;
}

export function createInsForgeClient(
	config: InsForgeConfig = resolveInsForgeConfig(),
): InsForgeClient {
	const configKey = getConfigKey(config);

	if (cachedClient && cachedConfigKey === configKey) {
		return cachedClient;
	}

	cachedClient = createClient(config);
	cachedConfigKey = configKey;
	return cachedClient;
}
