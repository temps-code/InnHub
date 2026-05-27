// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type { ProfileData } from "../types";

// ── Hoisted mock helpers ───────────────────────────────────────────

const { mockGetProfile, mockUpdateProfile } = vi.hoisted(() => ({
	mockGetProfile: vi.fn(),
	mockUpdateProfile: vi.fn(),
}));

vi.mock("../profileService", () => ({
	getProfileData: mockGetProfile,
	updateProfileFullName: mockUpdateProfile,
}));

// ── Import AFTER mock ──────────────────────────────────────────────

import { useCurrentProfile } from "../useCurrentProfile";

// ── Test data ──────────────────────────────────────────────────────

const profileData: ProfileData = {
	fullName: "Admin User",
	email: "admin@innhub.test",
	role: "administrator",
	propertyName: "My Hotel",
};

const updatedProfileData: ProfileData = {
	...profileData,
	fullName: "Updated Name",
};

const aSession: AppSession = {
	user: { id: "auth-user-1", email: "admin@innhub.test" },
	profile: {
		id: "profile-1",
		authUserId: "auth-user-1",
		propertyId: "property-1",
		role: "administrator",
		status: "active",
		fullName: "Admin User",
	},
	propertyId: "property-1",
};

const bSession: AppSession = {
	user: { id: "auth-user-2", email: "other@innhub.test" },
	profile: {
		id: "profile-2",
		authUserId: "auth-user-2",
		propertyId: "property-2",
		role: "receptionist",
		status: "active",
		fullName: "Other User",
	},
	propertyId: "property-2",
};

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolver) => {
		resolve = resolver;
	});
	return { promise, resolve };
}

// ── Tests ──────────────────────────────────────────────────────────

describe("useCurrentProfile", () => {
	beforeEach(() => {
		mockGetProfile.mockResolvedValue({ ok: true, data: profileData });
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("starts in loading state", () => {
		const { result } = renderHook(() => useCurrentProfile(aSession));

		expect(result.current.state).toEqual({ status: "loading" });
	});

	it("transitions to loaded state after a successful fetch", async () => {
		const { result } = renderHook(() => useCurrentProfile(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: profileData,
			});
		});
	});

	it("loads profile data after StrictMode replays effects", async () => {
		const { result } = renderHook(() => useCurrentProfile(aSession), {
			wrapper: StrictMode,
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: profileData,
			});
		});
	});

	it("transitions to error state after a failed fetch", async () => {
		mockGetProfile.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Backend unavailable." },
		});

		const { result } = renderHook(() => useCurrentProfile(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "error",
				error: { code: "backend-error", message: "Backend unavailable." },
			});
		});
	});

	it("ignores stale load results after the session changes", async () => {
		const firstLoad = deferred<{ ok: true; data: ProfileData }>();
		const secondLoad = deferred<{ ok: true; data: ProfileData }>();
		mockGetProfile.mockImplementation((session: AppSession) =>
			session.propertyId === "property-1"
				? firstLoad.promise
				: secondLoad.promise,
		);

		const { result, rerender } = renderHook(
			({ session }) => useCurrentProfile(session),
			{ initialProps: { session: aSession } },
		);

		rerender({ session: bSession });

		await act(async () => {
			firstLoad.resolve({ ok: true, data: profileData });
		});

		expect(result.current.state).toEqual({ status: "loading" });

		await act(async () => {
			secondLoad.resolve({ ok: true, data: updatedProfileData });
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: updatedProfileData,
			});
		});
	});

	it("calls getProfileData with the session", async () => {
		renderHook(() => useCurrentProfile(aSession));

		await waitFor(() => {
			expect(mockGetProfile).toHaveBeenCalledWith(aSession);
		});
	});

	it("update() calls updateProfileFullName then refreshes on success", async () => {
		// First call returns profileData; subsequent calls return updatedProfileData
		mockGetProfile
			.mockResolvedValueOnce({ ok: true, data: profileData })
			.mockResolvedValue({ ok: true, data: updatedProfileData });
		mockUpdateProfile.mockResolvedValue({ ok: true, data: null });

		const { result } = renderHook(() => useCurrentProfile(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: profileData,
			});
		});
		expect(mockGetProfile).toHaveBeenCalledTimes(1);

		await act(async () => {
			await result.current.update("Updated Name");
		});

		expect(mockUpdateProfile).toHaveBeenCalledWith(aSession, "Updated Name");
		await waitFor(() => {
			expect(mockGetProfile).toHaveBeenCalledTimes(2);
		});
		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: updatedProfileData,
			});
		});
	});

	it("update() transitions to error when update service fails", async () => {
		mockUpdateProfile.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Update failed." },
		});

		const { result } = renderHook(() => useCurrentProfile(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: profileData,
			});
		});

		let updateError: unknown;
		await act(async () => {
			try {
				await result.current.update("Updated Name");
			} catch (error) {
				updateError = error;
			}
		});

		expect(updateError).toEqual({
			code: "backend-error",
			message: "Update failed.",
		});
		expect(result.current.state).toEqual({
			status: "error",
			error: { code: "backend-error", message: "Update failed." },
		});
	});

	it("ignores stale update results after the session changes", async () => {
		const updateResult = deferred<{ ok: true; data: null }>();
		mockGetProfile.mockImplementation((session: AppSession) =>
			Promise.resolve({
				ok: true,
				data:
					session.propertyId === "property-1" ? profileData : updatedProfileData,
			}),
		);
		mockUpdateProfile.mockReturnValue(updateResult.promise);

		const { result, rerender } = renderHook(
			({ session }) => useCurrentProfile(session),
			{ initialProps: { session: aSession } },
		);

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: profileData,
			});
		});

		const staleUpdate = result.current.update("Stale Name");
		rerender({ session: bSession });

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: updatedProfileData,
			});
		});

		await act(async () => {
			updateResult.resolve({ ok: true, data: null });
			await staleUpdate;
		});

		expect(result.current.state).toEqual({
			status: "loaded",
			profile: updatedProfileData,
		});
	});

	it("refresh() reloads profile data", async () => {
		const { result } = renderHook(() => useCurrentProfile(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: profileData,
			});
		});
		expect(mockGetProfile).toHaveBeenCalledTimes(1);

		const refreshed = { ...profileData, fullName: "Refreshed Name" };
		mockGetProfile.mockResolvedValue({ ok: true, data: refreshed });

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockGetProfile).toHaveBeenCalledTimes(2);
		expect(result.current.state).toEqual({
			status: "loaded",
			profile: refreshed,
		});
	});

	it("refresh() transitions to error on failure", async () => {
		const { result } = renderHook(() => useCurrentProfile(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				profile: profileData,
			});
		});

		mockGetProfile.mockResolvedValue({
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
});
