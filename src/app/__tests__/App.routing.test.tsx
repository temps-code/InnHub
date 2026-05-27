// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthSessionProvider } from "../../features/auth";
import type { AuthSessionGateway } from "../../features/auth/services/authSessionService";
import type {
	AppProfile,
	AppProfileRole,
	AuthGatewayResult,
	AuthUser,
} from "../../features/auth/types";
import { i18n } from "../../shared/i18n/config";
import {
	allRoutes,
	canAccess,
	settingsRoutes,
} from "../routes/routeMetadata";
import { appRoutes } from "../routes/routes";

// PropertyProfilePage depends on useCurrentProperty, so we provide a
// default mock so the properties route renders its read view instead of
// stalling in a loading/error state when no real backend is available.
vi.mock("../../features/properties/useCurrentProperty", () => ({
	useCurrentProperty: () => ({
		state: {
			status: "loaded" as const,
			property: {
				id: "property-1",
				slug: "test-property",
				name: "Test Property",
				business_type: "hotel",
				timezone: "America/New_York",
				currency: "USD",
				address: "123 Test St",
				phone: "+1 555-0000",
				email: "test@innhub.test",
				created_at: "2025-01-01T00:00:00Z",
				updated_at: "2025-06-01T00:00:00Z",
			},
		},
		update: vi.fn(),
		refresh: vi.fn(),
	}),
}));

const authUser: AuthUser = {
	id: "auth-user-1",
	email: "frontdesk@innhub.test",
};

const activeProfile: AppProfile = {
	id: "profile-1",
	authUserId: authUser.id,
	propertyId: "property-1",
	role: "receptionist",
	status: "active",
	fullName: "Front Desk",
};

const adminProfile: AppProfile = {
	...activeProfile,
	id: "admin-profile",
	fullName: "Administrator",
	role: "administrator",
};

function ok<T>(data: T): AuthGatewayResult<T> {
	return { data, error: null };
}

function createGateway(
	overrides: Partial<AuthSessionGateway> = {},
): AuthSessionGateway {
	return {
		getCurrentUser: async () => ok(null),
		findProfileByAuthUserId: async () => ok(activeProfile),
		signInWithPassword: async () => ok(authUser),
		signOut: async () => ok(undefined),
		...overrides,
	};
}

function roleProfile(role: AppProfileRole): AppProfile {
	return {
		...activeProfile,
		id: `profile-${role}`,
		fullName: role.charAt(0).toUpperCase() + role.slice(1),
		role,
	};
}

function createRoleGateway(
	role: AppProfileRole,
	overrides: Partial<AuthSessionGateway> = {},
): AuthSessionGateway {
	const profile = roleProfile(role);
	return {
		getCurrentUser: async () => ok(authUser),
		findProfileByAuthUserId: async () => ok(profile),
		signInWithPassword: async () => ok(authUser),
		signOut: async () => ok(undefined),
		...overrides,
	};
}

function createAdminGateway(
	overrides: Partial<AuthSessionGateway> = {},
): AuthSessionGateway {
	return {
		getCurrentUser: async () => ok(authUser),
		findProfileByAuthUserId: async () => ok(adminProfile),
		signInWithPassword: async () => ok(authUser),
		signOut: async () => ok(undefined),
		...overrides,
	};
}

function renderRoute(path: string, gateway = createGateway()) {
	const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

	return render(
		<I18nextProvider i18n={i18n}>
			<AuthSessionProvider gateway={gateway}>
				<RouterProvider router={router} />
			</AuthSessionProvider>
		</I18nextProvider>,
	);
}

describe("app routing foundation", () => {
	afterEach(async () => {
		cleanup();
		await i18n.changeLanguage("en");
	});

	it("renders the public login form without protected shell landmarks", () => {
		renderRoute("/login");

		expect(
			screen.getByRole("heading", { name: "Sign in to InnHub" }),
		).toBeTruthy();
		expect(screen.getByLabelText("Email address")).toBeTruthy();
		expect(screen.getByLabelText("Password")).toBeTruthy();
		expect(
			screen.queryByRole("navigation", { name: "Application modules" }),
		).toBeNull();
		expect(screen.queryByRole("banner")).toBeNull();
	});

	it("blocks unauthenticated users from protected content", async () => {
		renderRoute("/app/dashboard");

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Sign in to InnHub" }),
			).toBeTruthy();
		});
		expect(
			screen.queryByRole("navigation", { name: "Application modules" }),
		).toBeNull();
		expect(screen.queryByRole("banner")).toBeNull();
		expect(screen.queryByRole("heading", { name: "Dashboard" })).toBeNull();
	});

	it("does not render protected shell content while auth state is loading", () => {
		renderRoute(
			"/app/dashboard",
			createGateway({ getCurrentUser: () => new Promise(() => undefined) }),
		);

		expect(screen.getByRole("status")).toHaveTextContent("Checking session");
		expect(
			screen.queryByRole("navigation", { name: "Application modules" }),
		).toBeNull();
		expect(screen.queryByRole("banner")).toBeNull();
	});

	it("does not render protected shell content for invalid profile sessions", async () => {
		renderRoute(
			"/app/dashboard",
			createGateway({
				getCurrentUser: async () => ok(authUser),
				findProfileByAuthUserId: async () => ok(null),
			}),
		);

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Account access needs attention" }),
			).toBeTruthy();
		});
		expect(
			screen.queryByRole("navigation", { name: "Application modules" }),
		).toBeNull();
		expect(screen.queryByRole("banner")).toBeNull();
	});

	it("renders the dashboard through the protected shell for a valid session", async () => {
		renderRoute(
			"/app/dashboard",
			createGateway({ getCurrentUser: async () => ok(authUser) }),
		);

		await waitFor(() => {
			expect(
				screen.getByRole("navigation", { name: "Application modules" }),
			).toBeTruthy();
		});
		expect(screen.getByRole("banner")).toBeTruthy();
		expect(
			screen.getByRole("main", { name: "Dashboard workspace" }),
		).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Dashboard" })).toBeTruthy();
	});

	it("stops rendering protected content after logout", async () => {
		let signOutCalls = 0;
		const user = userEvent.setup();
		renderRoute(
			"/app/dashboard",
			createGateway({
				getCurrentUser: async () => ok(authUser),
				signOut: async () => {
					signOutCalls += 1;
					return ok(undefined);
				},
			}),
		);

		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Log out" })).toBeTruthy();
		});
		await user.click(screen.getByRole("button", { name: "Log out" }));

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Sign in to InnHub" }),
			).toBeTruthy();
		});
		expect(signOutCalls).toBe(1);
		expect(screen.queryByRole("heading", { name: "Dashboard" })).toBeNull();
	});

	it("keeps protected route metadata reachable from the shared shell", async () => {
		for (const route of allRoutes) {
			cleanup();
			renderRoute(route.href, createAdminGateway());

			await waitFor(() => {
				const links = screen.getAllByRole("link", {
					name: i18n.t(route.labelKey),
				});
				const matchingLink = links.find(
					(link) => link.getAttribute("href") === route.href,
				);
				expect(matchingLink).toBeTruthy();
				expect(matchingLink).toHaveAttribute("href", route.href);
			});
			expect(
				screen.getAllByRole("heading", { name: i18n.t(route.titleKey) }).length,
			).toBeGreaterThan(0);
		}
	});

	it("canAccess returns expected hierarchy", () => {
		// Same-role: always true
		expect(canAccess("administrator", "administrator")).toBe(true);
		expect(canAccess("manager", "manager")).toBe(true);
		expect(canAccess("receptionist", "receptionist")).toBe(true);
		expect(canAccess("housekeeping", "housekeeping")).toBe(true);
		expect(canAccess("maintenance", "maintenance")).toBe(true);
		// Higher-role user CAN access lower-minimum content
		expect(canAccess("manager", "administrator")).toBe(true);
		expect(canAccess("receptionist", "manager")).toBe(true);
		expect(canAccess("receptionist", "administrator")).toBe(true);
		expect(canAccess("housekeeping", "administrator")).toBe(true);
		// Lower-role user CANNOT access higher-minimum content
		expect(canAccess("administrator", "manager")).toBe(false);
		expect(canAccess("administrator", "receptionist")).toBe(false);
		expect(canAccess("manager", "receptionist")).toBe(false);
		expect(canAccess("administrator", "housekeeping")).toBe(false);
		expect(canAccess("administrator", "maintenance")).toBe(false);
		// Peer roles: cannot access each other's routes
		expect(canAccess("housekeeping", "maintenance")).toBe(false);
		expect(canAccess("maintenance", "housekeeping")).toBe(false);
	});

	it("hides reports and settings groups from receptionist sidebar", async () => {
		renderRoute(
			"/app/dashboard",
			createGateway({ getCurrentUser: async () => ok(authUser) }),
		);

		await waitFor(() => {
			expect(
				screen.getByRole("navigation", { name: "Application modules" }),
			).toBeTruthy();
		});

		// Operations group heading IS visible for receptionist
		expect(screen.getByText("Operations")).toBeTruthy();

		// Reports and Settings groups are NOT visible for receptionist
		expect(screen.queryByText("Reports")).toBeNull();
		expect(screen.queryByText("Settings")).toBeNull();
	});

	it.each([
		["administrator", "/app/dashboard", "Dashboard"],
		["manager", "/app/dashboard", "Dashboard"],
		["receptionist", "/app/dashboard", "Dashboard"],
		["housekeeping", "/app/housekeeping", "Housekeeping"],
		["maintenance", "/app/maintenance", "Maintenance"],
	] as const)(
		"renders the sidebar navigation shell for %s role",
		async (role, path, title) => {
			renderRoute(path, createRoleGateway(role));

			await waitFor(() => {
				expect(
					screen.getByRole("navigation", { name: "Application modules" }),
				).toBeTruthy();
			});

			expect(screen.getByRole("banner")).toBeTruthy();
			expect(
				screen.getByRole("heading", { name: title }),
			).toBeTruthy();
		},
	);

	it.each([
		["administrator", "/app/dashboard", true, true, true],
		["manager", "/app/dashboard", true, true, false],
		["receptionist", "/app/dashboard", true, false, false],
		["housekeeping", "/app/housekeeping", true, false, false],
		["maintenance", "/app/maintenance", true, false, false],
	] as const)(
		"shows correct sidebar groups for %s role",
		async (role, path, showOperations, showReports, showSettings) => {
			renderRoute(path, createRoleGateway(role));

			await waitFor(() => {
				expect(
					screen.getByRole("navigation", { name: "Application modules" }),
				).toBeTruthy();
			});

			if (showOperations) {
				expect(screen.getByText("Operations")).toBeTruthy();
			} else {
				expect(screen.queryByText("Operations")).toBeNull();
			}

			if (showReports) {
				// "Reports" appears as both a heading and a nav link — use getAllByText
				const reportsElements = screen.getAllByText("Reports");
				expect(reportsElements.length).toBeGreaterThan(0);
			} else {
				expect(screen.queryByText("Reports")).toBeNull();
			}

			if (showSettings) {
				expect(screen.getByText("Settings")).toBeTruthy();
			} else {
				expect(screen.queryByText("Settings")).toBeNull();
			}
		},
	);
});

describe("settings routing", () => {
	afterEach(async () => {
		cleanup();
		await i18n.changeLanguage("en");
	});

	it("renders settings routes under /app/settings/*", async () => {
		for (const route of settingsRoutes) {
			cleanup();
			renderRoute(route.href, createAdminGateway());

			await waitFor(() => {
				const links = screen.getAllByRole("link", {
					name: i18n.t(route.labelKey),
				});
				const matchingLink = links.find(
					(link) => link.getAttribute("href") === route.href,
				);
				expect(matchingLink).toBeTruthy();
			});
		}
	});

	it("redirects /app/properties to /app/settings/property for admin", async () => {
		renderRoute(
			"/app/properties",
			createAdminGateway(),
		);

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: /Property Profile/i }),
			).toBeTruthy();
		});
	});

	it("redirects unauthorized roles (non-admins) from settings routes to /app/dashboard", async () => {
		renderRoute(
			"/app/settings/property",
			createGateway({ getCurrentUser: async () => ok(authUser) }),
		);

		await waitFor(() => {
			expect(screen.getByRole("heading", { name: "Dashboard" })).toBeTruthy();
		});
	});

	it.each([
		["administrator", true],
		["manager", false],
		["receptionist", false],
		["housekeeping", false],
		["maintenance", false],
	] as const)(
		"redirects %s role from /app/properties appropriately",
		async (role, isAdmin) => {
			renderRoute("/app/properties", createRoleGateway(role));

			if (isAdmin) {
				await waitFor(() => {
					expect(
						screen.getByRole("heading", { name: /Property Profile/i }),
					).toBeTruthy();
				});
			} else {
				await waitFor(() => {
					// Non-admin roles should NOT see the Property Profile page
					// (they get redirected through settings guard → dashboard or blank)
					expect(
						screen.queryByRole("heading", { name: /Property Profile/i }),
					).toBeNull();
				});
			}
		},
	);
});