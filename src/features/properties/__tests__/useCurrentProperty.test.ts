// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type { Property, PropertyFormData } from "../types";

// ── Hoisted mock helpers (run before imports) ───────────────────────────

const { mockGet, mockUpdate } = vi.hoisted(() => ({
	mockGet: vi.fn(),
	mockUpdate: vi.fn(),
}));

vi.mock("../propertyService", () => ({
	getCurrentProperty: mockGet,
	updateCurrentProperty: mockUpdate,
}));

// ── Import AFTER mock is set up ─────────────────────────────────────────

import { useCurrentProperty } from "../useCurrentProperty";

// ── Test data ───────────────────────────────────────────────────────────

const aProperty: Property = {
	id: "property-1",
	slug: "my-hotel",
	name: "My Hotel",
	business_type: "hotel",
	timezone: "America/Argentina/Buenos_Aires",
	currency: "ARS",
	address: "Av. Corrientes 1234",
	phone: "+54 11 5555-1234",
	email: "info@myhotel.test",
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

const bProperty: Property = {
	...aProperty,
	id: "property-2",
	slug: "second-hotel",
	name: "Second Hotel",
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

const formData: PropertyFormData = {
	name: "Updated Name",
	business_type: "hotel",
	timezone: "America/New_York",
	currency: "USD",
	address: "123 Main St",
	phone: "+1 555-1234",
	email: "info@updated.test",
};

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolver) => {
		resolve = resolver;
	});

	return { promise, resolve };
}

// ── Tests ───────────────────────────────────────────────────────────────

describe("useCurrentProperty", () => {
	beforeEach(() => {
		// Default: successful fetch on mount to prevent unhandled rejections
		mockGet.mockResolvedValue({ ok: true, data: aProperty });
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("starts in loading state", () => {
		const { result } = renderHook(() => useCurrentProperty(aSession));

		expect(result.current.state).toEqual({ status: "loading" });
	});

	it("transitions to loaded state after a successful fetch", async () => {
		const { result } = renderHook(() => useCurrentProperty(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: aProperty,
			});
		});
	});

	it("loads property data after StrictMode replays effects", async () => {
		const { result } = renderHook(() => useCurrentProperty(aSession), {
			wrapper: StrictMode,
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: aProperty,
			});
		});
	});

	it("transitions to error state after a failed fetch", async () => {
		mockGet.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Backend unavailable." },
		});

		const { result } = renderHook(() => useCurrentProperty(aSession));

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "error",
				error: { code: "backend-error", message: "Backend unavailable." },
			});
		});
	});

	it("ignores stale load results after the session changes", async () => {
		const firstLoad = deferred<{ ok: true; data: Property }>();
		const secondLoad = deferred<{ ok: true; data: Property }>();
		mockGet.mockImplementation((session: AppSession) =>
			session.propertyId === "property-1"
				? firstLoad.promise
				: secondLoad.promise,
		);

		const { result, rerender } = renderHook(
			({ session }) => useCurrentProperty(session),
			{ initialProps: { session: aSession } },
		);

		rerender({ session: bSession });

		await act(async () => {
			firstLoad.resolve({ ok: true, data: aProperty });
		});

		expect(result.current.state).toEqual({ status: "loading" });

		await act(async () => {
			secondLoad.resolve({ ok: true, data: bProperty });
		});

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: bProperty,
			});
		});
	});

	it("calls getCurrentProperty with the session", async () => {
		renderHook(() => useCurrentProperty(aSession));

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalledWith(aSession);
		});
	});

	it("update() calls the update service then refreshes on success", async () => {
		const updated = { ...aProperty, ...formData };
		mockUpdate.mockResolvedValue({ ok: true, data: updated });

		const { result } = renderHook(() => useCurrentProperty(aSession));

		// Wait for initial load
		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: aProperty,
			});
		});
		expect(mockGet).toHaveBeenCalledTimes(1);

		await act(async () => {
			await result.current.update(formData);
		});

		expect(mockUpdate).toHaveBeenCalledWith(aSession, formData);
		// After update success, should have refreshed (second get call)
		await waitFor(() => {
			expect(mockGet).toHaveBeenCalledTimes(2);
		});
	});

	it("update() transitions to error when update service fails", async () => {
		mockUpdate.mockResolvedValue({
			ok: false,
			error: { code: "backend-error", message: "Update failed." },
		});

		const { result } = renderHook(() => useCurrentProperty(aSession));

		// Wait for initial load
		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: aProperty,
			});
		});

		let updateError: unknown;
		await act(async () => {
			try {
				await result.current.update(formData);
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
		const updateResult = deferred<{ ok: true; data: Property }>();
		mockGet.mockImplementation((session: AppSession) =>
			Promise.resolve({
				ok: true,
				data: session.propertyId === "property-1" ? aProperty : bProperty,
			}),
		);
		mockUpdate.mockReturnValue(updateResult.promise);

		const { result, rerender } = renderHook(
			({ session }) => useCurrentProperty(session),
			{ initialProps: { session: aSession } },
		);

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: aProperty,
			});
		});

		const staleUpdate = result.current.update(formData);
		rerender({ session: bSession });

		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: bProperty,
			});
		});

		await act(async () => {
			updateResult.resolve({ ok: true, data: { ...aProperty, ...formData } });
			await staleUpdate;
		});

		expect(result.current.state).toEqual({
			status: "loaded",
			property: bProperty,
		});
	});

	it("refresh() reloads the property data", async () => {
		const { result } = renderHook(() => useCurrentProperty(aSession));

		// Wait for initial load
		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: aProperty,
			});
		});
		expect(mockGet).toHaveBeenCalledTimes(1);

		// Set up a different return for the refresh
		const refreshed = { ...aProperty, name: "Refreshed Name" };
		mockGet.mockResolvedValue({ ok: true, data: refreshed });

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockGet).toHaveBeenCalledTimes(2);
		expect(result.current.state).toEqual({
			status: "loaded",
			property: refreshed,
		});
	});

	it("refresh() transitions to error on failure", async () => {
		const { result } = renderHook(() => useCurrentProperty(aSession));

		// Wait for initial load
		await waitFor(() => {
			expect(result.current.state).toEqual({
				status: "loaded",
				property: aProperty,
			});
		});

		mockGet.mockResolvedValue({
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
