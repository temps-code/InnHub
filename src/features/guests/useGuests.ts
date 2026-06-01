import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceError } from "../../shared/services/serviceResult";
import type { AppSession } from "../auth/types";
import {
	create as createService,
	list as listService,
	listTrash as listTrashService,
	purge as purgeService,
	restore as restoreService,
	softDelete as softDeleteService,
	update as updateService,
} from "./guestService";
import type {
	GuestActivityFilter,
	GuestFormData,
	GuestListParams,
	GuestListResult,
} from "./types";

export type GuestsState =
	| { readonly status: "loading" }
	| { readonly status: "loaded"; readonly result: GuestListResult }
	| { readonly status: "error"; readonly error: ServiceError };

export type UseGuestsResult = {
	readonly state: GuestsState;
	readonly showTrash: boolean;
	readonly params: Required<Pick<GuestListParams, "page" | "pageSize">> &
		Pick<GuestListParams, "search" | "activity">;
	readonly setSearch: (value: string) => void;
	readonly setActivity: (value: GuestActivityFilter) => void;
	readonly setPage: (page: number) => void;
	readonly toggleTrash: () => void;
	readonly create: (data: GuestFormData) => Promise<void>;
	readonly update: (id: string, data: GuestFormData) => Promise<void>;
	readonly remove: (id: string) => Promise<void>;
	readonly restore: (id: string) => Promise<void>;
	readonly purge: (id: string) => Promise<void>;
	readonly refresh: () => Promise<void>;
};

const DEFAULT_PAGE_SIZE = 20;

export function useGuests(session: AppSession | null): UseGuestsResult {
	const [state, setState] = useState<GuestsState>({ status: "loading" });
	const [showTrash, setShowTrash] = useState(false);
	const [params, setParams] = useState<UseGuestsResult["params"]>({
		page: 1,
		pageSize: DEFAULT_PAGE_SIZE,
		search: "",
		activity: "all",
	});

	const mountedRef = useRef(true);
	const requestIdRef = useRef(0);
	const latestSessionRef = useRef(session);

	const load = useCallback(
		async (
			overrideSession?: AppSession | null,
			overrideParams?: UseGuestsResult["params"],
			overrideMode?: boolean,
		) => {
			if (!mountedRef.current) return;

			const currentSession = overrideSession ?? session;
			const currentParams = overrideParams ?? params;
			const currentMode = overrideMode ?? showTrash;

			if (!currentSession) {
				setState({
					status: "loaded",
					result: {
						guests: [],
						page: 1,
						pageSize: DEFAULT_PAGE_SIZE,
						total: 0,
					},
				});
				return;
			}

			const requestId = ++requestIdRef.current;
			const listFn = currentMode ? listTrashService : listService;
			const result = await listFn(currentSession, currentParams);

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

	const setActivity = useCallback((value: GuestActivityFilter) => {
		setParams((prev) => ({ ...prev, activity: value, page: 1 }));
	}, []);

	const setPage = useCallback((page: number) => {
		setParams((prev) => ({ ...prev, page: Math.max(1, Math.floor(page)) }));
	}, []);

	const toggleTrash = useCallback(() => {
		setShowTrash((prev) => !prev);
		setParams((prev) => ({ ...prev, page: 1 }));
	}, []);

	const refresh = useCallback(async () => {
		if (!mountedRef.current || session !== latestSessionRef.current) return;
		setState({ status: "loading" });
		await load();
	}, [load, session]);

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
		async (data: GuestFormData) => {
			await runMutation(async () => createService(session, data));
		},
		[runMutation, session],
	);

	const update = useCallback(
		async (id: string, data: GuestFormData) => {
			await runMutation(async () => updateService(session, id, data));
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
		setActivity,
		setPage,
		toggleTrash,
		create,
		update,
		remove,
		restore,
		purge,
		refresh,
	};
}
