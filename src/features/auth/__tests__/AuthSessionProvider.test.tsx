// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { AuthSessionProvider } from "../AuthSessionProvider";
import { useAuthSession } from "../hooks/useAuthSession";
import type { AuthSessionGateway } from "../services/authSessionService";
import type { AppProfile, AuthGatewayResult, AuthUser } from "../types";

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

function SessionProbe() {
	const { login, logout, refresh, state } = useAuthSession();

	return (
		<div>
			<p data-testid="status">{state.status}</p>
			<p data-testid="property">
				{state.status === "authenticated" ? state.session.propertyId : "none"}
			</p>
			<button
				type="button"
				onClick={() =>
					login({ email: "frontdesk@innhub.test", password: "password" })
				}
			>
				Login
			</button>
			<button type="button" onClick={() => logout()}>
				Logout
			</button>
			<button type="button" onClick={() => refresh()}>
				Refresh
			</button>
		</div>
	);
}

describe("AuthSessionProvider", () => {
	afterEach(cleanup);

	it("starts in loading and resolves through refresh on mount", async () => {
		render(
			<AuthSessionProvider
				gateway={createGateway({
					getCurrentUser: async () => ok(authUser),
				})}
			>
				<SessionProbe />
			</AuthSessionProvider>,
		);

		expect(screen.getByTestId("status").textContent).toBe("loading");

		await waitFor(() => {
			expect(screen.getByTestId("status").textContent).toBe("authenticated");
		});
		expect(screen.getByTestId("property").textContent).toBe("property-1");
	});

	it("exposes state, login, logout, and refresh from useAuthSession", async () => {
		const user = userEvent.setup();
		render(
			<AuthSessionProvider gateway={createGateway()}>
				<SessionProbe />
			</AuthSessionProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
		});

		await user.click(screen.getByRole("button", { name: "Login" }));

		await waitFor(() => {
			expect(screen.getByTestId("status").textContent).toBe("authenticated");
		});

		expect(screen.getByTestId("property").textContent).toBe("property-1");

		await user.click(screen.getByRole("button", { name: "Refresh" }));
		await waitFor(() => {
			expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
		});
	});

	it("sets unauthenticated after logout", async () => {
		const user = userEvent.setup();
		render(
			<AuthSessionProvider gateway={createGateway()}>
				<SessionProbe />
			</AuthSessionProvider>,
		);

		await user.click(screen.getByRole("button", { name: "Login" }));
		await waitFor(() => {
			expect(screen.getByTestId("status").textContent).toBe("authenticated");
		});

		await user.click(screen.getByRole("button", { name: "Logout" }));

		await waitFor(() => {
			expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
		});
	});

	it("throws a clear error when useAuthSession is used outside the provider", () => {
		function BrokenConsumer() {
			useAuthSession();
			return null;
		}

		expect(() => render(<BrokenConsumer />)).toThrow(
			"useAuthSession must be used within AuthSessionProvider",
		);
	});
});
