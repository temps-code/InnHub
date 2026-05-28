import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceError } from "../../shared/services/serviceResult";
import { list as listService, create as createService, update as updateService, softDelete as softDeleteService } from "./roomTypeService";
import type { AppSession } from "../auth/types";
import type { RoomType, RoomTypeFormData } from "./types";

// ── Types ───────────────────────────────────────────────────────────────

export type RoomTypesState =
	| { readonly status: "loading" }
	| { readonly status: "loaded"; readonly roomTypes: RoomType[] }
	| { readonly status: "error"; readonly error: ServiceError };

export type UseRoomTypesResult = {
	readonly state: RoomTypesState;
	readonly create: (data: RoomTypeFormData) => Promise<void>;
	readonly update: (id: string, data: RoomTypeFormData) => Promise<void>;
	readonly remove: (id: string) => Promise<void>;
	readonly refresh: () => Promise<void>;
};

// ── Hook ────────────────────────────────────────────────────────────────

export function useRoomTypes(
	session: AppSession | null,
): UseRoomTypesResult {
	const [state, setState] = useState<RoomTypesState>({
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
		if (!mountedRef.current) {
			return;
		}
		if (!session) {
			setState({ status: "loaded", roomTypes: [] });
			return;
		}
		const requestId = ++requestIdRef.current;
		const requestSession = session;
		const result = await listService(requestSession);

		if (
			!mountedRef.current ||
			requestId !== requestIdRef.current ||
			requestSession !== latestSessionRef.current
		) {
			return;
		}

		if (result.ok) {
			setState({ status: "loaded", roomTypes: result.data });
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

	return { state, create, update, remove, refresh };
}
