// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { i18n } from "../../shared/i18n/config";
import { AppProviders } from "../providers/AppProviders";
import { protectedRoutes } from "../routes/routeMetadata";
import { appRoutes } from "../routes/routes";

function renderRoute(path: string) {
	const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

	return render(
		<AppProviders>
			<RouterProvider router={router} />
		</AppProviders>,
	);
}

describe("app routing foundation", () => {
	afterEach(async () => {
		cleanup();
		await i18n.changeLanguage("en");
	});

	it("renders the public login placeholder without protected shell landmarks", () => {
		renderRoute("/login");

		expect(
			screen.getByRole("heading", { name: "Login placeholder" }),
		).toBeTruthy();
		expect(
			screen.queryByRole("navigation", { name: "Application modules" }),
		).toBeNull();
		expect(screen.queryByRole("banner")).toBeNull();
	});

	it("renders the dashboard through the protected shell", () => {
		renderRoute("/app/dashboard");

		expect(
			screen.getByRole("navigation", { name: "Application modules" }),
		).toBeTruthy();
		expect(screen.getByRole("banner")).toBeTruthy();
		expect(
			screen.getByRole("main", { name: "Dashboard workspace" }),
		).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Dashboard" })).toBeTruthy();
	});

	it("keeps protected route metadata reachable from the shared shell", () => {
		for (const route of protectedRoutes) {
			cleanup();
			renderRoute(route.href);

			expect(
				screen.getByRole("link", { name: i18n.t(route.labelKey) }),
			).toHaveAttribute("href", route.href);
			expect(
				screen.getByRole("heading", { name: i18n.t(route.titleKey) }),
			).toBeTruthy();
		}
	});
});
