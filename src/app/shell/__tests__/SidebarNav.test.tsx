// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ProtectedRouteMeta } from "../../routes/routeMetadata";
import { protectedRoutes } from "../../routes/routeMetadata";
import { SidebarNav } from "../SidebarNav";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

afterEach(cleanup);

describe("SidebarNav icon rendering", () => {
	it("renders an svg icon for each route with an icon defined", () => {
		render(
			<MemoryRouter>
				<SidebarNav items={protectedRoutes} />
			</MemoryRouter>,
		);

		const links = screen.getAllByRole("link");
		// Every protected route has an icon defined
		const svgCount = links.reduce(
			(count, link) => count + (link.querySelector("svg") ? 1 : 0),
			0,
		);
		expect(svgCount).toBe(protectedRoutes.length);
	});

	it("rendering without icon does not break layout", () => {
		const itemWithoutIcon: ProtectedRouteMeta = {
			id: "dashboard",
			path: "dashboard",
			href: "/app/dashboard",
			labelKey: "routes.protected.dashboard.label",
			titleKey: "routes.protected.dashboard.title",
			descriptionKey: "routes.protected.dashboard.description",
			// icon is intentionally undefined
		};

		render(
			<MemoryRouter>
				<SidebarNav items={[itemWithoutIcon]} />
			</MemoryRouter>,
		);

		const link = screen.getByRole("link");
		expect(link.querySelector("svg")).toBeNull();
		expect(link).toHaveTextContent("routes.protected.dashboard.label");
	});

	it("renders icon with aria-hidden attribute", () => {
		// Use the properties route which has an icon
		const itemWithIcon = protectedRoutes[0];

		render(
			<MemoryRouter>
				<SidebarNav items={[itemWithIcon]} />
			</MemoryRouter>,
		);

		const svg = screen.getByRole("link").querySelector("svg");
		expect(svg).toHaveAttribute("aria-hidden", "true");
	});
});
