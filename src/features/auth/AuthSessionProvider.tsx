import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { createInsForgeAuthSessionGateway } from "./services/insforgeAuthSessionGateway";
import {
	buildAppSession,
	loginWithPassword,
	logout as logoutWithGateway,
	type AuthSessionGateway,
} from "./services/authSessionService";
import {
	AuthSessionContext,
	type AuthSessionContextValue,
} from "./authSessionContext";
import type { AuthSessionState, LoginCredentials, LoginResult } from "./types";

type AuthSessionProviderProps = {
	readonly children: ReactNode;
	readonly gateway?: AuthSessionGateway;
};

const configurationErrorState: AuthSessionState = {
	status: "invalid",
	reason: "configuration-error",
};

export function AuthSessionProvider({
	children,
	gateway,
}: AuthSessionProviderProps) {
	const [state, setState] = useState<AuthSessionState>({ status: "loading" });
	const gatewayRef = useRef<AuthSessionGateway | null>(gateway ?? null);

	const getGateway = useCallback((): AuthSessionGateway | null => {
		if (gateway) {
			return gateway;
		}

		try {
			gatewayRef.current ??= createInsForgeAuthSessionGateway();
			return gatewayRef.current;
		} catch {
			return null;
		}
	}, [gateway]);

	const loadSession = useCallback(async () => {
		const activeGateway = getGateway();

		if (!activeGateway) {
			await Promise.resolve();
			setState(configurationErrorState);
			return;
		}

		setState(await buildAppSession(activeGateway));
	}, [getGateway]);

	const refresh = useCallback(async () => {
		setState({ status: "loading" });
		await loadSession();
	}, [loadSession]);

	const login = useCallback(
		async (credentials: LoginCredentials): Promise<LoginResult> => {
			const activeGateway = getGateway();

			if (!activeGateway) {
				setState(configurationErrorState);
				return {
					ok: false,
					message: "Authentication is not configured for this environment.",
				};
			}

			const result = await loginWithPassword(activeGateway, credentials);

			if (result.ok) {
				setState({ status: "authenticated", session: result.session });
			}

			return result;
		},
		[getGateway],
	);

	const logout = useCallback(async () => {
		const activeGateway = getGateway();

		if (!activeGateway) {
			setState({ status: "unauthenticated" });
			return;
		}

		setState(await logoutWithGateway(activeGateway));
	}, [getGateway]);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			void loadSession();
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, [loadSession]);

	const value = useMemo<AuthSessionContextValue>(
		() => ({ state, login, logout, refresh }),
		[state, login, logout, refresh],
	);

	return (
		<AuthSessionContext.Provider value={value}>
			{children}
		</AuthSessionContext.Provider>
	);
}
