import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceError } from "../../shared/services/serviceResult";
import { list as listService, create as createService, update as updateService, softDelete as softDeleteService, listArchived as listArchivedService, restore as restoreService, purge as purgeService } from "./roomTypeService";
import type { AppSession } from "../auth/types";
import type { RoomType, RoomTypeFormData } from "./types";

// ── Types ───────────────────────────────────────────────────────────────

export type RoomTypesState =
	| { readonly status: "loading" }
	| { readonly status: "loaded"; readonly roomTypes: RoomType[] }
	| { readonly status: "error"; readonly error: ServiceError };

export type UseRoomTypesResult = {
	readonly state: RoomTypesState;
	readonly showArchived: boolean;
	readonly create: (data: RoomTypeFormData) => Promise<void>;
	readonly update: (id: string, data: RoomTypeFormData) => Promise<void>;
	readonly remove: (id: string) => Promise<void>;
	readonly toggleArchived: () => void;
	readonly restore: (id: string) => Promise<void>;
	readonly purge: (id: string) => Promise<void>;
	readonly refresh: () => Promise<void>;
};

// ── Hook ────────────────────────────────────────────────────────────────

export function useRoomTypes(
	session: AppSession | null,
): UseRoomTypesResult {
	const [state, setState] = useState<RoomTypesState>({
		status: "loading",
	});
	const [showArchived, setShowArchived] = useState(false);

	const mountedRef = useRef(true);
	const requestIdRef = useRef(0);
	const latestSessionRef = useRef(session);

	/**
	 * Core fetch function. Must only be called from a microtask or user
	 * callback so that setState never runs synchronously inside an effect.
	 * When called from restore/purge, pass the current session so the stale
	 * guard uses the latest session, not the one captured in the closure.
	 */
	const load = useCallback(async (overrideSession?: AppSession | null) => {
		if (!mountedRef.current) {
			return;
		}
		const currentSession = overrideSession ?? session;
		if (!currentSession) {
			setState({ status: "loaded", roomTypes: [] });
			return;
		}
		const requestId = ++requestIdRef.current;
		const isArchived = showArchived;
		const result = isArchived
			? await listArchivedService(currentSession)
			: await listService(currentSession);

		if (
			!mountedRef.current ||
			requestId !== requestIdRef.current ||
			currentSession !== latestSessionRef.current
		) {
			return;
		}

		if (result.ok) {
			setState({ status: "loaded", roomTypes: result.data });
		} else {
			setState({ status: "error", error: result.error });
		}
	}, [session, showArchived]);

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

	const create = useCallback(
		async (data: RoomTypeFormData) => {
			const requestSession = session;
			const result = await createService(requestSession, data);

			if (!mountedRef.current || requestSession !== latestSessionRef.current) {
				return;
			}

			if (result.ok) {
				await load();
			} else {
				throw result.error;
			}
		},
		[session, load],
	);

	const update = useCallback(
		async (id: string, data: RoomTypeFormData) => {
			const requestSession = session;
			const result = await updateService(requestSession, id, data);

			if (!mountedRef.current || requestSession !== latestSessionRef.current) {
				return;
			}

			if (result.ok) {
				await load();
			} else {
				throw result.error;
			}
		},
		[session, load],
	);

	const remove = useCallback(
		async (id: string) => {
			const requestSession = session;
			const result = await softDeleteService(requestSession, id);

			if (!mountedRef.current || requestSession !== latestSessionRef.current) {
				return;
			}

			if (result.ok) {
				await load();
			} else {
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

	const toggleArchived = useCallback(() => {
		setShowArchived((prev) => !prev);
	}, []);

	const restore = useCallback(
		async (id: string) => {
			const requestSession = session;
			const result = await restoreService(requestSession, id);

			if (!mountedRef.current || requestSession !== latestSessionRef.current) {
				return;
			}

			if (result.ok) {
				await load(latestSessionRef.current);
			} else {
				throw result.error;
			}
		},
		[session, load],
	);

	const purge = useCallback(
		async (id: string) => {
			const requestSession = session;
			const result = await purgeService(requestSession, id);

			if (!mountedRef.current || requestSession !== latestSessionRef.current) {
				return;
			}

			if (result.ok) {
				await load(latestSessionRef.current);
			} else {
				throw result.error;
			}
		},
		[session, load],
	);

	return { state, showArchived, create, update, remove, toggleArchived, restore, purge, refresh };
}
