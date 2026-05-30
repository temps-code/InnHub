import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceError } from "../../shared/services/serviceResult";
import { list as listService, create as createService, update as updateService, softDelete as softDeleteService, listArchived as listArchivedService, restore as restoreService, purge as purgeService } from "./roomService";
import { list as listRoomTypesService } from "../room-types/roomTypeService";
import type { AppSession } from "../auth/types";
import type { Room, RoomFormData } from "./types";
import type { RoomType } from "../room-types/types";

// ── Types ───────────────────────────────────────────────────────────────

export type RoomsState =
	| { readonly status: "loading" }
	| { readonly status: "loaded"; readonly rooms: Room[] }
	| { readonly status: "error"; readonly error: ServiceError };

export type UseRoomsResult = {
	readonly state: RoomsState;
	readonly roomTypes: RoomType[];
	readonly showArchived: boolean;
	readonly create: (data: RoomFormData) => Promise<void>;
	readonly update: (id: string, data: RoomFormData) => Promise<void>;
	readonly remove: (id: string) => Promise<void>;
	readonly toggleArchived: () => void;
	readonly restore: (id: string) => Promise<void>;
	readonly purge: (id: string) => Promise<void>;
	readonly refresh: () => Promise<void>;
};

// ── Hook ────────────────────────────────────────────────────────────────

export function useRooms(
	session: AppSession | null,
): UseRoomsResult {
	const [state, setState] = useState<RoomsState>({
		status: "loading",
	});
	const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
	const [showArchived, setShowArchived] = useState(false);

	const mountedRef = useRef(true);
	const requestIdRef = useRef(0);
	const latestSessionRef = useRef(session);

	/**
	 * Core fetch function. Must only be called from a microtask or user
	 * callback so that setState never runs synchronously inside an effect.
	 */
	const load = useCallback(async (overrideSession?: AppSession | null) => {
		if (!mountedRef.current) {
			return;
		}
		const currentSession = overrideSession ?? session;
		if (!currentSession) {
			setState({ status: "loaded", rooms: [] });
			setRoomTypes([]);
			return;
		}
		const requestId = ++requestIdRef.current;
		const isArchived = showArchived;
		const [roomsResult, roomTypesResult] = await Promise.all([
			isArchived ? listArchivedService(currentSession) : listService(currentSession),
			listRoomTypesService(currentSession),
		]);

		if (
			!mountedRef.current ||
			requestId !== requestIdRef.current ||
			currentSession !== latestSessionRef.current
		) {
			return;
		}

		if (roomsResult.ok) {
			setState({ status: "loaded", rooms: roomsResult.data });
		} else {
			setState({ status: "error", error: roomsResult.error });
		}

		if (roomTypesResult.ok) {
			setRoomTypes(roomTypesResult.data);
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
		async (data: RoomFormData) => {
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
		async (id: string, data: RoomFormData) => {
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

	return { state, roomTypes, showArchived, create, update, remove, toggleArchived, restore, purge, refresh };
}
