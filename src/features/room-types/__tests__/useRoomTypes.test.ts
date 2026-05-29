// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type { RoomType, RoomTypeFormData } from "../types";

// ── Hoisted mock helpers (run before imports) ───────────────────────────

const { mockList, mockCreate, mockUpdate, mockSoftDelete, mockListArchived, mockRestore, mockPurge } = vi.hoisted(() => ({
	mockList: vi.fn(),
	mockCreate: vi.fn(),
	mockUpdate: vi.fn(),
	mockSoftDelete: vi.fn(),
	mockListArchived: vi.fn(),
	mockRestore: vi.fn(),
	mockPurge: vi.fn(),
}));

vi.mock("../roomTypeService", () => ({
	list: mockList,
	create: mockCreate,
	update: mockUpdate,
	softDelete: mockSoftDelete,
	listArchived: mockListArchived,
	restore: mockRestore,
	purge: mockPurge,
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

const archivedQueenRoomType: RoomType = {
	...queenRoomType,
	deleted_at: "2025-07-01T00:00:00Z",
};

const allRoomTypes = [queenRoomType, singleRoomType];
const archivedRoomTypes = [archivedQueenRoomType];

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

	// ── remove() ────────────────────────────────────────────────────────

	describe("remove()", () => {
		it("calls softDelete service then refreshes on success", async () => {
			const deletedRoomType = { ...queenRoomType, deleted_at: "2025-07-01T00:00:00Z" };
			mockSoftDelete.mockResolvedValue({ ok: true, data: deletedRoomType });

			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});
			expect(mockList).toHaveBeenCalledTimes(1);

			await act(async () => {
				await result.current.remove("rt-1");
			});

			expect(mockSoftDelete).toHaveBeenCalledWith(aSession, "rt-1");
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

			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			let removeError: unknown;
			await act(async () => {
				try {
					await result.current.remove("rt-1");
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
				roomTypes: allRoomTypes,
			});
		});

		it("ignores stale remove results after the session changes", async () => {
			const removeResult = deferred<{ ok: true; data: RoomType }>();
			mockList.mockImplementation((session: AppSession) =>
				Promise.resolve({
					ok: true,
					data:
						session.propertyId === "property-1"
							? allRoomTypes
							: [queenRoomType],
				}),
			);
			mockSoftDelete.mockReturnValue(removeResult.promise);

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

			const staleRemove = result.current.remove("rt-1");
			rerender({ session: bSession });

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: [queenRoomType],
				});
			});

			await act(async () => {
				removeResult.resolve({
					ok: true,
					data: { ...queenRoomType, deleted_at: "2025-07-01T00:00:00Z" },
				});
				await staleRemove;
			});

			// State should remain with bSession's data
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: [queenRoomType],
			});
		});
	});

	// ── toggleArchived() ────────────────────────────────────────────────

	describe("toggleArchived()", () => {
		beforeEach(() => {
			mockListArchived.mockResolvedValue({ ok: true, data: archivedRoomTypes });
		});

		it("starts with showArchived = false", async () => {
			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			expect(result.current.showArchived).toBe(false);
		});

		it("toggleArchived switches to archived view and calls listArchived", async () => {
			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});
			expect(mockList).toHaveBeenCalledTimes(1);

			await act(async () => {
				result.current.toggleArchived();
			});

			expect(result.current.showArchived).toBe(true);
			expect(mockListArchived).toHaveBeenCalledWith(aSession);
			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});
		});

		it("toggleArchived switches back to active view and calls list", async () => {
			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			expect(result.current.showArchived).toBe(true);
			expect(mockListArchived).toHaveBeenCalledTimes(1);

			// Toggle back to active
			await act(async () => {
				result.current.toggleArchived();
			});

			expect(result.current.showArchived).toBe(false);
			expect(mockList).toHaveBeenCalledTimes(2);
			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});
		});
	});

	// ── refresh() respects current mode ──────────────────────────────────

	describe("refresh() respects current mode", () => {
		beforeEach(() => {
			mockListArchived.mockResolvedValue({ ok: true, data: archivedRoomTypes });
		});

		it("refresh() calls listArchived when showArchived is true", async () => {
			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});

			const refreshedArchived = [{ ...archivedQueenRoomType, id: "rt-5" }];
			mockListArchived.mockResolvedValue({ ok: true, data: refreshedArchived });

			await act(async () => {
				await result.current.refresh();
			});

			expect(mockListArchived).toHaveBeenCalledTimes(2);
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: refreshedArchived,
			});
		});

		it("refresh() calls list when showArchived is false", async () => {
			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

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
	});

	// ── restore() ────────────────────────────────────────────────────────

	describe("restore()", () => {
		beforeEach(() => {
			mockListArchived.mockResolvedValue({ ok: true, data: archivedRoomTypes });
		});

		it("restore() calls service then refreshes archived view on success", async () => {
			mockRestore.mockResolvedValue({
				ok: true,
				data: { ...archivedQueenRoomType, deleted_at: null },
			});

			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});
			expect(mockListArchived).toHaveBeenCalledTimes(1);

			// Restore
			await act(async () => {
				await result.current.restore("rt-1");
			});

			expect(mockRestore).toHaveBeenCalledWith(aSession, "rt-1");
			// After restore, archived list refreshes
			await waitFor(() => {
				expect(mockListArchived).toHaveBeenCalledTimes(2);
			});
		});

		it("restore() throws error on failure and does not refresh", async () => {
			mockRestore.mockResolvedValue({
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

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});

			let restoreError: unknown;
			await act(async () => {
				try {
					await result.current.restore("rt-1");
				} catch (error) {
					restoreError = error;
				}
			});

			expect(restoreError).toEqual({
				code: "validation-error",
				message: "A room type with this name already exists.",
			});
			// Should NOT have refreshed
			expect(mockListArchived).toHaveBeenCalledTimes(1);
		});

		it("ignores stale restore results after session changes", async () => {
			const restoreResult = deferred<{ ok: true; data: RoomType }>();
			mockRestore.mockReturnValue(restoreResult.promise);
			// Make listArchived session-aware: bSession returns active data (showArchived=false after rerender)
			mockListArchived.mockImplementation((session: AppSession) =>
				Promise.resolve({
					ok: true,
					data:
						session.propertyId === "property-1"
							? archivedRoomTypes
							: allRoomTypes,
				}),
			);

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

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});

			const staleRestore = result.current.restore("rt-1");
			rerender({ session: bSession });

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			await act(async () => {
				restoreResult.resolve({
					ok: true,
					data: { ...archivedQueenRoomType, deleted_at: null },
				});
				await staleRestore;
			});

			// State should NOT be updated with stale data
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});
	});

	// ── purge() ──────────────────────────────────────────────────────────

	describe("purge()", () => {
		beforeEach(() => {
			mockListArchived.mockResolvedValue({ ok: true, data: archivedRoomTypes });
		});

		it("purge() calls service then refreshes archived view on success", async () => {
			mockPurge.mockResolvedValue({
				ok: true,
				data: archivedQueenRoomType,
			});

			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});
			expect(mockListArchived).toHaveBeenCalledTimes(1);

			// Purge
			await act(async () => {
				await result.current.purge("rt-1");
			});

			expect(mockPurge).toHaveBeenCalledWith(aSession, "rt-1");
			// After purge, archived list refreshes
			await waitFor(() => {
				expect(mockListArchived).toHaveBeenCalledTimes(2);
			});
		});

		it("purge() throws foreign-key-conflict error and does not refresh", async () => {
			mockPurge.mockResolvedValue({
				ok: false,
				error: {
					code: "foreign-key-conflict",
					message: "This record is referenced by other data and cannot be deleted.",
				},
			});

			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});

			let purgeError: unknown;
			await act(async () => {
				try {
					await result.current.purge("rt-1");
				} catch (error) {
					purgeError = error;
				}
			});

			expect(purgeError).toEqual({
				code: "foreign-key-conflict",
				message: "This record is referenced by other data and cannot be deleted.",
			});
			// Should NOT have refreshed
			expect(mockListArchived).toHaveBeenCalledTimes(1);
		});

		it("purge() throws non-FK error (e.g. permission-denied) and does not refresh", async () => {
			mockPurge.mockResolvedValue({
				ok: false,
				error: { code: "validation-error", message: "permission-denied" },
			});

			const { result } = renderHook(() => useRoomTypes(aSession));

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});

			let purgeError: unknown;
			await act(async () => {
				try {
					await result.current.purge("rt-1");
				} catch (error) {
					purgeError = error;
				}
			});

			expect(purgeError).toEqual({
				code: "validation-error",
				message: "permission-denied",
			});
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: archivedRoomTypes,
			});
			expect(mockListArchived).toHaveBeenCalledTimes(1);
		});

		it("ignores stale purge results after session changes", async () => {
			const purgeResult = deferred<{ ok: true; data: RoomType }>();
			mockPurge.mockReturnValue(purgeResult.promise);
			// Make listArchived session-aware: bSession returns active data
			mockListArchived.mockImplementation((session: AppSession) =>
				Promise.resolve({
					ok: true,
					data:
						session.propertyId === "property-1"
							? archivedRoomTypes
							: allRoomTypes,
				}),
			);

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

			// Toggle to archived
			await act(async () => {
				result.current.toggleArchived();
			});

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: archivedRoomTypes,
				});
			});

			const stalePurge = result.current.purge("rt-1");
			rerender({ session: bSession });

			await waitFor(() => {
				expect(result.current.state).toEqual({
					status: "loaded",
					roomTypes: allRoomTypes,
				});
			});

			await act(async () => {
				purgeResult.resolve({
					ok: true,
					data: archivedQueenRoomType,
				});
				await stalePurge;
			});

			// State should NOT be updated with stale data
			expect(result.current.state).toEqual({
				status: "loaded",
				roomTypes: allRoomTypes,
			});
		});
	});
});
