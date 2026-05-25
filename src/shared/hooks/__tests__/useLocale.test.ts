// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createI18nInstance } from "../../i18n/config";
import { useLocale } from "../useLocale";

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

describe("useLocale", () => {
	let testI18n: ReturnType<typeof createI18nInstance>;

	beforeEach(() => {
		installMemoryStorage();
		testI18n = createI18nInstance();
	});

	afterEach(() => {
		cleanup();
	});

	const wrapper = ({ children }: { children: ReactNode }) =>
		React.createElement(I18nextProvider, { i18n: testI18n }, children);

	it("should initialize to DEFAULT_LOCALE ('en') when no locale is persisted", () => {
		const { result } = renderHook(() => useLocale(), { wrapper });

		expect(result.current.locale).toBe("en");
	});

	it("should initialize to persisted locale if one exists in localStorage", () => {
		localStorage.setItem("innhub.locale", "es");
		const esI18n = createI18nInstance();
		const esWrapper = ({ children }: { children: ReactNode }) =>
			React.createElement(I18nextProvider, { i18n: esI18n }, children);

		const { result } = renderHook(() => useLocale(), { wrapper: esWrapper });

		expect(result.current.locale).toBe("es");
	});

	it("should toggle locale between 'en' and 'es', calling changeLanguage and updating localStorage", async () => {
		const { result } = renderHook(() => useLocale(), { wrapper });

		expect(result.current.locale).toBe("en");

		await act(async () => {
			result.current.toggleLocale();
		});

		expect(result.current.locale).toBe("es");
		expect(testI18n.language).toBe("es");
		expect(localStorage.getItem("innhub.locale")).toBe("es");

		await act(async () => {
			result.current.toggleLocale();
		});

		expect(result.current.locale).toBe("en");
		expect(testI18n.language).toBe("en");
		expect(localStorage.getItem("innhub.locale")).toBe("en");
	});
});
