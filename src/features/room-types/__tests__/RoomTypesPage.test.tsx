// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import { i18n } from "../../../shared/i18n/config";
import type { AuthSessionState } from "../../auth/types";
import type { RoomType } from "../types";

// ── Hoisted mocks (run before imports) ───────────────────────────────────

const { mockUseRoomTypes, mockUseAuthSession } = vi.hoisted(() => ({
	mockUseRoomTypes: vi.fn(),
	mockUseAuthSession: vi.fn(),
}));

vi.mock("../useRoomTypes", () => ({
	useRoomTypes: mockUseRoomTypes,
}));

vi.mock("../../auth/hooks/useAuthSession", () => ({
	useAuthSession: mockUseAuthSession,
}));

// ── Test data ───────────────────────────────────────────────────────────

const adminAuthState: AuthSessionState = {
	status: "authenticated",
	session: {
		user: { id: "auth-user-1", email: "admin@innhub.test" },
		profile: {
			id: "profile-1",
			authUserId: "auth-user-1",
			propertyId: "property-1",
			role: "administrator",
			status: "active",
		},
		propertyId: "property-1",
	},
};

const receptionistAuthState: AuthSessionState = {
	status: "authenticated",
	session: {
		user: { id: "auth-user-2", email: "reception@innhub.test" },
		profile: {
			id: "profile-2",
			authUserId: "auth-user-2",
			propertyId: "property-1",
			role: "receptionist",
			status: "active",
		},
		propertyId: "property-1",
	},
};

const queenRoomType: RoomType = {
	id: "rt-1",
	property_id: "property-1",
	name: "Standard Queen",
	description: "A standard queen-sized room",
	capacity: 2,
	base_price: 150.0,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: null,
};

const singleRoomType: RoomType = {
	id: "rt-2",
	property_id: "property-1",
	name: "Single",
	description: null,
	capacity: 1,
	base_price: 80.0,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: null,
};

const allRoomTypes = [queenRoomType, singleRoomType];

const archivedRoomType: RoomType = {
	id: "rt-3",
	property_id: "property-1",
	name: "Archived Suite",
	description: "An archived room type",
	capacity: 3,
	base_price: 200.0,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: "2025-07-01T00:00:00Z",
};

const archivedRoomTypes = [archivedRoomType];

// ── Default mock auth (admin) ───────────────────────────────────────

function mockAdminAuth() {
	mockUseAuthSession.mockReturnValue({
		state: adminAuthState,
		login: vi.fn(),
		logout: vi.fn(),
		refresh: vi.fn(),
	});
}

function mockReceptionistAuth() {
	mockUseAuthSession.mockReturnValue({
		state: receptionistAuthState,
		login: vi.fn(),
		logout: vi.fn(),
		refresh: vi.fn(),
	});
}

// ── Helpers ─────────────────────────────────────────────────────────

async function renderPage() {
	const { RoomTypesPage } = await import("../RoomTypesPage");

	return render(
		<I18nextProvider i18n={i18n}>
			<RoomTypesPage />
		</I18nextProvider>,
	);
}

// ── Tests ───────────────────────────────────────────────────────────

describe("RoomTypesPage", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	describe("loading state", () => {
		it("shows a loading message while room types are being fetched", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loading" },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Loading room types...")).toBeInTheDocument();
		});
	});

	describe("loaded state", () => {
		it("renders a table with room types when data is loaded", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Standard Queen")).toBeInTheDocument();
			expect(screen.getByText("Single")).toBeInTheDocument();
			expect(
				screen.getByText("A standard queen-sized room"),
			).toBeInTheDocument();
			expect(screen.getByText("2")).toBeInTheDocument();
			expect(screen.getByText("150.00")).toBeInTheDocument();
			expect(screen.getByText("1")).toBeInTheDocument();
			expect(screen.getByText("80.00")).toBeInTheDocument();
		});

		it("renders column headers for name, capacity, base price, and description", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Name")).toBeInTheDocument();
			expect(screen.getByText("Capacity")).toBeInTheDocument();
			expect(screen.getByText("Base Price")).toBeInTheDocument();
			expect(screen.getByText("Description")).toBeInTheDocument();
		});
	});

	describe("empty state", () => {
		it("renders an empty state message when there are no room types", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: [] },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByText("No room types found. Create one to get started."),
			).toBeInTheDocument();
		});

		it("does not render a table when the list is empty", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: [] },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.queryByText("Name")).not.toBeInTheDocument();
			expect(screen.queryByText("Capacity")).not.toBeInTheDocument();
		});
	});

	describe("error state", () => {
		it("renders a safe error message when the backend request fails", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: {
					status: "error",
					error: {
						code: "backend-error",
						message: "Service request could not be completed.",
					},
				},
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByText("Unable to load room types."),
			).toBeInTheDocument();
		});

		it("does not leak raw error messages in the error state", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: {
					status: "error",
					error: {
						code: "backend-error",
						message: "token=secret-jwt something failed",
					},
				},
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			const serialized = JSON.stringify(document.body.textContent);
			expect(serialized).not.toContain("secret-jwt");
			expect(serialized).not.toContain("secret-token");
		});
	});

	describe("role gating", () => {
		it("shows create button for administrator", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByRole("button", { name: "Create Room Type" }),
			).toBeInTheDocument();
		});

		it("hides create button for receptionist", async () => {
			mockReceptionistAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.queryByRole("button", { name: "Create Room Type" }),
			).not.toBeInTheDocument();
		});

		it("shows edit buttons on each row for administrator", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			const editButtons = screen.getAllByRole("button", { name: "Edit" });
			expect(editButtons).toHaveLength(2);
		});

		it("hides edit buttons for receptionist", async () => {
			mockReceptionistAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.queryByRole("button", { name: "Edit" }),
			).not.toBeInTheDocument();
		});

		it("shows delete button for administrator", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
			expect(deleteButtons).toHaveLength(2);
		});

		it("hides delete button for receptionist", async () => {
			mockReceptionistAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.queryByRole("button", { name: "Delete" }),
			).not.toBeInTheDocument();
		});
	});

	describe("modal create flow", () => {
		it("opens the create modal when Create Room Type is clicked", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create Room Type" }),
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: "Create Room Type" }),
			).toBeInTheDocument();
		});

		it("closes the modal when clicking the overlay", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create Room Type" }),
			);
			expect(screen.getByRole("dialog")).toBeInTheDocument();

			await userEvent.setup().click(screen.getByTestId("modal-overlay"));
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("shows validation errors when submitting an empty create form", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create Room Type" }),
			);

		await userEvent.setup().click(
			screen.getByRole("button", { name: "Create" }),
		);

		await waitFor(() => {
			expect(screen.getByText("Name is required")).toBeInTheDocument();
		});
		});

		it("calls create handler and closes modal on valid submit", async () => {
			const mockCreate = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: mockCreate,
				update: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create Room Type" }),
			);

			await userEvent.setup().type(
				screen.getByLabelText("Name"),
				"Suite Deluxe",
			);
			await userEvent.setup().type(
				screen.getByLabelText("Capacity"),
				"4",
			);
			await userEvent.setup().type(
				screen.getByLabelText("Base Price"),
				"300",
			);

		await userEvent.setup().click(
			screen.getByRole("button", { name: "Create" }),
		);

		await waitFor(() => {
			expect(mockCreate).toHaveBeenCalledWith({
					name: "Suite Deluxe",
					description: null,
					capacity: 4,
					base_price: 300,
				});
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});
	});

	describe("modal edit flow", () => {
		it("opens the edit modal with pre-filled data when Edit is clicked", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
			showArchived: false,
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			toggleArchived: vi.fn(),
			restore: vi.fn(),
			purge: vi.fn(),
			refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getAllByRole("button", { name: "Edit" })[0],
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: "Edit Room Type" }),
			).toBeInTheDocument();
			expect(screen.getByLabelText("Name")).toHaveValue("Standard Queen");
			expect(screen.getByLabelText("Capacity")).toHaveValue(2);
		});

		it("calls update handler and closes modal on valid edit", async () => {
			const mockUpdate = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: mockUpdate,
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();
			const user = userEvent.setup();

			await user.click(
				screen.getAllByRole("button", { name: "Edit" })[0],
			);

			const nameInput = screen.getByLabelText("Name");
			await user.clear(nameInput);
			await user.type(nameInput, "Standard Queen Updated");

			await user.click(
				screen.getByRole("button", { name: /save changes/i }),
			);

			await waitFor(() => {
				expect(mockUpdate).toHaveBeenCalledWith("rt-1", {
					name: "Standard Queen Updated",
					description: "A standard queen-sized room",
					capacity: 2,
					base_price: 150,
				});
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});
	});

	describe("delete confirmation flow", () => {
		it("opens the confirmation modal when Delete is clicked", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getAllByRole("button", { name: "Delete" })[0],
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByText("This will deactivate the room type. It will no longer appear in the list."),
			).toBeInTheDocument();
		});

		it("calls remove and closes modal when confirm is clicked", async () => {
			const mockRemove = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: mockRemove,
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getAllByRole("button", { name: "Delete" })[0],
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: "Delete" }),
			);

			await waitFor(() => {
				expect(mockRemove).toHaveBeenCalledWith("rt-1");
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});

		it("does not call remove when cancel is clicked", async () => {
			const mockRemove = vi.fn();
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: mockRemove,
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getAllByRole("button", { name: "Delete" })[0],
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: "Cancel" }),
			);

			expect(mockRemove).not.toHaveBeenCalled();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("shows error alert when remove fails", async () => {
			const mockRemove = vi.fn().mockRejectedValue({
				code: "validation-error",
				message: "permission-denied",
			});
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: mockRemove,
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getAllByRole("button", { name: "Delete" })[0],
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: "Delete" }),
			);

			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});

			expect(mockRemove).toHaveBeenCalledWith("rt-1");
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});
	});

	describe("archive toggle", () => {
		it("shows toggle button for administrator", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByRole("button", { name: /view recycle bin/i }),
			).toBeInTheDocument();
		});

		it("hides toggle button for receptionist", async () => {
			mockReceptionistAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.queryByRole("button", { name: /view recycle bin/i }),
			).not.toBeInTheDocument();
		});

		it("calls toggleArchived when toggle is clicked", async () => {
			const mockToggle = vi.fn();
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: allRoomTypes },
				showArchived: false,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: mockToggle,
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /view recycle bin/i }),
			);

			expect(mockToggle).toHaveBeenCalledOnce();
		});

		it("shows 'View Active' label when in archived mode", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByRole("button", { name: /view active/i }),
			).toBeInTheDocument();
		});
	});

	describe("archived table", () => {
		it("renders archived room types with restore and purge buttons", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Archived Suite")).toBeInTheDocument();
			expect(screen.getByText("3")).toBeInTheDocument();
			expect(screen.getByText("200.00")).toBeInTheDocument();
			expect(screen.getByText("An archived room type")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /restore/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /purge/i }),
			).toBeInTheDocument();
		});

		it("renders empty state when no archived room types exist", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: [] },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByText(/no archived room types/i),
			).toBeInTheDocument();
		});
	});

	describe("restore flow", () => {
		it("opens restore dialog when Restore is clicked", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /restore/i }),
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByText(/restore this room type/i),
			).toBeInTheDocument();
		});

		it("calls restore and closes dialog on confirm", async () => {
			const mockRestore = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: mockRestore,
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /restore/i }),
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: /restore/i }),
			);

			await waitFor(() => {
				expect(mockRestore).toHaveBeenCalledWith("rt-3");
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});

		it("shows duplicate name error when restore fails", async () => {
			const mockRestore = vi.fn().mockRejectedValue({
				code: "validation-error",
				message: "A room type with this name already exists.",
			});
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: mockRestore,
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /restore/i }),
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: /restore/i }),
			);

			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});

			expect(mockRestore).toHaveBeenCalledWith("rt-3");
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});
	});

	describe("purge flow", () => {
		it("opens purge dialog when Purge is clicked", async () => {
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /purge/i }),
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: /permanently delete/i }),
			).toBeInTheDocument();
		});

		it("calls purge and closes dialog on confirm", async () => {
			const mockPurge = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: mockPurge,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /purge/i }),
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: /purge/i }),
			);

			await waitFor(() => {
				expect(mockPurge).toHaveBeenCalledWith("rt-3");
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});

		it("shows FK conflict error when purge fails", async () => {
			const mockPurge = vi.fn().mockRejectedValue({
				code: "foreign-key-conflict",
				message: "This room type is referenced by rooms or reservations.",
			});
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: mockPurge,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /purge/i }),
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: /purge/i }),
			);

			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});

			expect(mockPurge).toHaveBeenCalledWith("rt-3");
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});
	});

	describe("cancel dismisses without calling service", () => {
		it("does not call restore when cancel is clicked in restore dialog", async () => {
			const mockRestore = vi.fn();
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: mockRestore,
				purge: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /restore/i }),
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: /cancel/i }),
			);

			expect(mockRestore).not.toHaveBeenCalled();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("does not call purge when cancel is clicked in purge dialog", async () => {
			const mockPurge = vi.fn();
			mockAdminAuth();
			mockUseRoomTypes.mockReturnValue({
				state: { status: "loaded", roomTypes: archivedRoomTypes },
				showArchived: true,
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				toggleArchived: vi.fn(),
				restore: vi.fn(),
				purge: mockPurge,
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: /purge/i }),
			);

			const dialog = screen.getByRole("dialog");
			await userEvent.setup().click(
				within(dialog).getByRole("button", { name: /cancel/i }),
			);

			expect(mockPurge).not.toHaveBeenCalled();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});
});
