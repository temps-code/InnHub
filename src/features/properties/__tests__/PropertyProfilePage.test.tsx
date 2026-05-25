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
import type { Property } from "../types";

// ── Hoisted mocks ───────────────────────────────────────────────────

const { mockUseCurrentProperty } = vi.hoisted(() => ({
	mockUseCurrentProperty: vi.fn(),
}));

vi.mock("../useCurrentProperty", () => ({
	useCurrentProperty: mockUseCurrentProperty,
}));

// ── Test data ───────────────────────────────────────────────────────

const authUser: AuthUser = {
	id: "auth-user-1",
	email: "frontdesk@innhub.test",
};

const activeProfile: AppProfile = {
	id: "profile-1",
	authUserId: authUser.id,
	propertyId: "property-1",
	role: "administrator",
	status: "active",
	fullName: "Admin",
};

const aProperty: Property = {
	id: "property-1",
	slug: "my-hotel",
	name: "My Hotel",
	business_type: "hotel",
	timezone: "America/Argentina/Buenos_Aires",
	currency: "ARS",
	address: "Av. Corrientes 1234",
	phone: "+54 11 5555-1234",
	email: "info@myhotel.test",
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
};

// ── Helpers ─────────────────────────────────────────────────────────

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

async function expectSecretFree(value: unknown) {
	const serialized = JSON.stringify(value);
	expect(serialized).not.toContain("secret-token");
	expect(serialized).not.toContain("secret-jwt");
}

async function renderPage() {
	const { PropertyProfilePage } = await import("../PropertyProfilePage");

	return render(
		<I18nextProvider i18n={i18n}>
			<AuthSessionProvider gateway={createGateway()}>
				<PropertyProfilePage />
			</AuthSessionProvider>
		</I18nextProvider>,
	);
}

// ── Tests ───────────────────────────────────────────────────────────

describe("PropertyProfilePage", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	describe("read view", () => {
		it("shows a loading state while property data is being fetched", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loading" },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Loading property...")).toBeInTheDocument();
		});

		it("renders property settings when data is loaded", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Property Profile")).toBeInTheDocument();
			expect(screen.getByText("My Hotel")).toBeInTheDocument();
			expect(screen.getByText("hotel")).toBeInTheDocument();
			expect(
				screen.getByText("America/Argentina/Buenos_Aires"),
			).toBeInTheDocument();
			expect(screen.getByText("ARS")).toBeInTheDocument();
			expect(screen.getByText("Av. Corrientes 1234")).toBeInTheDocument();
			expect(screen.getByText("+54 11 5555-1234")).toBeInTheDocument();
			expect(screen.getByText("info@myhotel.test")).toBeInTheDocument();
		});

		it("shows read-only identifiers (id, slug, created_at, updated_at)", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("property-1")).toBeInTheDocument();
			expect(screen.getByText("my-hotel")).toBeInTheDocument();
		});

		it("shows an error state when property load fails", async () => {
			mockUseCurrentProperty.mockReturnValue({
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
					name: "Unable to load property profile.",
				}),
			).toBeInTheDocument();
			expect(
				screen.queryByText("Service request could not be completed."),
			).not.toBeInTheDocument();
		});

		it("shows not-found state when the property does not exist for the session", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: {
					status: "error",
					error: { code: "not-found", message: "The requested record was not found." },
				},
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByRole("heading", { name: "Property not found" }),
			).toBeInTheDocument();
		});

		it("does not leak raw error payloads in error display", async () => {
			mockUseCurrentProperty.mockReturnValue({
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

			await expectSecretFree(document.body.textContent);
		});
	});

	describe("edit mode", () => {
		it("shows an edit button in read mode that switches to edit form", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			const editButton = screen.getByRole("button", { name: "Edit" });
			expect(editButton).toBeInTheDocument();

			await userEvent.setup().click(editButton);

			expect(screen.getByLabelText("Name")).toHaveValue("My Hotel");
			expect(
				screen.getByRole("button", { name: "Cancel" }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Save changes" }),
			).toBeInTheDocument();
		});

		it("keeps read-only fields visible but not editable in edit mode", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit" }),
			);

			// Read-only fields should display as text, not inputs
			expect(screen.getByText("property-1")).toBeInTheDocument();
			expect(screen.getByText("my-hotel")).toBeInTheDocument();
		});

		it("submits valid form data and switches back to read mode", async () => {
			const mockUpdate = vi.fn().mockResolvedValue(undefined);
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit" }),
			);

			const nameInput = screen.getByLabelText("Name");
			await userEvent.setup().clear(nameInput);
			await userEvent.setup().type(nameInput, "Updated Hotel");

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save changes" }),
			);

			await waitFor(() => {
				expect(mockUpdate).toHaveBeenCalledWith({
					name: "Updated Hotel",
					business_type: "hotel",
					timezone: "America/Argentina/Buenos_Aires",
					currency: "ARS",
					address: "Av. Corrientes 1234",
					phone: "+54 11 5555-1234",
					email: "info@myhotel.test",
				});
			});

			// Should return to read mode showing the Edit button
			await waitFor(() => {
				expect(
					screen.getByRole("button", { name: "Edit" }),
				).toBeInTheDocument();
			});
		});

		it("shows inline validation errors when required fields are empty", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit" }),
			);

			const nameInput = screen.getByLabelText("Name");
			await userEvent.setup().clear(nameInput);

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save changes" }),
			);

			expect(screen.getByText("Name is required")).toBeInTheDocument();
		});

		it("shows validation error when email is invalid", async () => {
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit" }),
			);

			const emailInput = screen.getByLabelText("Email");
			await userEvent.setup().clear(emailInput);
			await userEvent.setup().type(emailInput, "not-an-email");

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save changes" }),
			);

			expect(screen.getByText("Invalid email address")).toBeInTheDocument();
		});

		it("shows update error message when the backend update fails", async () => {
			const mockUpdate = vi.fn().mockRejectedValue(new Error("Update failed"));
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit" }),
			);

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save changes" }),
			);

			await waitFor(() => {
				expect(
					screen.getByText("Could not save changes. Please try again."),
				).toBeInTheDocument();
			});
		});

		it("stays in edit mode preserving form values when update fails", async () => {
			const mockUpdate = vi.fn().mockRejectedValue(new Error("Update failed"));
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit" }),
			);

			const nameInput = screen.getByLabelText("Name");
			await userEvent.setup().clear(nameInput);
			await userEvent.setup().type(nameInput, "Changed Hotel");

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Save changes" }),
			);

			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toHaveValue("Changed Hotel");
			});
		});

		it("cancel button returns to read view without saving", async () => {
			const mockUpdate = vi.fn();
			mockUseCurrentProperty.mockReturnValue({
				state: { status: "loaded", property: aProperty },
				update: mockUpdate,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Edit" }),
			);
			await userEvent.setup().click(
				screen.getByRole("button", { name: "Cancel" }),
			);

			expect(mockUpdate).not.toHaveBeenCalled();
			expect(
				screen.getByRole("button", { name: "Edit" }),
			).toBeInTheDocument();
		});
	});
});
