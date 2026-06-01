// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ProtectedRouteMeta } from "../../routes/routeMetadata";

const { mockUseAuthSession } = vi.hoisted(() => ({
	mockUseAuthSession: vi.fn(),
}));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "en", changeLanguage: async () => undefined },
	}),
}));

vi.mock("../../../features/auth", () => ({
	useAuthSession: mockUseAuthSession,
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

const activeRoute: ProtectedRouteMeta = {
	id: "guests",
	path: "guests",
	href: "/app/guests",
	labelKey: "routes.protected.guests.label",
	titleKey: "routes.protected.guests.title",
	descriptionKey: "routes.protected.guests.description",
	group: "operations",
	order: 50,
	minRole: "receptionist",
};

describe("TopBar", () => {
	it("keeps desktop actions aligned in a single horizontal row and removes property selector", async () => {
		mockUseAuthSession.mockReturnValue({
			state: {
				status: "authenticated",
				session: {
					user: { id: "u1", email: "admin@innhub.test" },
					profile: {
						id: "p1",
						authUserId: "u1",
						propertyId: "property-1",
						role: "administrator",
						status: "active",
						fullName: "Admin Tarija",
					},
					propertyId: "property-1",
				},
			},
			logout: vi.fn(),
		});

		const { TopBar } = await import("../TopBar");
		render(<TopBar activeRoute={activeRoute} />);

		const header = screen.getByRole("banner");
		expect(header.className).not.toContain("flex-wrap");
		expect(header.className).toContain("md:flex-nowrap");

		expect(
			screen.queryByLabelText("shell.topbar.propertyAriaLabel"),
		).not.toBeInTheDocument();
	});
});
