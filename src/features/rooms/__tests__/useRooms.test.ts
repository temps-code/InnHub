// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type { Room, RoomFormData } from "../types";
import type { RoomType } from "../../room-types/types";

// ── Hoisted mock helpers (run before imports) ───────────────────────────

const { mockList, mockCreate, mockUpdate, mockSoftDelete } = vi.hoisted(() => ({
	mockList: vi.fn(),
	mockCreate: vi.fn(),
	mockUpdate: vi.fn(),
	mockSoftDelete: vi.fn(),
}));

const { mockListRoomTypes } = vi.hoisted(() => ({
	mockListRoomTypes: vi.fn(),
}));

vi.mock("../roomService", () => ({
	list: mockList,
	create: mockCreate,
	update: mockUpdate,
	softDelete: mockSoftDelete,
}));

vi.mock("../../room-types/roomTypeService", () => ({
	list: mockListRoomTypes,
}));

// ── Import AFTER mock is set up ─────────────────────────────────────────

import { useRooms } from "../useRooms";

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
	deleted_at: null,
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
	deleted_at: null,
};

const room1: Room = {
	id: "room-1",
	property_id: "property-1",
	room_type_id: "rt-1",
	identifier: "101",
	floor: "1",
	state: "available",
	description: null,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: null,
};

const room2: Room = {
	id: "room-2",
	property_id: "property-1",
	room_type_id: "rt-2",
	identifier: "102",
	floor: "1",
	state: "occupied",
	description: "Corner room",
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: null,
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

const formData: RoomFormData = {
	identifier: "201",
	room_type_id: "rt-1",
	floor: "2",
	state: "available",
};

const updatedFormData: RoomFormData = {
	identifier: "101-updated",
	room_type_id: "rt-1",
	floor: "1",
	state: "occupied",
	description: "Updated room",
};

const allRooms = [room1, room2];
const allRoomTypes = [queenRoomType, singleRoomType];

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolver) => {
		resolve = resolver;
	});

	return { promise, resolve };
}

// ── Tests ───────────────────────────────────────────────────────────────

describe("useRooms", () => {
	beforeEach(() => {
		mockList.mockResolvedValue({ ok: true, data: allRooms });
		mockListRoomTypes.mockResolvedValue({ ok: true, data: allRoomTypes });
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	// ── State machine ──────────────────────────────────────────────────

	it("starts in loading state", () => {
		const { result } = renderHook(() => useRooms(aSession));

		expect(result.current.state).toEqual({ status: "loading" });
	});

	it("transitions to loaded state after a successful fetch", async () => {
		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});
	});

	it("loads rooms after StrictMode replays effects", async () => {
		const { result } = renderHook(() => useRooms(aSession), {
			wrapper: StrictMode,
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});
	});

	it("transitions to loaded state with empty array when no rooms exist", async () => {
		mockList.mockResolvedValue({ ok: true, data: [] });

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: [],
			});
		});
	});

	it("transitions to error state after a failed fetch", async () => {
		mockList.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Backend unavailable." },
		});

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "error",
				error: { code: "backend-error", message: "Backend unavailable." },
			});
		});
	});

	// ── Room types loading ─────────────────────────────────────────────

	it("loads room types on mount", async () => {
		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});

		expect(result.current.roomTypes).toEqual(allRoomTypes);
		expect(mockListRoomTypes).toHaveBeenCalledWith(aSession);
	});

	it("sets empty room types when roomTypeService returns empty", async () => {
		mockListRoomTypes.mockResolvedValue({ ok: true, data: [] });

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});

		expect(result.current.roomTypes).toEqual([]);
	});

	it("does not crash when roomTypeService fails on mount", async () => {
		mockListRoomTypes.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Failed." },
		});

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});

		// roomTypes remains empty (default) since the service failed
		expect(result.current.roomTypes).toEqual([]);
	});

	// ── Stale-request protection ────────────────────────────────────────

	it("ignores stale load results after the session changes", async () => {
		const firstLoad = deferred<{ ok: true; data: Room[] }>();
		const secondLoad = deferred<{ ok: true; data: Room[] }>();
		mockList.mockImplementation((session: AppSession) =>
			session.propertyId === "property-1"
				? firstLoad.promise
				: secondLoad.promise,
		);

		const { result, rerender } = renderHook(
			({ session }) => useRooms(session),
			{ initialProps: { session: aSession } },
		);

		rerender({ session: bSession });

		await act(async () => {
			firstLoad.resolve({ ok: true, data: allRooms });
		});

		expect(result.current.state).toEqual({ status: "loading" });

		const bRooms = [room1];
		await act(async () => {
			secondLoad.resolve({ ok: true, data: bRooms });
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: bRooms,
			});
		});
	});

	// ── create() ────────────────────────────────────────────────────────

	it("create() calls the create service then refreshes on success", async () => {
		const newRoom = { ...room1, id: "room-3", identifier: "201" };
		mockCreate.mockResolvedValue({ ok: true, data: newRoom });

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
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
				message: "A room with this identifier already exists.",
			},
		});

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
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
			message: "A room with this identifier already exists.",
		});
		expect(result.current.state).toEqual({
			status: "loaded",
			rooms: allRooms,
		});
	});

	// ── update() ────────────────────────────────────────────────────────

	it("update() calls the update service then refreshes on success", async () => {
		const updated = { ...room1, ...updatedFormData };
		mockUpdate.mockResolvedValue({ ok: true, data: updated });

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});
		expect(mockList).toHaveBeenCalledTimes(1);

		await act(async () => {
			await result.current.update("room-1", updatedFormData);
		});

		expect(mockUpdate).toHaveBeenCalledWith(aSession, "room-1", updatedFormData);
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

		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});

		let updateError: unknown;
		await act(async () => {
			try {
				await result.current.update("room-1", updatedFormData);
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
			rooms: allRooms,
		});
	});

	// ── Stale-request protection for create/update ──────────────────────

	it("ignores stale create results after the session changes", async () => {
		const createResult = deferred<{ ok: true; data: Room }>();
		mockList.mockImplementation((session: AppSession) =>
			Promise.resolve({
				ok: true,
				data:
					session.propertyId === "property-1"
						? allRooms
						: [room1],
			}),
		);
		mockCreate.mockReturnValue(createResult.promise);

		const { result, rerender } = renderHook(
			({ session }) => useRooms(session),
			{ initialProps: { session: aSession } },
		);

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});

		const staleCreate = result.current.create(formData);
		rerender({ session: bSession });

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: [room1],
			});
		});

		await act(async () => {
			createResult.resolve({
				ok: true,
				data: { ...room1, ...formData },
			});
			await staleCreate;
		});

		// State should remain with bSession's data (the session changed)
		expect(result.current.state).toEqual({
			status: "loaded",
			rooms: [room1],
		});
	});

	it("ignores stale update results after the session changes", async () => {
		const updateResult = deferred<{ ok: true; data: Room }>();
		mockList.mockImplementation((session: AppSession) =>
			Promise.resolve({
				ok: true,
				data:
					session.propertyId === "property-1"
						? allRooms
						: [room1],
			}),
		);
		mockUpdate.mockReturnValue(updateResult.promise);

		const { result, rerender } = renderHook(
			({ session }) => useRooms(session),
			{ initialProps: { session: aSession } },
		);

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});

		const staleUpdate = result.current.update("room-1", updatedFormData);
		rerender({ session: bSession });

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: [room1],
			});
		});

		await act(async () => {
			updateResult.resolve({
				ok: true,
				data: { ...room1, ...updatedFormData },
			});
			await staleUpdate;
		});

		// State should remain with bSession's data
		expect(result.current.state).toEqual({
			status: "loaded",
			rooms: [room1],
		});
	});

	// ── refresh() ───────────────────────────────────────────────────────

	it("refresh() reloads the rooms list", async () => {
		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});
		expect(mockList).toHaveBeenCalledTimes(1);

		const refreshed = [room2];
		mockList.mockResolvedValue({ ok: true, data: refreshed });

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockList).toHaveBeenCalledTimes(2);
		expect(result.current.state).toEqual({
			status: "loaded",
			rooms: refreshed,
		});
	});

	it("refresh() transitions to error on failure", async () => {
		const { result } = renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
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
		renderHook(() => useRooms(aSession));

		await waitFor(() => {
			expect(mockList).toHaveBeenCalledWith(aSession);
		});
	});

	it("uses latest session in load after a session change", async () => {
		const { rerender } = renderHook(
			({ session }) => useRooms(session),
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

	// ── remove() ────────────────────────────────────────────────────────

	describe("remove()", () => {
		it("calls softDelete service then refreshes on success", async () => {
			const deletedRoom = { ...room1, deleted_at: "2025-07-01T00:00:00Z" };
			mockSoftDelete.mockResolvedValue({ ok: true, data: deletedRoom });

			const { result } = renderHook(() => useRooms(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					rooms: allRooms,
				});
			});
			expect(mockList).toHaveBeenCalledTimes(1);

			await act(async () => {
				await result.current.remove("room-1");
			});

			expect(mockSoftDelete).toHaveBeenCalledWith(aSession, "room-1");
			// After remove success, should have refreshed (second list call)
			await waitFor(() => {
				expect(mockList).toHaveBeenCalledTimes(2);
			});
		});

		it("throws error when softDelete fails and does not refresh", async () => {
			mockSoftDelete.mockResolvedValue({
				ok: false,
				error: { code: "backend-error", message: "Delete failed." },
			});

			const { result } = renderHook(() => useRooms(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					rooms: allRooms,
				});
			});

			let removeError: unknown;
			await act(async () => {
				try {
					await result.current.remove("room-1");
				} catch (error) {
					removeError = error;
				}
			});

			expect(removeError).toEqual({
				code: "backend-error",
				message: "Delete failed.",
			});
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: allRooms,
			});
		});

		it("ignores stale remove results after the session changes", async () => {
			const removeResult = deferred<{ ok: true; data: Room }>();
			mockList.mockImplementation((session: AppSession) =>
				Promise.resolve({
					ok: true,
					data:
						session.propertyId === "property-1"
							? allRooms
							: [room1],
				}),
			);
			mockSoftDelete.mockReturnValue(removeResult.promise);

			const { result, rerender } = renderHook(
				({ session }) => useRooms(session),
				{ initialProps: { session: aSession } },
			);

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					rooms: allRooms,
				});
			});

			const staleRemove = result.current.remove("room-1");
			rerender({ session: bSession });

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					rooms: [room1],
				});
			});

			await act(async () => {
				removeResult.resolve({
					ok: true,
					data: { ...room1, deleted_at: "2025-07-01T00:00:00Z" },
				});
				await staleRemove;
			});

			// State should remain with bSession's data
			expect(result.current.state).toEqual({
				status: "loaded",
				rooms: [room1],
			});
		});
	});
});
