// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthSessionProvider } from "../../auth/AuthSessionProvider";
import type { AuthSessionGateway } from "../../auth/services/authSessionService";
import type { AppProfile, AuthGatewayResult, AuthUser } from "../../auth/types";
import { i18n } from "../../../shared/i18n/config";
import type { ProfileData } from "../types";

// ── Hoisted mocks ───────────────────────────────────────────────────

const { mockUseCurrentProfile } = vi.hoisted(() => ({
	mockUseCurrentProfile: vi.fn(),
}));

vi.mock("../useCurrentProfile", () => ({
	useCurrentProfile: mockUseCurrentProfile,
}));

// ── Test data ───────────────────────────────────────────────────────

const authUser: AuthUser = {
	id: "auth-user-1",
	email: "admin@innhub.test",
};

const adminProfile: AppProfile = {
	id: "profile-1",
	authUserId: authUser.id,
	propertyId: "property-1",
	role: "administrator",
	status: "active",
	fullName: "Admin User",
};

const profileData: ProfileData = {
	fullName: "Admin User",
	email: "admin@innhub.test",
	role: "administrator",
	propertyName: "My Hotel",
};

// ── Helpers ─────────────────────────────────────────────────────────

function ok<T>(data: T): AuthGatewayResult<T> {
	return { data, error: null };
}

function createGateway(
	profile: AppProfile = adminProfile,
	overrides: Partial<AuthSessionGateway> = {},
): AuthSessionGateway {
	return {
		getCurrentUser: async () => ok(authUser),
		findProfileByAuthUserId: async () => ok(profile),
		signInWithPassword: async () => ok(authUser),
		signOut: async () => ok(undefined),
		...overrides,
	};
}

async function renderPage(titleKey?: string) {
	const { UserProfilePage } = await import("../UserProfilePage");

	return render(
		<I18nextProvider i18n={i18n}>
			<AuthSessionProvider gateway={createGateway()}>
				<UserProfilePage titleKey={titleKey} />
			</AuthSessionProvider>
		</I18nextProvider>,
	);
}

// ── Tests ───────────────────────────────────────────────────────────

describe("UserProfilePage", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	describe("read view", () => {
		it("shows a loading state while profile data is being fetched", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loading" },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Loading profile...")).toBeInTheDocument();
		});

		it("renders profile fields when data is loaded", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("My Profile")).toBeInTheDocument();
			expect(screen.getByText("Admin User")).toBeInTheDocument();
			expect(screen.getByText("admin@innhub.test")).toBeInTheDocument();
			expect(screen.getByText("administrator")).toBeInTheDocument();
			expect(screen.getByText("My Hotel")).toBeInTheDocument();
		});

		it("shows empty property field when propertyName is null", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: {
					status: "loaded",
					profile: { ...profileData, propertyName: null },
				},
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			// The property span should exist but be empty because the
			// fallback-to-propertyId logic lives in the service layer.
			const propertyLabel = screen.getByText("Property");
			const propertyValue = propertyLabel.nextElementSibling;
			expect(propertyValue?.textContent).toBe("");
		});

		it("shows an error state when profile load fails", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: {
					status: "error",
					error: {
						code: "backend-error",
						message: "Service request could not be completed.",
					},
				},
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByRole("heading", {
					name: "Unable to load profile.",
				}),
			).toBeInTheDocument();
		});

		it("does not leak raw error payloads in error display", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: {
					status: "error",
					error: {
						code: "backend-error",
						message: "token=secret-jwt something failed",
					},
				},
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			const serialized = JSON.stringify(document.body.textContent);
			expect(serialized).not.toContain("secret-jwt");
		});
	});

	describe("admin edit mode", () => {
		it("shows an edit button in read mode for admin role", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByRole("button", { name: "Edit Profile" }),
			).toBeInTheDocument();
		});

		it("edit toggle shows form with fullName input", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit Profile" }),
			);

			expect(screen.getByLabelText("Full Name")).toHaveValue("Admin User");
			expect(
				screen.getByRole("button", { name: "Cancel" }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Save Changes" }),
			).toBeInTheDocument();
		});

		it("submits valid form data and switches back to read mode", async () => {
			const mockUpdate = vi.fn().mockResolvedValue(undefined);
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit Profile" }),
			);

			const nameInput = screen.getByLabelText("Full Name");
			await userEvent.setup().clear(nameInput);
			await userEvent.setup().type(nameInput, "Updated Admin");

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save Changes" }),
			);

			await waitFor(() => {
				expect(mockUpdate).toHaveBeenCalledWith("Updated Admin");
			});

			await waitFor(() => {
				expect(
					screen.getByRole("button", { name: "Edit Profile" }),
				).toBeInTheDocument();
			});
		});

		it("shows inline validation errors when fullName is empty", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit Profile" }),
			);

			const nameInput = screen.getByLabelText("Full Name");
			await userEvent.setup().clear(nameInput);

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save Changes" }),
			);

			expect(screen.getByText("Name is required")).toBeInTheDocument();
		});

		it("shows update error message when the backend update fails", async () => {
			const mockUpdate = vi
				.fn()
				.mockRejectedValue(new Error("Update failed"));
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit Profile" }),
			);

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save Changes" }),
			);

			await waitFor(() => {
				expect(
					screen.getByText("Could not save changes. Please try again."),
				).toBeInTheDocument();
			});
		});

		it("stays in edit mode preserving form values when update fails", async () => {
			const mockUpdate = vi
				.fn()
				.mockRejectedValue(new Error("Update failed"));
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit Profile" }),
			);

			const nameInput = screen.getByLabelText("Full Name");
			await userEvent.setup().clear(nameInput);
			await userEvent.setup().type(nameInput, "Changed Name");

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save Changes" }),
			);

			await waitFor(() => {
				expect(screen.getByLabelText("Full Name")).toHaveValue("Changed Name");
			});
		});

		it("cancel button returns to read view without saving", async () => {
			const mockUpdate = vi.fn();
			mockUseCurrentProfile.mockReturnValue({
				state: { status: "loaded", profile: profileData },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit Profile" }),
			);
			await userEvent.setup().click(
				screen.getByRole("button", { name: "Cancel" }),
			);

			expect(mockUpdate).not.toHaveBeenCalled();
			expect(
				screen.getByRole("button", { name: "Edit Profile" }),
			).toBeInTheDocument();
		});
	});

	describe("non-admin restriction", () => {
		it("does NOT show an edit button for non-admin roles", async () => {
			mockUseCurrentProfile.mockReturnValue({
				state: {
					status: "loaded",
					profile: {
						...profileData,
						role: "receptionist",
					},
				},
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.queryByRole("button", { name: "Edit Profile" }),
			).not.toBeInTheDocument();
		});
	});
});
