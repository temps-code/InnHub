// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type { RoomType, RoomTypeFormData } from "../types";

// ── Hoisted mock helpers (run before imports) ───────────────────────────

const { mockList, mockCreate, mockUpdate } = vi.hoisted(() => ({
	mockList: vi.fn(),
	mockCreate: vi.fn(),
	mockUpdate: vi.fn(),
}));

vi.mock("../roomTypeService", () => ({
	list: mockList,
	create: mockCreate,
	update: mockUpdate,
}));

// ── Import AFTER mock is set up ─────────────────────────────────────────

import { useRoomTypes } from "../useRoomTypes";

// ── Test data ───────────────────────────────────────────────────────────

const queenRoomType: RoomType = {
	id: "rt-1",
	property_id: "property-1",
	name: "Standard Queen",
	description: "A standard queen-sized room",
	capacity: 2,
	base_price: 150.0,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
};

const singleRoomType: RoomType = {
	id: "rt-2",
	property_id: "property-1",
	name: "Single",
	description: null,
	capacity: 1,
	base_price: 80.0,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
};

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
	user: { id: "auth-user-2", email: "owner@innhub.test" },
	profile: {
		id: "profile-2",
		authUserId: "auth-user-2",
		propertyId: "property-2",
		role: "administrator",
		status: "active",
	},
	propertyId: "property-2",
};

const formData: RoomTypeFormData = {
	name: "Suite Deluxe",
	description: "A luxurious suite",
	capacity: 4,
	base_price: 300.0,
};

const updatedFormData: RoomTypeFormData = {
	name: "Standard Queen Updated",
	description: "Updated description",
	capacity: 3,
	base_price: 180.0,
};

const allRoomTypes = [queenRoomType, singleRoomType];

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolver) => {
		resolve = resolver;
	});

	return { promise, resolve };
}

// ── Tests ───────────────────────────────────────────────────────────────

describe("useRoomTypes", () => {
	beforeEach(() => {
		mockList.mockResolvedValue({ ok: true, data: allRoomTypes });
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	// ── State machine ──────────────────────────────────────────────────

	it("starts in loading state", () => {
		const { result } = renderHook(() => useRoomTypes(aSession));

		expect(result.current.state).toEqual({ status: "loading" });
	});

	it("transitions to loaded state after a successful fetch", async () => {
		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});
	});

	it("loads room types after StrictMode replays effects", async () => {
		const { result } = renderHook(() => useRoomTypes(aSession), {
			wrapper: StrictMode,
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});
	});

	it("transitions to loaded state with empty array when no room types exist", async () => {
		mockList.mockResolvedValue({ ok: true, data: [] });

		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: [],
			});
		});
	});

	it("transitions to error state after a failed fetch", async () => {
		mockList.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Backend unavailable." },
		});

		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "error",
				error: { code: "backend-error", message: "Backend unavailable." },
			});
		});
	});

	// ── Stale-request protection ────────────────────────────────────────

	it("ignores stale load results after the session changes", async () => {
		const firstLoad = deferred<{ ok: true; data: RoomType[] }>();
		const secondLoad = deferred<{ ok: true; data: RoomType[] }>();
		mockList.mockImplementation((session: AppSession) =>
			session.propertyId === "property-1"
				? firstLoad.promise
				: secondLoad.promise,
		);

		const { result, rerender } = renderHook(
			({ session }) => useRoomTypes(session),
			{ initialProps: { session: aSession } },
		);

		rerender({ session: bSession });

		await act(async () => {
			firstLoad.resolve({ ok: true, data: allRoomTypes });
		});

		expect(result.current.state).toEqual({ status: "loading" });

		const bRoomTypes = [queenRoomType];
		await act(async () => {
			secondLoad.resolve({ ok: true, data: bRoomTypes });
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: bRoomTypes,
			});
		});
	});

	// ── create() ────────────────────────────────────────────────────────

	it("create() calls the create service then refreshes on success", async () => {
		const newRoomType = { ...queenRoomType, id: "rt-3", name: "Suite Deluxe" };
		mockCreate.mockResolvedValue({ ok: true, data: newRoomType });

		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});
		expect(mockList).toHaveBeenCalledTimes(1);

		await act(async () => {
			await result.current.create(formData);
		});

		expect(mockCreate).toHaveBeenCalledWith(aSession, formData);
		// After create success, should have refreshed (second list call)
		await waitFor(() => {
			expect(mockList).toHaveBeenCalledTimes(2);
		});
	});

	it("create() transitions to error when the service fails", async () => {
		mockCreate.mockResolvedValue({
			ok: false,
			error: {
				code: "validation-error",
				message: "A room type with this name already exists.",
			},
		});

		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});

		let createError: unknown;
		await act(async () => {
			try {
				await result.current.create(formData);
			} catch (error) {
				createError = error;
			}
		});

		expect(createError).toEqual({
			code: "validation-error",
			message: "A room type with this name already exists.",
		});
		expect(result.current.state).toEqual({
			status: "loaded",
			roomTypes: allRoomTypes,
		});
	});

	// ── update() ────────────────────────────────────────────────────────

	it("update() calls the update service then refreshes on success", async () => {
		const updated = { ...queenRoomType, ...updatedFormData };
		mockUpdate.mockResolvedValue({ ok: true, data: updated });

		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});
		expect(mockList).toHaveBeenCalledTimes(1);

		await act(async () => {
			await result.current.update("rt-1", updatedFormData);
		});

		expect(mockUpdate).toHaveBeenCalledWith(aSession, "rt-1", updatedFormData);
		// After update success, should have refreshed (second list call)
		await waitFor(() => {
			expect(mockList).toHaveBeenCalledTimes(2);
		});
	});

	it("update() transitions to error when the service fails", async () => {
		mockUpdate.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Update failed." },
		});

		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});

		let updateError: unknown;
		await act(async () => {
			try {
				await result.current.update("rt-1", updatedFormData);
			} catch (error) {
				updateError = error;
			}
		});

		expect(updateError).toEqual({
			code: "backend-error",
			message: "Update failed.",
		});
		expect(result.current.state).toEqual({
			status: "loaded",
			roomTypes: allRoomTypes,
		});
	});

	// ── Stale-request protection for create/update ──────────────────────

	it("ignores stale create results after the session changes", async () => {
		const createResult = deferred<{ ok: true; data: RoomType }>();
		mockList.mockImplementation((session: AppSession) =>
			Promise.resolve({
				ok: true,
				data:
					session.propertyId === "property-1"
						? allRoomTypes
						: [queenRoomType],
			}),
		);
		mockCreate.mockReturnValue(createResult.promise);

		const { result, rerender } = renderHook(
			({ session }) => useRoomTypes(session),
			{ initialProps: { session: aSession } },
		);

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});

		const staleCreate = result.current.create(formData);
		rerender({ session: bSession });

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: [queenRoomType],
			});
		});

		await act(async () => {
			createResult.resolve({
				ok: true,
				data: { ...queenRoomType, ...formData },
			});
			await staleCreate;
		});

		// State should remain with bSession's data (the session changed)
		expect(result.current.state).toEqual({
			status: "loaded",
			roomTypes: [queenRoomType],
		});
	});

	it("ignores stale update results after the session changes", async () => {
		const updateResult = deferred<{ ok: true; data: RoomType }>();
		mockList.mockImplementation((session: AppSession) =>
			Promise.resolve({
				ok: true,
				data:
					session.propertyId === "property-1"
						? allRoomTypes
						: [queenRoomType],
			}),
		);
		mockUpdate.mockReturnValue(updateResult.promise);

		const { result, rerender } = renderHook(
			({ session }) => useRoomTypes(session),
			{ initialProps: { session: aSession } },
		);

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});

		const staleUpdate = result.current.update("rt-1", updatedFormData);
		rerender({ session: bSession });

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: [queenRoomType],
			});
		});

		await act(async () => {
			updateResult.resolve({
				ok: true,
				data: { ...queenRoomType, ...updatedFormData },
			});
			await staleUpdate;
		});

		// State should remain with bSession's data
		expect(result.current.state).toEqual({
			status: "loaded",
			roomTypes: [queenRoomType],
		});
	});

	// ── refresh() ───────────────────────────────────────────────────────

	it("refresh() reloads the room types list", async () => {
		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});
		expect(mockList).toHaveBeenCalledTimes(1);

		const refreshed = [singleRoomType];
		mockList.mockResolvedValue({ ok: true, data: refreshed });

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockList).toHaveBeenCalledTimes(2);
		expect(result.current.state).toEqual({
			status: "loaded",
			roomTypes: refreshed,
		});
	});

	it("refresh() transitions to error on failure", async () => {
		const { result } = renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});

		mockList.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Refresh failed." },
		});

		await act(async () => {
			await result.current.refresh();
		});

		expect(result.current.state).toEqual({
			status: "error",
			error: { code: "backend-error", message: "Refresh failed." },
		});
	});

	it("calls list with the session on mount", async () => {
		renderHook(() => useRoomTypes(aSession));

		await waitFor(() => {
			expect(mockList).toHaveBeenCalledWith(aSession);
		});
	});

	it("uses latest session in load after a session change", async () => {
		const { rerender } = renderHook(
			({ session }) => useRoomTypes(session),
			{ initialProps: { session: aSession } },
		);

		await waitFor(() => {
			expect(mockList).toHaveBeenCalledTimes(1);
		});

		rerender({ session: bSession });

		// Should re-fetch with the new session
		await waitFor(() => {
			expect(mockList).toHaveBeenCalledWith(bSession);
		});
	});
});
