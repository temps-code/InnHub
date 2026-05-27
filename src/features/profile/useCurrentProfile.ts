import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceError } from "../../shared/services/serviceResult";
import {
	getProfileData,
	updateProfileFullName,
} from "./profileService";
import type { AppSession } from "../auth/types";
import type { ProfileData } from "./types";

// ── Types ───────────────────────────────────────────────────────────────

export type CurrentProfileState =
	| { readonly status: "loading" }
	| { readonly status: "loaded"; readonly profile: ProfileData }
	| { readonly status: "error"; readonly error: ServiceError };

export type UseCurrentProfileResult = {
	readonly state: CurrentProfileState;
	readonly update: (fullName: string) => Promise<void>;
	readonly refresh: () => Promise<void>;
};

// ── Hook ────────────────────────────────────────────────────────────────

export function useCurrentProfile(
	session: AppSession | null,
): UseCurrentProfileResult {
	const [state, setState] = useState<CurrentProfileState>({
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
		const result = await getProfileData(requestSession);

		if (
			!mountedRef.current ||
			requestId !== requestIdRef.current ||
			requestSession !== latestSessionRef.current
		) {
			return;
		}

		if (result.ok) {
			setState({ status: "loaded", profile: result.data });
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
		async (fullName: string) => {
			const requestSession = session;
			const result = await updateProfileFullName(requestSession, fullName);

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
