// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AuthSessionProvider } from "../../features/auth";
import type { AuthSessionGateway } from "../../features/auth/services/authSessionService";
import type { AppProfile, AuthGatewayResult, AuthUser } from "../../features/auth/types";
import { createI18nInstance } from "../../shared/i18n/config";
import { LoginPage } from "../pages/LoginPage";
import { PublicHomePage } from "../pages/PublicHomePage";
import { TopBar } from "../shell/TopBar";

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
		getCurrentUser: async () => ok(authUser),
		findProfileByAuthUserId: async () => ok(activeProfile),
		signInWithPassword: async () => ok(authUser),
		signOut: async () => ok(undefined),
		...overrides,
	};
}

describe("PreferenceBar Shell & Pages Integration", () => {
	let testI18n: ReturnType<typeof createI18nInstance>;

	beforeEach(() => {
		testI18n = createI18nInstance();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders PreferenceBar inside the TopBar header", () => {
		render(
			<I18nextProvider i18n={testI18n}>
				<AuthSessionProvider gateway={createGateway()}>
					<MemoryRouter>
						<TopBar />
					</MemoryRouter>
				</AuthSessionProvider>
			</I18nextProvider>
		);

		// Assert PreferenceBar theme button is visible in TopBar
		const themeButton = screen.getByRole("button", { name: "Switch to dark theme" });
		expect(themeButton).toBeInTheDocument();

		// Assert PreferenceBar language button is visible in TopBar
		const langButton = screen.getByRole("button", { name: "Switch to Spanish" });
		expect(langButton).toBeInTheDocument();
	});

	it("renders PreferenceBar absolutely positioned in LoginPage", () => {
		render(
			<I18nextProvider i18n={testI18n}>
				<AuthSessionProvider gateway={createGateway()}>
					<MemoryRouter>
						<LoginPage />
					</MemoryRouter>
				</AuthSessionProvider>
			</I18nextProvider>
		);

		// Assert PreferenceBar is present on LoginPage
		const themeButton = screen.getByRole("button", { name: "Switch to dark theme" });
		expect(themeButton).toBeInTheDocument();

		const langButton = screen.getByRole("button", { name: "Switch to Spanish" });
		expect(langButton).toBeInTheDocument();
	});

	it("renders PreferenceBar absolutely positioned in PublicHomePage", () => {
		render(
			<I18nextProvider i18n={testI18n}>
				<AuthSessionProvider gateway={createGateway()}>
					<MemoryRouter>
						<PublicHomePage />
					</MemoryRouter>
				</AuthSessionProvider>
			</I18nextProvider>
		);

		// Assert PreferenceBar is present on PublicHomePage
		const themeButton = screen.getByRole("button", { name: "Switch to dark theme" });
		expect(themeButton).toBeInTheDocument();

		const langButton = screen.getByRole("button", { name: "Switch to Spanish" });
		expect(langButton).toBeInTheDocument();
	});
});
