// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type { Guest, GuestFormData, GuestListResult } from "../types";

const {
	mockList,
	mockListTrash,
	mockCreate,
	mockUpdate,
	mockSoftDelete,
	mockRestore,
	mockPurge,
} = vi.hoisted(() => ({
	mockList: vi.fn(),
	mockListTrash: vi.fn(),
	mockCreate: vi.fn(),
	mockUpdate: vi.fn(),
	mockSoftDelete: vi.fn(),
	mockRestore: vi.fn(),
	mockPurge: vi.fn(),
}));

vi.mock("../guestService", () => ({
	list: mockList,
	listTrash: mockListTrash,
	create: mockCreate,
	update: mockUpdate,
	softDelete: mockSoftDelete,
	restore: mockRestore,
	purge: mockPurge,
}));

import { useGuests } from "../useGuests";

const aSession: AppSession = {
	user: { id: "auth-user-1", email: "admin@innhub.test" },
	profile: {
		id: "profile-1",
		authUserId: "auth-user-1",
		propertyId: "property-1",
		role: "administrator",
		status: "active",
	},
	propertyId: "property-1",
};

const bSession: AppSession = {
	user: { id: "auth-user-2", email: "admin2@innhub.test" },
	profile: {
		id: "profile-2",
		authUserId: "auth-user-2",
		propertyId: "property-2",
		role: "administrator",
		status: "active",
	},
	propertyId: "property-2",
};

const guest: Guest = {
	id: "guest-1",
	property_id: "property-1",
	first_name: "James",
	last_name: "Davis",
	document_type: "passport",
	document_number: "A123",
	email: "james@example.com",
	phone: "+123",
	notes: "VIP",
	created_at: "2026-01-01T00:00:00Z",
	updated_at: "2026-01-01T00:00:00Z",
	deleted_at: null,
};

const listResult: GuestListResult = {
	guests: [guest],
	page: 1,
	pageSize: 20,
	total: 1,
};

const guestFormData: GuestFormData = {
	first_name: "John",
	last_name: "Smith",
	document_type: "passport",
	document_number: "A-9876",
	email: "john@example.com",
	phone: null,
	notes: null,
};

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolver) => {
		resolve = resolver;
	});

	return { promise, resolve };
}

describe("useGuests", () => {
	beforeEach(() => {
		mockList.mockResolvedValue({ ok: true, data: listResult });
		mockListTrash.mockResolvedValue({
			ok: true,
			data: { ...listResult, guests: [], total: 0 },
		});
		mockCreate.mockResolvedValue({ ok: true, data: guest });
		mockUpdate.mockResolvedValue({ ok: true, data: guest });
		mockSoftDelete.mockResolvedValue({ ok: true, data: guest });
		mockRestore.mockResolvedValue({ ok: true, data: guest });
		mockPurge.mockResolvedValue({
			ok: true,
			data: { guest, blockingCount: 0 },
		});
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("loads active guests by default", async () => {
		const { result } = renderHook(() => useGuests(aSession));

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
		expect(mockListTrash).not.toHaveBeenCalled();
	});

	it("switches to trash mode and resets page", async () => {
		const { result } = renderHook(() => useGuests(aSession));

		await waitFor(() => expect(result.current.state.status).toBe("loaded"));
		await act(async () => {
			result.current.setPage(3);
			result.current.toggleTrash();
		});

		await waitFor(() => {
			expect(mockListTrash).toHaveBeenCalledWith(
				aSession,
				expect.objectContaining({ page: 1, pageSize: 20 }),
			);
		});
		expect(result.current.showTrash).toBe(true);
		expect(result.current.params.page).toBe(1);
	});

	it("changes search/activity and resets page", async () => {
		const { result } = renderHook(() => useGuests(aSession));
		await waitFor(() => expect(result.current.state.status).toBe("loaded"));

		await act(async () => {
			result.current.setPage(2);
			result.current.setSearch("james");
		});

		await waitFor(() => {
			expect(mockList).toHaveBeenLastCalledWith(
				aSession,
				expect.objectContaining({ search: "james", page: 1, pageSize: 20 }),
			);
		});

		await act(async () => {
			result.current.setActivity("withOpenReservations");
		});
		await waitFor(() => {
			expect(mockList).toHaveBeenLastCalledWith(
				aSession,
				expect.objectContaining({
					activity: "withOpenReservations",
					page: 1,
					pageSize: 20,
				}),
			);
		});
	});

	it("refreshes after create/update/remove/restore/purge", async () => {
		const { result } = renderHook(() => useGuests(aSession));
		await waitFor(() => expect(result.current.state.status).toBe("loaded"));

		await act(async () => {
			await result.current.create(guestFormData);
			await result.current.update(guest.id, guestFormData);
			await result.current.remove(guest.id);
			result.current.toggleTrash();
		});
		await waitFor(() => expect(result.current.showTrash).toBe(true));
		await act(async () => {
			await result.current.restore(guest.id);
			await result.current.purge(guest.id);
		});

		expect(mockCreate).toHaveBeenCalled();
		expect(mockUpdate).toHaveBeenCalled();
		expect(mockSoftDelete).toHaveBeenCalled();
		expect(mockRestore).toHaveBeenCalled();
		expect(mockPurge).toHaveBeenCalled();
		expect(
			mockList.mock.calls.length + mockListTrash.mock.calls.length,
		).toBeGreaterThan(2);
	});

	it("throws service errors from mutations", async () => {
		mockCreate.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "x" },
		});
		const { result } = renderHook(() => useGuests(aSession));
		await waitFor(() => expect(result.current.state.status).toBe("loaded"));

		await expect(result.current.create(guestFormData)).rejects.toMatchObject({
			code: "backend-error",
		});
	});

	it("ignores stale load results when session changes", async () => {
		const pending = deferred<{ ok: true; data: GuestListResult }>();
		mockList.mockReturnValueOnce(pending.promise);
		mockList.mockResolvedValue({ ok: true, data: listResult });

		const { result, rerender } = renderHook(
			({ session }) => useGuests(session),
			{
				initialProps: { session: aSession as AppSession | null },
				wrapper: StrictMode,
			},
		);

		rerender({ session: bSession });
		pending.resolve({
			ok: true,
			data: { ...listResult, guests: [{ ...guest, id: "guest-old" }] },
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				result: listResult,
			});
		});
	});
});
