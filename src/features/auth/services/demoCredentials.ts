import type { LoginCredentials } from "../types";

type DemoCredentialEnv = Readonly<Record<string, string | undefined>>;

export type DemoCredentialsResult =
	| { readonly status: "available"; readonly credentials: LoginCredentials }
	| { readonly status: "unavailable" };

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
