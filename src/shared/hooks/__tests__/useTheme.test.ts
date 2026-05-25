// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "../useTheme";

function installMemoryStorage() {
	const data = new Map<string, string>();
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		value: {
			clear: () => data.clear(),
			getItem: (key: string) => data.get(key) ?? null,
			setItem: (key: string, value: string) => data.set(key, value),
		},
	});
}

describe("useTheme", () => {
	beforeEach(() => {
		installMemoryStorage();
		document.documentElement.removeAttribute("data-theme");
		vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})));
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("should resolve to light by default if no stored theme and no OS dark preference", () => {
		const { result } = renderHook(() => useTheme());

		expect(result.current.theme).toBe("light");
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
	});

	it("should resolve to dark if OS dark preference is active and no stored theme", () => {
		vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
			matches: query === "(prefers-color-scheme: dark)",
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})));

		const { result } = renderHook(() => useTheme());

		expect(result.current.theme).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("should resolve to stored theme if a valid value is stored in localStorage", () => {
		localStorage.setItem("innhub.theme", "dark");

		const { result } = renderHook(() => useTheme());

		expect(result.current.theme).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("should fall back to OS preference/light and not crash if storage contains an invalid value", () => {
		localStorage.setItem("innhub.theme", "invalid-value");

		const { result } = renderHook(() => useTheme());

		expect(result.current.theme).toBe("light");
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
	});

	it("should toggle the theme from light to dark and update DOM and localStorage", () => {
		const { result } = renderHook(() => useTheme());

		expect(result.current.theme).toBe("light");

		act(() => {
			result.current.toggleTheme();
		});

		expect(result.current.theme).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(localStorage.getItem("innhub.theme")).toBe("dark");

		act(() => {
			result.current.toggleTheme();
		});

		expect(result.current.theme).toBe("light");
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
		expect(localStorage.getItem("innhub.theme")).toBe("light");
	});
});
