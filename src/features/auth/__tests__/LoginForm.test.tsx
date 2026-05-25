// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthSessionProvider } from "../AuthSessionProvider";
import { LoginForm } from "../components/LoginForm";
import type { AuthSessionGateway } from "../services/authSessionService";
import type { DemoCredentialsResult } from "../services/demoCredentials";
import type { AppProfile, AuthGatewayResult, AuthUser } from "../types";
import { i18n } from "../../../shared/i18n/config";

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

function fail<T>(message: string, raw?: unknown): AuthGatewayResult<T> {
	return { data: null, error: { message, raw } };
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

function renderLoginForm({
	gateway = createGateway(),
	demoCredentials = { status: "unavailable" },
	onAuthenticated = () => undefined,
}: {
	readonly gateway?: AuthSessionGateway;
	readonly demoCredentials?: DemoCredentialsResult;
	readonly onAuthenticated?: () => void;
} = {}) {
	return render(
		<I18nextProvider i18n={i18n}>
			<AuthSessionProvider gateway={gateway}>
				<LoginForm
					demoCredentials={demoCredentials}
					onAuthenticated={onAuthenticated}
				/>
			</AuthSessionProvider>
		</I18nextProvider>,
	);
}

describe("LoginForm", () => {
	afterEach(async () => {
		cleanup();
		await i18n.changeLanguage("en");
	});

	it("requires email and password before submitting", async () => {
		const user = userEvent.setup();
		renderLoginForm();

		await user.click(screen.getByRole("button", { name: "Sign in" }));

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Enter your email and password to sign in.",
		);
	});

	it("shows a generic UI-safe error for invalid credentials", async () => {
		const user = userEvent.setup();
		renderLoginForm({
			gateway: createGateway({
				signInWithPassword: async () =>
					fail("Invalid credentials secret-token", {
						access_token: "secret-token",
					}),
			}),
		});

		await user.type(screen.getByLabelText("Email address"), "bad@innhub.test");
		await user.type(screen.getByLabelText("Password"), "wrong-password");
		await user.click(screen.getByRole("button", { name: "Sign in" }));

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent(
				"Invalid email or password.",
			);
		});
		expect(screen.getByRole("alert")).not.toHaveTextContent("secret-token");
		expect(screen.getByRole("alert")).not.toHaveTextContent(
			"Invalid credentials",
		);
	});

	it("calls the authenticated callback after a valid login", async () => {
		let authenticated = false;
		const user = userEvent.setup();
		renderLoginForm({
			onAuthenticated: () => {
				authenticated = true;
			},
		});

		await user.type(
			screen.getByLabelText("Email address"),
			"frontdesk@innhub.test",
		);
		await user.type(screen.getByLabelText("Password"), "password");
		await user.click(screen.getByRole("button", { name: "Sign in" }));

		await waitFor(() => {
			expect(authenticated).toBe(true);
		});
	});

	it("submits configured demo credentials through the existing login flow", async () => {
		let authenticated = false;
		const user = userEvent.setup();
		const signInWithPassword = vi.fn(async () => ok(authUser));
		renderLoginForm({
			gateway: createGateway({ signInWithPassword }),
			demoCredentials: {
				status: "available",
				credentials: {
					email: "demo@innhub.test",
					password: "demo-password",
				},
			},
			onAuthenticated: () => {
				authenticated = true;
			},
		});

		await user.click(screen.getByRole("button", { name: "Use demo account" }));

		await waitFor(() => {
			expect(signInWithPassword).toHaveBeenCalledWith({
				email: "demo@innhub.test",
				password: "demo-password",
			});
			expect(authenticated).toBe(true);
		});
	});

	it("shows a safe unavailable demo action when demo config is missing", () => {
		renderLoginForm({ demoCredentials: { status: "unavailable" } });

		expect(
			screen.getByRole("button", { name: "Use demo account" }),
		).toBeDisabled();
		expect(
			screen.getByText("Demo account is not configured for this environment."),
		).toBeInTheDocument();
		expect(
			screen.getByText("Demo account is not configured for this environment."),
		).not.toHaveTextContent("password");
	});
});
