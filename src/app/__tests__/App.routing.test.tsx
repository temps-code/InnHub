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
	AuthGatewayResult,
	AuthUser,
} from "../../features/auth/types";
import { i18n } from "../../shared/i18n/config";
import { protectedRoutes } from "../routes/routeMetadata";
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
		for (const route of protectedRoutes) {
			cleanup();
			renderRoute(
				route.href,
				createGateway({ getCurrentUser: async () => ok(authUser) }),
			);

			await waitFor(() => {
				expect(
					screen.getByRole("link", { name: i18n.t(route.labelKey) }),
				).toHaveAttribute("href", route.href);
			});
			expect(
				screen.getByRole("heading", { name: i18n.t(route.titleKey) }),
			).toBeTruthy();
		}
	});
});
