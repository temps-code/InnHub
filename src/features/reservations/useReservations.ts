import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceError } from "../../shared/services/serviceResult";
import type { AppSession } from "../auth/types";
import {
	cancel as cancelService,
	create as createService,
	list as listService,
	listTrash as listTrashService,
	purge as purgeService,
	restore as restoreService,
	softDelete as softDeleteService,
	update as updateService,
} from "./reservationService";
import type {
	ReservationCreateData,
	ReservationListParams,
	ReservationListResult,
	ReservationStatus,
	ReservationUpdateData,
} from "./types";

export type ReservationsState =
	| { readonly status: "loading" }
	| { readonly status: "loaded"; readonly result: ReservationListResult }
	| { readonly status: "error"; readonly error: ServiceError };

export type ReservationsParams = Required<
	Pick<ReservationListParams, "page" | "pageSize">
> &
	Pick<
		ReservationListParams,
		| "search"
		| "status"
		| "checkInFrom"
		| "checkInTo"
		| "checkOutFrom"
		| "checkOutTo"
		| "room_id"
		| "guest_id"
	>;

export type UseReservationsResult = {
	readonly state: ReservationsState;
	readonly showTrash: boolean;
	readonly params: ReservationsParams;
	readonly setSearch: (value: string) => void;
	readonly setStatus: (value: ReservationStatus | "all") => void;
	readonly setPage: (page: number) => void;
	readonly setCheckInFrom: (value: string) => void;
	readonly setCheckInTo: (value: string) => void;
	readonly setCheckOutFrom: (value: string) => void;
	readonly setCheckOutTo: (value: string) => void;
	readonly setRoomId: (value: string) => void;
	readonly setGuestId: (value: string) => void;
	readonly toggleTrash: () => void;
	readonly create: (data: ReservationCreateData) => Promise<void>;
	readonly update: (id: string, data: ReservationUpdateData) => Promise<void>;
	readonly cancel: (id: string) => Promise<void>;
	readonly remove: (id: string) => Promise<void>;
	readonly restore: (id: string) => Promise<void>;
	readonly purge: (id: string) => Promise<void>;
	readonly refresh: () => Promise<void>;
};

const DEFAULT_PAGE_SIZE = 20;

export function useReservations(
	session: AppSession | null,
): UseReservationsResult {
	const [state, setState] = useState<ReservationsState>({ status: "loading" });
	const [showTrash, setShowTrash] = useState(false);
	const [params, setParams] = useState<ReservationsParams>({
		page: 1,
		pageSize: DEFAULT_PAGE_SIZE,
		search: "",
		status: "all",
		checkInFrom: "",
		checkInTo: "",
		checkOutFrom: "",
		checkOutTo: "",
		room_id: "",
		guest_id: "",
	});

	const mountedRef = useRef(true);
	const requestIdRef = useRef(0);
	const latestSessionRef = useRef(session);

	const load = useCallback(
		async (
			overrideSession?: AppSession | null,
			overrideParams?: ReservationsParams,
		) => {
			if (!mountedRef.current) return;

			const currentSession = overrideSession ?? session;
			const currentParams = overrideParams ?? params;

			if (!currentSession) {
				setState({
					status: "loaded",
					result: {
						reservations: [],
						page: 1,
						pageSize: DEFAULT_PAGE_SIZE,
						total: 0,
					},
				});
				return;
			}

			const requestId = ++requestIdRef.current;
			const result = showTrash
				? await listTrashService(currentSession, currentParams)
				: await listService(currentSession, currentParams);

			if (
				!mountedRef.current ||
				requestId !== requestIdRef.current ||
				currentSession !== latestSessionRef.current
			) {
				return;
			}

			if (result.ok) {
				setState({ status: "loaded", result: result.data });
			} else {
				setState({ status: "error", error: result.error });
			}
		},
		[params, session, showTrash],
	);

	useEffect(() => {
		latestSessionRef.current = session;
		mountedRef.current = true;
		Promise.resolve().then(() => load());

		return () => {
			mountedRef.current = false;
			requestIdRef.current += 1;
		};
	}, [load, session]);

	const setSearch = useCallback((value: string) => {
		setParams((prev) => ({ ...prev, search: value, page: 1 }));
	}, []);

	const setStatus = useCallback((value: ReservationStatus | "all") => {
		setParams((prev) => ({ ...prev, status: value, page: 1 }));
	}, []);

	const setCheckInFrom = useCallback((value: string) => {
		setParams((prev) => ({ ...prev, checkInFrom: value, page: 1 }));
	}, []);

	const setCheckInTo = useCallback((value: string) => {
		setParams((prev) => ({ ...prev, checkInTo: value, page: 1 }));
	}, []);

	const setCheckOutFrom = useCallback((value: string) => {
		setParams((prev) => ({ ...prev, checkOutFrom: value, page: 1 }));
	}, []);

	const setCheckOutTo = useCallback((value: string) => {
		setParams((prev) => ({ ...prev, checkOutTo: value, page: 1 }));
	}, []);

	const setRoomId = useCallback((value: string) => {
		setParams((prev) => ({ ...prev, room_id: value, page: 1 }));
	}, []);

	const setGuestId = useCallback((value: string) => {
		setParams((prev) => ({ ...prev, guest_id: value, page: 1 }));
	}, []);

	const setPage = useCallback((page: number) => {
		setParams((prev) => ({ ...prev, page: Math.max(1, Math.floor(page)) }));
	}, []);

	const refresh = useCallback(async () => {
		if (!mountedRef.current || session !== latestSessionRef.current) return;
		setState({ status: "loading" });
		await load();
	}, [load, session]);

	const toggleTrash = useCallback(() => {
		setShowTrash((prev) => !prev);
		setParams((prev) => ({ ...prev, page: 1 }));
	}, []);

	const runMutation = useCallback(
		async (operation: () => Promise<{ ok: boolean; error?: ServiceError }>) => {
			const requestSession = session;
			const result = await operation();

			if (!mountedRef.current || requestSession !== latestSessionRef.current) {
				return;
			}

			if (result.ok) {
				await load(latestSessionRef.current);
			} else {
				throw result.error;
			}
		},
		[load, session],
	);

	const create = useCallback(
		async (data: ReservationCreateData) => {
			await runMutation(async () => createService(session, data));
		},
		[runMutation, session],
	);

	const update = useCallback(
		async (id: string, data: ReservationUpdateData) => {
			await runMutation(async () => updateService(session, id, data));
		},
		[runMutation, session],
	);

	const cancel = useCallback(
		async (id: string) => {
			await runMutation(async () => cancelService(session, id));
		},
		[runMutation, session],
	);

	const remove = useCallback(
		async (id: string) => {
			await runMutation(async () => softDeleteService(session, id));
		},
		[runMutation, session],
	);

	const restore = useCallback(
		async (id: string) => {
			await runMutation(async () => restoreService(session, id));
		},
		[runMutation, session],
	);

	const purge = useCallback(
		async (id: string) => {
			await runMutation(async () => purgeService(session, id));
		},
		[runMutation, session],
	);

	return {
		state,
		showTrash,
		params,
		setSearch,
		setStatus,
		setPage,
		setCheckInFrom,
		setCheckInTo,
		setCheckOutFrom,
		setCheckOutTo,
		setRoomId,
		setGuestId,
		toggleTrash,
		create,
		update,
		cancel,
		remove,
		restore,
		purge,
		refresh,
	};
}
