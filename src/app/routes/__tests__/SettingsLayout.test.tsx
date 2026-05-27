// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SettingsLayout } from "../SettingsLayout";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "en", changeLanguage: async () => undefined },
	}),
}));

afterEach(cleanup);

describe("SettingsLayout tab navigation", () => {
	it("renders a Profile tab linking to /app/settings/profile", () => {
		render(
			<MemoryRouter>
				<SettingsLayout />
			</MemoryRouter>,
		);

		const profileLink = screen.getByRole("link", {
			name: "routes.protected.profile.label",
		});
		expect(profileLink).toBeTruthy();
		expect(profileLink).toHaveAttribute("href", "/app/settings/profile");
	});

	it("renders Profile tab alongside Property and Users tabs", () => {
		render(
			<MemoryRouter>
				<SettingsLayout />
			</MemoryRouter>,
		);

		const links = screen.getAllByRole("link");
		const profileHrefs = links
			.filter((link) => link.getAttribute("href") === "/app/settings/profile")
			.map((link) => link.getAttribute("href"));

		expect(profileHrefs.length).toBeGreaterThan(0);
	});
});
