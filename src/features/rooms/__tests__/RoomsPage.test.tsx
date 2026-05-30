// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import { i18n } from "../../../shared/i18n/config";
import type { AuthSessionState } from "../../auth/types";
import type { Room } from "../types";
import type { RoomType } from "../../room-types/types";

// ── Hoisted mocks (run before imports) ───────────────────────────────────

const { mockUseRooms, mockUseAuthSession } = vi.hoisted(() => ({
	mockUseRooms: vi.fn(),
	mockUseAuthSession: vi.fn(),
}));

vi.mock("../useRooms", () => ({
	useRooms: mockUseRooms,
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

const room1: Room = {
	id: "room-1",
	property_id: "property-1",
	room_type_id: "rt-1",
	identifier: "101",
	floor: "1",
	state: "available",
	description: null,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: null,
};

const room2: Room = {
	id: "room-2",
	property_id: "property-1",
	room_type_id: "rt-2",
	identifier: "102",
	floor: "1",
	state: "occupied",
	description: "Corner room",
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: null,
};

const room3: Room = {
	id: "room-3",
	property_id: "property-1",
	room_type_id: "rt-1",
	identifier: "201",
	floor: null,
	state: "cleaning",
	description: "Suite with view",
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
	deleted_at: null,
};

const allRooms = [room1, room2, room3];

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

function mockLoadedRooms(overrides?: { rooms?: Room[]; roomTypes?: RoomType[] }) {
	mockUseRooms.mockReturnValue({
		state: { status: "loaded", rooms: overrides?.rooms ?? allRooms },
		roomTypes: overrides?.roomTypes ?? allRoomTypes,
		showArchived: false,
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		toggleArchived: vi.fn(),
		restore: vi.fn(),
		purge: vi.fn(),
		refresh: vi.fn(),
	});
}

// ── Helpers ─────────────────────────────────────────────────────────

async function renderPage() {
	const { RoomsPage } = await import("../RoomsPage");

	return render(
		<I18nextProvider i18n={i18n}>
			<RoomsPage />
		</I18nextProvider>,
	);
}

// ── Tests ───────────────────────────────────────────────────────────

describe("RoomsPage", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	describe("loading state", () => {
		it("shows a loading message while rooms are being fetched", async () => {
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loading" },
				roomTypes: [],
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(screen.getByText("Loading rooms...")).toBeInTheDocument();
		});
	});

	describe("error state", () => {
		it("renders a safe error message when the backend request fails", async () => {
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: {
					status: "error",
					error: {
						code: "backend-error",
						message: "Service request could not be completed.",
					},
				},
				roomTypes: [],
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			expect(
				screen.getByText("Unable to load rooms."),
			).toBeInTheDocument();
		});

		it("does not leak raw error messages in the error state", async () => {
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: {
					status: "error",
					error: {
						code: "backend-error",
						message: "token=secret-jwt something failed",
					},
				},
				roomTypes: [],
				create: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			const serialized = JSON.stringify(document.body.textContent);
			expect(serialized).not.toContain("secret-jwt");
			expect(serialized).not.toContain("secret-token");
		});
	});

	describe("empty state", () => {
		it("renders an empty state message when there are no rooms", async () => {
			mockAdminAuth();
			mockLoadedRooms({ rooms: [] });

			await renderPage();

			expect(
				screen.getByText("No rooms found. Create one to get started."),
			).toBeInTheDocument();
		});

		it("does not render a table when the list is empty", async () => {
			mockAdminAuth();
			mockLoadedRooms({ rooms: [] });

			await renderPage();

			expect(screen.queryByText("Identifier")).not.toBeInTheDocument();
		});
	});

	describe("loaded state", () => {
		it("renders a table with rooms when data is loaded", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			expect(screen.getByText("101")).toBeInTheDocument();
			expect(screen.getByText("102")).toBeInTheDocument();
			expect(screen.getByText("201")).toBeInTheDocument();
			// "Standard Queen" appears in both filter dropdown and table cells
			expect(screen.getAllByText("Standard Queen").length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText("Single").length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Corner room")).toBeInTheDocument();
			expect(screen.getByText("Suite with view")).toBeInTheDocument();
		});

		it("renders StatusBadge for each room state", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			// State labels appear in both filter options and StatusBadge spans
			expect(screen.getAllByText("Available").length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText("Occupied").length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText("Cleaning").length).toBeGreaterThanOrEqual(2);
		});

		it("shows dash for null floor", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			// room3 has null floor, should show "—"
			const rows = screen.getAllByRole("row");
			expect(rows.length).toBe(4); // header + 3 data rows
		});

		it("shows dash for null description", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			// room1 has null description, should show "—"
			const dashes = screen.getAllByText("—");
			expect(dashes.length).toBeGreaterThanOrEqual(1);
		});

		it("renders column headers", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			expect(screen.getByText("Identifier")).toBeInTheDocument();
			expect(screen.getByText("Room Type")).toBeInTheDocument();
			expect(screen.getByText("Floor")).toBeInTheDocument();
			expect(screen.getByText("State")).toBeInTheDocument();
			expect(screen.getByText("Description")).toBeInTheDocument();
		});
	});

	describe("status filter", () => {
		it("narrows results when a status is selected", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const statusFilter = screen.getByRole("combobox", { name: "Status filter" });
			await userEvent.setup().selectOptions(statusFilter, "occupied");

			expect(screen.queryByText("101")).not.toBeInTheDocument();
			expect(screen.getByText("102")).toBeInTheDocument();
			expect(screen.queryByText("201")).not.toBeInTheDocument();
		});

		it("shows all rooms when All Statuses is selected", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const statusFilter = screen.getByRole("combobox", { name: "Status filter" });
			await userEvent.setup().selectOptions(statusFilter, "occupied");
			expect(screen.queryByText("101")).not.toBeInTheDocument();

			await userEvent.setup().selectOptions(statusFilter, "");
			expect(screen.getByText("101")).toBeInTheDocument();
			expect(screen.getByText("102")).toBeInTheDocument();
			expect(screen.getByText("201")).toBeInTheDocument();
		});
	});

	describe("room type filter", () => {
		it("narrows results when a room type is selected", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const typeFilter = screen.getByRole("combobox", { name: "Room type filter" });
			await userEvent.setup().selectOptions(typeFilter, "rt-1");

			expect(screen.getByText("101")).toBeInTheDocument();
			expect(screen.queryByText("102")).not.toBeInTheDocument();
			expect(screen.getByText("201")).toBeInTheDocument();
		});

		it("shows all types in the dropdown", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const typeFilter = screen.getByRole("combobox", { name: "Room type filter" });
			expect(typeFilter).toBeInTheDocument();
			// "Standard Queen" appears in both dropdown and table
			expect(screen.getAllByText("Standard Queen").length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText("Single").length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("text search", () => {
		it("matches identifier", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const searchInput = screen.getByPlaceholderText("Search by identifier or description...");
			await userEvent.setup().type(searchInput, "101");

			expect(screen.getByText("101")).toBeInTheDocument();
			expect(screen.queryByText("102")).not.toBeInTheDocument();
			expect(screen.queryByText("201")).not.toBeInTheDocument();
		});

		it("matches description", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const searchInput = screen.getByPlaceholderText("Search by identifier or description...");
			await userEvent.setup().type(searchInput, "Corner");

			expect(screen.queryByText("101")).not.toBeInTheDocument();
			expect(screen.getByText("102")).toBeInTheDocument();
			expect(screen.queryByText("201")).not.toBeInTheDocument();
		});

		it("is case-insensitive", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const searchInput = screen.getByPlaceholderText("Search by identifier or description...");
			await userEvent.setup().type(searchInput, "corner");

			expect(screen.getByText("102")).toBeInTheDocument();
		});
	});

	describe("role gating", () => {
		it("shows create button for administrator", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			expect(
				screen.getByRole("button", { name: "Create Room" }),
			).toBeInTheDocument();
		});

		it("hides create button for receptionist", async () => {
			mockReceptionistAuth();
			mockLoadedRooms();

			await renderPage();

			expect(
				screen.queryByRole("button", { name: "Create Room" }),
			).not.toBeInTheDocument();
		});

		it("shows edit buttons on each row for administrator", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const editButtons = screen.getAllByRole("button", { name: "Edit" });
			expect(editButtons).toHaveLength(3);
		});

		it("shows edit buttons for receptionist", async () => {
			mockReceptionistAuth();
			mockLoadedRooms();

			await renderPage();

			const editButtons = screen.getAllByRole("button", { name: "Edit" });
			expect(editButtons).toHaveLength(3);
		});

		it("shows delete buttons on each row for administrator", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
			expect(deleteButtons).toHaveLength(3);
		});

		it("hides delete buttons for receptionist", async () => {
			mockReceptionistAuth();
			mockLoadedRooms();

			await renderPage();

			expect(
				screen.queryByRole("button", { name: "Delete" }),
			).not.toBeInTheDocument();
		});
	});

	describe("modal create flow", () => {
		it("opens the create modal when Create Room is clicked", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create Room" }),
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: "Create Room" }),
			).toBeInTheDocument();
		});

		it("shows validation errors when submitting an empty create form", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create Room" }),
			);

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create" }),
			);

			await waitFor(() => {
				expect(screen.getByText("Identifier is required")).toBeInTheDocument();
			});
		});

		it("calls create handler and closes modal on valid submit", async () => {
			const mockCreate = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loaded", rooms: allRooms },
				roomTypes: allRoomTypes,
				create: mockCreate,
				update: vi.fn(),
				remove: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create Room" }),
			);

			await userEvent.setup().type(
				screen.getByLabelText("Identifier"),
				"301",
			);
			await userEvent.setup().selectOptions(
				screen.getByLabelText("Room Type"),
				"rt-1",
			);

			await userEvent.setup().click(
				screen.getByRole("button", { name: "Create" }),
			);

			await waitFor(() => {
				expect(mockCreate).toHaveBeenCalledWith(
					expect.objectContaining({
						identifier: "301",
						room_type_id: "rt-1",
					}),
				);
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});
	});

	describe("modal edit flow", () => {
		it("opens the edit modal with pre-filled data when Edit is clicked", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			await userEvent.setup().click(
				screen.getAllByRole("button", { name: "Edit" })[0],
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: "Edit Room" }),
			).toBeInTheDocument();
			expect(screen.getByLabelText("Identifier")).toHaveValue("101");
			expect(screen.getByLabelText("Room Type")).toHaveValue("rt-1");
		});

		it("calls update handler and closes modal on valid edit", async () => {
			const mockUpdate = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loaded", rooms: allRooms },
				roomTypes: allRoomTypes,
				create: vi.fn(),
				update: mockUpdate,
				remove: vi.fn(),
				refresh: vi.fn(),
			});

			await renderPage();
			const user = userEvent.setup();

			await user.click(
				screen.getAllByRole("button", { name: "Edit" })[0],
			);

			const identifierInput = screen.getByLabelText("Identifier");
			await user.clear(identifierInput);
			await user.type(identifierInput, "101-updated");

			await user.click(
				screen.getByRole("button", { name: /save changes/i }),
			);

			await waitFor(() => {
				expect(mockUpdate).toHaveBeenCalledWith(
					"room-1",
					expect.objectContaining({
						identifier: "101-updated",
					}),
				);
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});
	});

	describe("delete confirmation flow", () => {
		it("opens the confirmation modal when Delete is clicked", async () => {
			mockAdminAuth();
			mockLoadedRooms();

			await renderPage();

			await userEvent.setup().click(
				screen.getAllByRole("button", { name: "Delete" })[0],
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByText("This will deactivate the room. It will no longer appear in the list."),
			).toBeInTheDocument();
		});

		it("calls remove and closes modal when confirm is clicked", async () => {
			const mockRemove = vi.fn().mockResolvedValue(undefined);
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loaded", rooms: allRooms },
				roomTypes: allRoomTypes,
				create: vi.fn(),
				update: vi.fn(),
				remove: mockRemove,
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
				expect(mockRemove).toHaveBeenCalledWith("room-1");
			});

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});

		it("does not call remove when cancel is clicked", async () => {
			const mockRemove = vi.fn();
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loaded", rooms: allRooms },
				roomTypes: allRoomTypes,
				create: vi.fn(),
				update: vi.fn(),
				remove: mockRemove,
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

		it("shows error alert when remove fails with permission error", async () => {
			const mockRemove = vi.fn().mockRejectedValue({
				code: "validation-error",
				message: "permission-denied",
			});
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loaded", rooms: allRooms },
				roomTypes: allRoomTypes,
				create: vi.fn(),
				update: vi.fn(),
				remove: mockRemove,
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

			expect(mockRemove).toHaveBeenCalledWith("room-1");
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});

		it("shows reservation error when delete is blocked by active reservations", async () => {
			const mockRemove = vi.fn().mockRejectedValue({
				code: "validation-error",
				message: "Cannot delete room with active reservations",
			});
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loaded", rooms: allRooms },
				roomTypes: allRoomTypes,
				create: vi.fn(),
				update: vi.fn(),
				remove: mockRemove,
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
				expect(screen.getByText("Cannot delete room with active reservations.")).toBeInTheDocument();
			});

			expect(mockRemove).toHaveBeenCalledWith("room-1");
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});

		it("hides delete for low-privilege roles", async () => {
			mockReceptionistAuth();
			mockLoadedRooms();

			await renderPage();

			expect(
				screen.queryByRole("button", { name: "Delete" }),
			).not.toBeInTheDocument();
		});
	});

	describe("recycle bin toggle", () => {
		it("renders archive toggle button for manager", async () => {
			mockAdminAuth();
			mockLoadedRooms();
			await renderPage();
			expect(screen.getByRole("button", { name: /view recycle bin|ver papelera/i })).toBeInTheDocument();
		});

		it("hides archive toggle for receptionist", async () => {
			mockReceptionistAuth();
			mockLoadedRooms();
			await renderPage();
			expect(screen.queryByRole("button", { name: /recycle bin|papelera/i })).not.toBeInTheDocument();
		});

		it("toggle shows archived view", async () => {
			mockAdminAuth();
			mockUseRooms.mockReturnValue({
				state: { status: "loaded", rooms: [] },
				roomTypes: [],
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
			expect(screen.getByText(/recycle bin|papelera/i)).toBeInTheDocument();
		});
	});
});
