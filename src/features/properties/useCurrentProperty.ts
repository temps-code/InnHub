import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceError } from "../../shared/services/serviceResult";
import { getCurrentProperty, updateCurrentProperty } from "./propertyService";
import type { AppSession } from "../auth/types";
import type { Property, PropertyFormData } from "./types";

// ── Types ───────────────────────────────────────────────────────────────

export type CurrentPropertyState =
	| { readonly status: "loading" }
	| { readonly status: "loaded"; readonly property: Property }
	| { readonly status: "error"; readonly error: ServiceError };

export type UseCurrentPropertyResult = {
	readonly state: CurrentPropertyState;
	readonly update: (data: PropertyFormData) => Promise<void>;
	readonly refresh: () => Promise<void>;
};

// ── Hook ────────────────────────────────────────────────────────────────

export function useCurrentProperty(
	session: AppSession | null,
): UseCurrentPropertyResult {
	const [state, setState] = useState<CurrentPropertyState>({
		status: "loading",
	});

	const mountedRef = useRef(true);
	const requestIdRef = useRef(0);
	const latestSessionRef = useRef(session);

	/**
	 * Core fetch function. Must only be called from a microtask or user
	 * callback so that setState never runs synchronously inside an effect.
	 */
	const load = useCallback(async () => {
		const requestId = ++requestIdRef.current;
		const requestSession = session;
		const result = await getCurrentProperty(requestSession);

		if (
			!mountedRef.current ||
			requestId !== requestIdRef.current ||
			requestSession !== latestSessionRef.current
		) {
			return;
		}

		if (result.ok) {
			setState({ status: "loaded", property: result.data });
		} else {
			setState({ status: "error", error: result.error });
		}
	}, [session]);

	// Schedule the initial load on the next microtask so the effect body
	// never calls setState synchronously (satisfies react-hooks rules).
	useEffect(() => {
		latestSessionRef.current = session;
		mountedRef.current = true;
		Promise.resolve().then(() => load());

		return () => {
			mountedRef.current = false;
			requestIdRef.current += 1;
		};
	}, [load, session]);

	const update = useCallback(
		async (data: PropertyFormData) => {
			const requestSession = session;
			const result = await updateCurrentProperty(requestSession, data);

			if (!mountedRef.current || requestSession !== latestSessionRef.current) {
				return;
			}

			if (result.ok) {
				await load();
			} else {
				setState({ status: "error", error: result.error });
				throw result.error;
			}
		},
		[session, load],
	);

	const refresh = useCallback(async () => {
		if (!mountedRef.current || session !== latestSessionRef.current) {
			return;
		}

		setState({ status: "loading" });
		await load();
	}, [load, session]);

	return { state, update, refresh };
}
