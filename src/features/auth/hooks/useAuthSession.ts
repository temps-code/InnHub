import { useContext } from "react";

import { AuthSessionContext } from "../authSessionContext";
import type { AuthSessionContextValue } from "../authSessionContext";

export function useAuthSession(): AuthSessionContextValue {
	const context = useContext(AuthSessionContext);

	if (!context) {
		throw new Error("useAuthSession must be used within AuthSessionProvider");
	}

	return context;
}
