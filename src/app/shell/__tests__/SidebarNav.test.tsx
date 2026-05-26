// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppProfileRole } from "../../../features/auth/types";
import type { GroupedRouteItem } from "../../routes/routeMetadata";
import { allRoutes, canAccess } from "../../routes/routeMetadata";
import { SidebarNav } from "../SidebarNav";
import { AppShell } from "../AppShell";
import { AuthSessionProvider } from "../../../features/auth";

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
		i18n: { language: "en", changeLanguage: async () => undefined },
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

	it("calls onClose callback when a link is clicked", async () => {
		const onClose = vi.fn();
		render(
			<MemoryRouter>
				<SidebarNav items={groupedRoutes} onClose={onClose} />
			</MemoryRouter>,
		);

		const firstLink = screen.getAllByRole("link")[0];
		firstLink.click();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	const ALL_ROLES: AppProfileRole[] = [
		"administrator",
		"manager",
		"receptionist",
		"housekeeping",
		"maintenance",
	];

	it.each(ALL_ROLES)(
		"renders correct sidebar group headings for %s role",
		(role) => {
			const visibleRoutes = allRoutes.filter((r) =>
				canAccess(r.minRole, role),
			);

			const groups: GroupedRouteItem[] = [
				{
					group: "operations" as const,
					labelKey: "shell.sidebar.group.operations",
					items: visibleRoutes.filter((r) => r.group === "operations"),
				},
				{
					group: "reports" as const,
					labelKey: "shell.sidebar.group.reports",
					items: visibleRoutes.filter((r) => r.group === "reports"),
				},
				{
					group: "settings" as const,
					labelKey: "shell.sidebar.group.settings",
					items: visibleRoutes.filter((r) => r.group === "settings"),
				},
			].filter((g) => g.items.length > 0);

			render(
				<MemoryRouter>
					<SidebarNav items={groups} />
				</MemoryRouter>,
			);

			groups.forEach((g) => {
				expect(screen.getByText(g.labelKey)).toBeTruthy();
			});
		},
	);

	it("renders hamburger button in TopBar on mobile and toggles SidebarNav drawer", () => {
		const mockAuthUser = { id: "auth-user-1", email: "admin@innhub.test" };
		const mockProfile = { id: "profile-1", authUserId: "auth-user-1", propertyId: "property-1", role: "administrator" as const, status: "active" as const, fullName: "Administrator" };
		const mockGateway = {
			getCurrentUser: async () => ({ data: mockAuthUser, error: null }),
			findProfileByAuthUserId: async () => ({ data: mockProfile, error: null }),
			signInWithPassword: async () => ({ data: mockAuthUser, error: null }),
			signOut: async () => ({ data: undefined, error: null }),
		};

		render(
			<MemoryRouter>
				<AuthSessionProvider gateway={mockGateway}>
					<AppShell items={groupedRoutes}>
						<div>Workspace Content</div>
					</AppShell>
				</AuthSessionProvider>
			</MemoryRouter>,
		);

		const toggleButton = screen.getByRole("button", { name: /open navigation menu/i });
		expect(toggleButton).toBeTruthy();

		const asideEl = document.querySelector("aside");
		expect(asideEl).toHaveClass("-translate-x-full");

		fireEvent.click(toggleButton);
		expect(asideEl).toHaveClass("translate-x-0");
		expect(asideEl).not.toHaveClass("-translate-x-full");

		const backdrop = screen.getByTestId("sidebar-backdrop");
		expect(backdrop).toBeTruthy();

		fireEvent.click(backdrop);
		expect(asideEl).toHaveClass("-translate-x-full");
	});

	it("closes SidebarNav drawer automatically when a navigation link is clicked", () => {
		const mockAuthUser = { id: "auth-user-1", email: "admin@innhub.test" };
		const mockProfile = { id: "profile-1", authUserId: "auth-user-1", propertyId: "property-1", role: "administrator" as const, status: "active" as const, fullName: "Administrator" };
		const mockGateway = {
			getCurrentUser: async () => ({ data: mockAuthUser, error: null }),
			findProfileByAuthUserId: async () => ({ data: mockProfile, error: null }),
			signInWithPassword: async () => ({ data: mockAuthUser, error: null }),
			signOut: async () => ({ data: undefined, error: null }),
		};

		render(
			<MemoryRouter>
				<AuthSessionProvider gateway={mockGateway}>
					<AppShell items={groupedRoutes}>
						<div>Workspace Content</div>
					</AppShell>
				</AuthSessionProvider>
			</MemoryRouter>,
		);

		const toggleButton = screen.getByRole("button", { name: /open navigation menu/i });
		const asideEl = document.querySelector("aside");

		fireEvent.click(toggleButton);
		expect(asideEl).toHaveClass("translate-x-0");

		const firstLink = screen.getAllByRole("link")[0];
		fireEvent.click(firstLink);

		expect(asideEl).toHaveClass("-translate-x-full");
	});
});

describe("sidebar mobile scroll layout", () => {
	it("renders aside with flex-col layout and h-full", () => {
		const mockAuthUser = { id: "auth-user-1", email: "admin@innhub.test" };
		const mockProfile = { id: "profile-1", authUserId: "auth-user-1", propertyId: "property-1", role: "administrator" as const, status: "active" as const, fullName: "Administrator" };
		const mockGateway = {
			getCurrentUser: async () => ({ data: mockAuthUser, error: null }),
			findProfileByAuthUserId: async () => ({ data: mockProfile, error: null }),
			signInWithPassword: async () => ({ data: mockAuthUser, error: null }),
			signOut: async () => ({ data: undefined, error: null }),
		};

		render(
			<MemoryRouter>
				<AuthSessionProvider gateway={mockGateway}>
					<AppShell items={groupedRoutes}>
						<div>Workspace Content</div>
					</AppShell>
				</AuthSessionProvider>
			</MemoryRouter>,
		);

		const aside = document.querySelector("aside");
		expect(aside).toHaveClass("flex");
		expect(aside).toHaveClass("flex-col");
		expect(aside).toHaveClass("h-full");
	});

	it("wraps SidebarNav in a scrollable container with overflow-y-auto", () => {
		const mockAuthUser = { id: "auth-user-1", email: "admin@innhub.test" };
		const mockProfile = { id: "profile-1", authUserId: "auth-user-1", propertyId: "property-1", role: "administrator" as const, status: "active" as const, fullName: "Administrator" };
		const mockGateway = {
			getCurrentUser: async () => ({ data: mockAuthUser, error: null }),
			findProfileByAuthUserId: async () => ({ data: mockProfile, error: null }),
			signInWithPassword: async () => ({ data: mockAuthUser, error: null }),
			signOut: async () => ({ data: undefined, error: null }),
		};

		render(
			<MemoryRouter>
				<AuthSessionProvider gateway={mockGateway}>
					<AppShell items={groupedRoutes}>
						<div>Workspace Content</div>
					</AppShell>
				</AuthSessionProvider>
			</MemoryRouter>,
		);

		const nav = screen.getByRole("navigation", { name: "shell.sidebar.ariaLabel" });
		const wrapper = nav.parentElement;
		expect(wrapper).toHaveClass("overflow-y-auto");
		expect(wrapper).toHaveClass("min-h-0");
	});
});