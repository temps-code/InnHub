import { createContext } from "react";

import type { AuthSessionState, LoginCredentials, LoginResult } from "./types";

export type AuthSessionContextValue = {
	readonly state: AuthSessionState;
	readonly login: (credentials: LoginCredentials) => Promise<LoginResult>;
	readonly logout: () => Promise<void>;
	readonly refresh: () => Promise<void>;
};

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(
	null,
);
