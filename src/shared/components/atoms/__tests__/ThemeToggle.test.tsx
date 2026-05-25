// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createI18nInstance } from "../../../i18n/config";
import { useTheme } from "../../../hooks/useTheme";
import { ThemeToggle } from "../ThemeToggle";

// Mock the hook
vi.mock("../../../hooks/useTheme", () => ({
	useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
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

	it("renders dark toggle with correct aria-label and Moon icon when theme is light", () => {
		const toggleTheme = vi.fn();
		vi.mocked(useTheme).mockReturnValue({
			theme: "light",
			toggleTheme,
		});

		render(<ThemeToggle />, { wrapper });

		const button = screen.getByRole("button");
		expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");
		
		// Assert that an SVG is rendered
		const svg = button.querySelector("svg");
		expect(svg).toBeTruthy();
		// It should represent moon icon when light theme (to switch to dark)
		// Or we can check it has data-testid="moon-icon" or similar
		expect(svg?.getAttribute("data-testid")).toBe("moon-icon");
	});

	it("renders light toggle with correct aria-label and Sun icon when theme is dark", () => {
		const toggleTheme = vi.fn();
		vi.mocked(useTheme).mockReturnValue({
			theme: "dark",
			toggleTheme,
		});

		render(<ThemeToggle />, { wrapper });

		const button = screen.getByRole("button");
		expect(button.getAttribute("aria-label")).toBe("Switch to light theme");
		
		const svg = button.querySelector("svg");
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute("data-testid")).toBe("sun-icon");
	});

	it("calls toggleTheme when clicked", () => {
		const toggleTheme = vi.fn();
		vi.mocked(useTheme).mockReturnValue({
			theme: "light",
			toggleTheme,
		});

		render(<ThemeToggle />, { wrapper });

		const button = screen.getByRole("button");
		fireEvent.click(button);

		expect(toggleTheme).toHaveBeenCalledTimes(1);
	});
});
