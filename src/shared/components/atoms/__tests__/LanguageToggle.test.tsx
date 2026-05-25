// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createI18nInstance } from "../../../i18n/config";
import { useLocale } from "../../../hooks/useLocale";
import { LanguageToggle } from "../LanguageToggle";

// Mock the useLocale hook
vi.mock("../../../hooks/useLocale", () => ({
	useLocale: vi.fn(),
}));

describe("LanguageToggle", () => {
	let testI18n: ReturnType<typeof createI18nInstance>;

	beforeEach(() => {
		testI18n = createI18nInstance();
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(I18nextProvider, { i18n: testI18n }, children);

	it("renders language toggle with 'EN' text and Spanish transition aria-label when locale is en", () => {
		const toggleLocale = vi.fn();
		vi.mocked(useLocale).mockReturnValue({
			locale: "en",
			toggleLocale,
		});

		render(<LanguageToggle />, { wrapper });

		const button = screen.getByRole("button");
		expect(button.textContent).toBe("EN");
		expect(button.getAttribute("aria-label")).toBe("Switch to Spanish");
	});

	it("renders language toggle with 'ES' text and English transition aria-label when locale is es", () => {
		const toggleLocale = vi.fn();
		vi.mocked(useLocale).mockReturnValue({
			locale: "es",
			toggleLocale,
		});

		render(<LanguageToggle />, { wrapper });

		const button = screen.getByRole("button");
		expect(button.textContent).toBe("ES");
		expect(button.getAttribute("aria-label")).toBe("Switch to English");
	});

	it("calls toggleLocale when clicked", () => {
		const toggleLocale = vi.fn();
		vi.mocked(useLocale).mockReturnValue({
			locale: "en",
			toggleLocale,
		});

		render(<LanguageToggle />, { wrapper });

		const button = screen.getByRole("button");
		fireEvent.click(button);

		expect(toggleLocale).toHaveBeenCalledTimes(1);
	});
});
