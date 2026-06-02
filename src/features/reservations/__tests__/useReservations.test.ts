// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type {
	Reservation,
	ReservationCreateData,
	ReservationListResult,
} from "../types";

const {
	mockList,
	mockListTrash,
	mockCreate,
	mockUpdate,
	mockCancel,
	mockSoftDelete,
	mockRestore,
	mockPurge,
} = vi.hoisted(() => ({
	mockList: vi.fn(),
	mockListTrash: vi.fn(),
	mockCreate: vi.fn(),
	mockUpdate: vi.fn(),
	mockCancel: vi.fn(),
	mockSoftDelete: vi.fn(),
	mockRestore: vi.fn(),
	mockPurge: vi.fn(),
}));

vi.mock("../reservationService", () => ({
	list: mockList,
	listTrash: mockListTrash,
	create: mockCreate,
	update: mockUpdate,
	cancel: mockCancel,
	softDelete: mockSoftDelete,
	restore: mockRestore,
	purge: mockPurge,
}));

import { useReservations } from "../useReservations";

const aSession: AppSession = {
	user: { id: "auth-user-1", email: "reception@innhub.test" },
	profile: {
		id: "profile-1",
		authUserId: "auth-user-1",
		propertyId: "property-1",
		role: "receptionist",
		status: "active",
	},
	propertyId: "property-1",
};

const bSession: AppSession = {
	user: { id: "auth-user-2", email: "reception2@innhub.test" },
	profile: {
		id: "profile-2",
		authUserId: "auth-user-2",
		propertyId: "property-2",
		role: "receptionist",
		status: "active",
	},
	propertyId: "property-2",
};

const reservation: Reservation = {
	id: "res-1",
	property_id: "property-1",
	primary_guest_id: "guest-1",
	planned_check_in_date: "2026-09-01",
	planned_check_out_date: "2026-09-03",
	status: "confirmed",
	notes: null,
	created_at: "2026-08-01T00:00:00Z",
	updated_at: "2026-08-01T00:00:00Z",
	deleted_at: null,
};

const listResult: ReservationListResult = {
	reservations: [reservation],
	page: 1,
	pageSize: 20,
	total: 1,
};

const reservationFormData: ReservationCreateData = {
	primary_guest_id: "guest-2",
	planned_check_in_date: "2026-10-01",
	planned_check_out_date: "2026-10-03",
	room_type_id: "room-type-1",
	room_id: "room-1",
	guest_count: 2,
	status: "pending",
	notes: null,
};

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolver) => {
		resolve = resolver;
	});
	return { promise, resolve };
}

describe("useReservations", () => {
	beforeEach(() => {
		mockList.mockResolvedValue({ ok: true, data: listResult });
		mockListTrash.mockResolvedValue({ ok: true, data: listResult });
		mockCreate.mockResolvedValue({ ok: true, data: reservation });
		mockUpdate.mockResolvedValue({ ok: true, data: reservation });
		mockCancel.mockResolvedValue({ ok: true, data: reservation });
		mockSoftDelete.mockResolvedValue({ ok: true, data: reservation });
		mockRestore.mockResolvedValue({ ok: true, data: reservation });
		mockPurge.mockResolvedValue({
			ok: true,
			data: { reservation, blockers: { invoiceCount: 0, paymentCount: 0 } },
		});
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("loads active reservations by default with pageSize 20", async () => {
		const { result } = renderHook(() => useReservations(aSession));

		expect(result.current.state).toEqual({ status: "loading" });

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				result: listResult,
			});
		});

		expect(mockList).toHaveBeenCalledWith(
			aSession,
			expect.objectContaining({ page: 1, pageSize: 20 }),
		);
	});

	it("changes filters/search and resets page to 1", async () => {
		const { result } = renderHook(() => useReservations(aSession));
		await waitFor(() => expect(result.current.state.status).toBe("loaded"));

		await act(async () => {
			result.current.setPage(3);
			result.current.setSearch("res-1");
		});
		await waitFor(() => {
			expect(mockList).toHaveBeenLastCalledWith(
				aSession,
				expect.objectContaining({ search: "res-1", page: 1 }),
			);
		});

		await act(async () => {
			result.current.setStatus("confirmed");
		});
		await waitFor(() => {
			expect(mockList).toHaveBeenLastCalledWith(
				aSession,
				expect.objectContaining({ status: "confirmed", page: 1 }),
			);
		});
	});

	it("refreshes after create/update/cancel/remove/restore/purge mutations", async () => {
		const { result } = renderHook(() => useReservations(aSession));
		await waitFor(() => expect(result.current.state.status).toBe("loaded"));

		await act(async () => {
			await result.current.create(reservationFormData);
			await result.current.update("res-1", reservationFormData);
			await result.current.cancel("res-1");
			await result.current.remove("res-1");
			await result.current.restore("res-1");
			await result.current.purge("res-1");
		});

		expect(mockCreate).toHaveBeenCalled();
		expect(mockUpdate).toHaveBeenCalled();
		expect(mockCancel).toHaveBeenCalled();
		expect(mockSoftDelete).toHaveBeenCalled();
		expect(mockRestore).toHaveBeenCalled();
		expect(mockPurge).toHaveBeenCalled();
		expect(mockList.mock.calls.length).toBeGreaterThan(1);
	});

	it("throws service errors from mutations", async () => {
		mockCreate.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "x" },
		});

		const { result } = renderHook(() => useReservations(aSession));
		await waitFor(() => expect(result.current.state.status).toBe("loaded"));

		await expect(
			result.current.create(reservationFormData),
		).rejects.toMatchObject({
			code: "backend-error",
		});
	});

	it("toggles trash mode and loads listTrash", async () => {
		const { result } = renderHook(() => useReservations(aSession));
		await waitFor(() => expect(result.current.state.status).toBe("loaded"));

		await act(async () => {
			result.current.toggleTrash();
		});

		await waitFor(() => {
			expect(mockListTrash).toHaveBeenCalledWith(
				aSession,
				expect.objectContaining({ page: 1, pageSize: 20 }),
			);
		});
	});

	it("ignores stale load results when session changes", async () => {
		const pending = deferred<{ ok: true; data: ReservationListResult }>();
		mockList.mockReturnValueOnce(pending.promise);
		mockList.mockResolvedValue({ ok: true, data: listResult });

		const { result, rerender } = renderHook(
			({ session }) => useReservations(session),
			{
				initialProps: { session: aSession as AppSession | null },
				wrapper: StrictMode,
			},
		);

		rerender({ session: bSession });
		pending.resolve({
			ok: true,
			data: {
				...listResult,
				reservations: [{ ...reservation, id: "res-old" }],
			},
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				result: listResult,
			});
		});
	});
});
