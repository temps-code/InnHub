// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { GroupedRouteItem } from "../../routes/routeMetadata";
import { allRoutes } from "../../routes/routeMetadata";
import { SidebarNav } from "../SidebarNav";

const groupedRoutes: GroupedRouteItem[] = [
	{
		group: "operations",
		labelKey: "shell.sidebar.group.operations",
		items: allRoutes.filter((r) => r.group === "operations"),
	},
];

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

afterEach(cleanup);

describe("SidebarNav grouped section rendering", () => {
	it("renders group heading for each group with items", () => {
		render(
			<MemoryRouter>
				<SidebarNav items={groupedRoutes} />
			</MemoryRouter>,
		);

		expect(
			screen.getByText(`shell.sidebar.group.${groupedRoutes[0].group}`),
		).toBeTruthy();
	});

	it("renders an svg icon for each route with an icon defined", () => {
		render(
			<MemoryRouter>
				<SidebarNav items={groupedRoutes} />
			</MemoryRouter>,
		);

		const links = screen.getAllByRole("link");
		const svgCount = links.reduce(
			(count, link) => count + (link.querySelector("svg") ? 1 : 0),
			0,
		);
		expect(svgCount).toBe(groupedRoutes[0].items.length);
	});

	it("rendering without icon does not break layout", () => {
		const itemWithoutIcon: GroupedRouteItem = {
			group: "operations",
			labelKey: "shell.sidebar.group.operations",
			items: [
				{
					id: "dashboard",
					path: "dashboard",
					href: "/app/dashboard",
					labelKey: "routes.protected.dashboard.label",
					titleKey: "routes.protected.dashboard.title",
					descriptionKey: "routes.protected.dashboard.description",
					group: "operations",
					order: 10,
					minRole: "receptionist",
				},
			],
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
		render(
			<MemoryRouter>
				<SidebarNav items={groupedRoutes} />
			</MemoryRouter>,
		);

		const links = screen.getAllByRole("link");
		links.forEach((link) => {
			const svg = link.querySelector("svg");
			expect(svg).toHaveAttribute("aria-hidden", "true");
		});
	});
});