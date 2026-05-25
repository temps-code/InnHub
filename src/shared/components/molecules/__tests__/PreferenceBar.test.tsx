// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createI18nInstance } from "../../../i18n/config";
import { PreferenceBar } from "../PreferenceBar";

// We can mock hooks if they get called by child components
vi.mock("../../../hooks/useTheme", () => ({
	useTheme: () => ({
		theme: "light",
		toggleTheme: vi.fn(),
	}),
}));

vi.mock("../../../hooks/useLocale", () => ({
	useLocale: () => ({
		locale: "en",
		toggleLocale: vi.fn(),
	}),
}));

describe("PreferenceBar", () => {
	let testI18n: ReturnType<typeof createI18nInstance>;

	beforeEach(() => {
		testI18n = createI18nInstance();
	});

	afterEach(() => {
		cleanup();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(I18nextProvider, { i18n: testI18n }, children);

	it("renders both ThemeToggle and LanguageToggle composed together", () => {
		render(<PreferenceBar />, { wrapper });

		// Verify ThemeToggle is rendered (look for theme toggle button with Switch to dark theme aria-label)
		const themeButton = screen.getByRole("button", { name: "Switch to dark theme" });
		expect(themeButton).toBeTruthy();

		// Verify LanguageToggle is rendered (look for language toggle button with Switch to Spanish aria-label)
		const langButton = screen.getByRole("button", { name: "Switch to Spanish" });
		expect(langButton).toBeTruthy();
		expect(langButton.textContent).toBe("EN");
	});

	it("has an accessible container layout structure", () => {
		const { container } = render(<PreferenceBar />, { wrapper });

		// Verify that it renders a styling container with flex classes
		const mainDiv = container.firstChild as HTMLElement;
		expect(mainDiv).toBeTruthy();
		expect(mainDiv.tagName).toBe("DIV");
		expect(mainDiv.className).toContain("flex");
		expect(mainDiv.className).toContain("items-center");
	});
});
