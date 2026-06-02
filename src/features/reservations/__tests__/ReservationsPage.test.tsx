// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "../../../shared/i18n/config";
import type { AuthSessionState } from "../../auth/types";
import type { ReservationListResult } from "../types";

const {
	mockUseReservations,
	mockUseAuthSession,
	mockGuestList,
	mockGuestCreate,
	mockRoomTypeList,
	mockRoomList,
} = vi.hoisted(() => ({
	mockUseReservations: vi.fn(),
	mockUseAuthSession: vi.fn(),
	mockGuestList: vi.fn(),
	mockGuestCreate: vi.fn(),
	mockRoomTypeList: vi.fn(),
	mockRoomList: vi.fn(),
}));

vi.mock("../useReservations", () => ({
	useReservations: mockUseReservations,
}));

vi.mock("../../auth/hooks/useAuthSession", () => ({
	useAuthSession: mockUseAuthSession,
}));

vi.mock("../../guests/guestService", () => ({
	list: mockGuestList,
	create: mockGuestCreate,
}));

vi.mock("../../room-types/roomTypeService", () => ({
	list: mockRoomTypeList,
}));

vi.mock("../../rooms/roomService", () => ({
	list: mockRoomList,
}));

const receptionistAuthState: AuthSessionState = {
	status: "authenticated",
	session: {
		user: { id: "auth-user-1", email: "reception@innhub.test" },
		profile: {
			id: "profile-1",
			authUserId: "auth-user-1",
			propertyId: "property-1",
			role: "receptionist",
			status: "active",
		},
		propertyId: "property-1",
	},
};

const managerAuthState: AuthSessionState = {
	status: "authenticated",
	session: {
		user: { id: "auth-user-2", email: "manager@innhub.test" },
		profile: {
			id: "profile-2",
			authUserId: "auth-user-2",
			propertyId: "property-1",
			role: "manager",
			status: "active",
		},
		propertyId: "property-1",
	},
};

const adminAuthState: AuthSessionState = {
	status: "authenticated",
	session: {
		user: { id: "auth-user-3", email: "admin@innhub.test" },
		profile: {
			id: "profile-3",
			authUserId: "auth-user-3",
			propertyId: "property-1",
			role: "administrator",
			status: "active",
		},
		propertyId: "property-1",
	},
};

const loadedResult: ReservationListResult = {
	reservations: [
		{
			id: "res-1",
			reference: "RES-0001",
			property_id: "property-1",
			primary_guest_id: "guest-1",
			primary_guest_name: "Ana Lopez",
			planned_check_in_date: "2026-09-01",
			planned_check_out_date: "2026-09-03",
			status: "confirmed",
			notes: "Late arrival",
			room_type_id: "rt-1",
			room_type_name: "Standard",
			room_id: "room-1",
			room_identifier: "101",
			item_summary: "101 · Standard, 201 · Suite",
			guest_count: 2,
			reservation_items: [
				{ room_type_id: "rt-1", room_id: "room-1", guest_count: 2 },
				{ room_type_id: "rt-2", room_id: "room-2", guest_count: 1 },
			],
			created_at: "2026-08-01T00:00:00Z",
			updated_at: "2026-08-01T00:00:00Z",
			deleted_at: null,
		},
		{
			id: "res-2",
			reference: "RES-0002",
			property_id: "property-1",
			primary_guest_id: "guest-2",
			primary_guest_name: "Luis Rojas",
			planned_check_in_date: "2026-09-05",
			planned_check_out_date: "2026-09-08",
			status: "checked_in",
			notes: null,
			room_type_id: "rt-2",
			room_type_name: "Suite",
			room_id: "room-2",
			room_identifier: "201",
			item_summary: "201 · Suite",
			guest_count: 2,
			reservation_items: [
				{ room_type_id: "rt-2", room_id: "room-2", guest_count: 2 },
			],
			created_at: "2026-08-01T00:00:00Z",
			updated_at: "2026-08-01T00:00:00Z",
			deleted_at: null,
		},
	] as ReservationListResult["reservations"],
	page: 1,
	pageSize: 20,
	total: 25,
};

function mockAuth(state: AuthSessionState) {
	mockUseAuthSession.mockReturnValue({
		state,
		login: vi.fn(),
		logout: vi.fn(),
		refresh: vi.fn(),
	});
}

function baseHook() {
	return {
		state: { status: "loaded", result: loadedResult } as const,
		showTrash: false,
		params: {
			page: 1,
			pageSize: 20,
			search: "",
			status: "all" as const,
			checkInFrom: "",
			checkInTo: "",
			checkOutFrom: "",
			checkOutTo: "",
			room_id: "",
			guest_id: "",
		},
		setSearch: vi.fn(),
		setStatus: vi.fn(),
		setPage: vi.fn(),
		setCheckInFrom: vi.fn(),
		setCheckInTo: vi.fn(),
		setCheckOutFrom: vi.fn(),
		setCheckOutTo: vi.fn(),
		setRoomId: vi.fn(),
		setGuestId: vi.fn(),
		toggleTrash: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		cancel: vi.fn(),
		remove: vi.fn(),
		restore: vi.fn(),
		purge: vi.fn(),
		refresh: vi.fn(),
	};
}

function mockLoaded(overrides?: Partial<ReturnType<typeof baseHook>>) {
	mockUseReservations.mockReturnValue({ ...baseHook(), ...overrides });
}

async function renderPage() {
	const { ReservationsPage } = await import("../ReservationsPage");
	return render(
		<I18nextProvider i18n={i18n}>
			<ReservationsPage />
		</I18nextProvider>,
	);
}

describe("ReservationsPage", () => {
	beforeEach(() => {
		mockGuestList.mockResolvedValue({
			ok: true,
			data: {
				guests: [
					{
						id: "guest-1",
						property_id: "property-1",
						first_name: "Ana",
						last_name: "Lopez",
						document_type: "dni",
						document_number: "123",
						email: null,
						phone: null,
						notes: null,
						created_at: "",
						updated_at: "",
						deleted_at: null,
					},
				],
				page: 1,
				pageSize: 20,
				total: 1,
			},
		});
		mockGuestCreate.mockResolvedValue({
			ok: true,
			data: {
				id: "guest-new",
				property_id: "property-1",
				first_name: "New",
				last_name: "Guest",
				document_type: "dni",
				document_number: "456",
				email: null,
				phone: null,
				notes: null,
				created_at: "",
				updated_at: "",
				deleted_at: null,
			},
		});
		mockRoomTypeList.mockResolvedValue({
			ok: true,
			data: [
				{
					id: "rt-1",
					property_id: "property-1",
					name: "Standard",
					description: null,
					capacity: 2,
					base_price: 100,
					created_at: "",
					updated_at: "",
					deleted_at: null,
				},
				{
					id: "rt-2",
					property_id: "property-1",
					name: "Suite",
					description: null,
					capacity: 4,
					base_price: 180,
					created_at: "",
					updated_at: "",
					deleted_at: null,
				},
			],
		});
		mockRoomList.mockResolvedValue({
			ok: true,
			data: [
				{
					id: "room-1",
					property_id: "property-1",
					room_type_id: "rt-1",
					identifier: "101",
					floor: null,
					state: "available",
					notes: null,
					created_at: "",
					updated_at: "",
					deleted_at: null,
				},
				{
					id: "room-2",
					property_id: "property-1",
					room_type_id: "rt-2",
					identifier: "201",
					floor: null,
					state: "occupied",
					notes: null,
					created_at: "",
					updated_at: "",
					deleted_at: null,
				},
			],
		});
	});
	beforeEach(async () => {
		await i18n.changeLanguage("en");
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("shows loading, error, and empty/no-results states safely", async () => {
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue({
			...baseHook(),
			state: { status: "loading" },
		});
		await renderPage();
		expect(screen.getByText("Loading reservations...")).toBeInTheDocument();

		cleanup();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue({
			...baseHook(),
			state: {
				status: "error",
				error: { code: "backend-error", message: "secret" },
			},
		});
		await renderPage();
		expect(
			screen.getByText("Unable to load reservations."),
		).toBeInTheDocument();
		expect(document.body.textContent).not.toContain("secret");

		cleanup();
		mockAuth(receptionistAuthState);
		mockLoaded({
			state: {
				status: "loaded",
				result: { ...loadedResult, reservations: [], total: 0 },
			},
		});
		await renderPage();
		expect(screen.getByText("No reservations found.")).toBeInTheDocument();

		cleanup();
		mockAuth(receptionistAuthState);
		mockLoaded({
			params: { ...baseHook().params, search: "res-999" },
			state: {
				status: "loaded",
				result: { ...loadedResult, reservations: [], total: 10 },
			},
		});
		await renderPage();
		expect(
			screen.getByText("No reservations match the current filters."),
		).toBeInTheDocument();
	});

	it("renders core active UI with overview, status chips, filters, table and pagination", async () => {
		mockAuth(receptionistAuthState);
		mockLoaded();
		await renderPage();

		expect(
			screen.getByRole("heading", { name: "Reservations", level: 2 }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Create reservation" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Operational snapshot", level: 3 }),
		).toBeInTheDocument();
		expect(
			screen.getByLabelText("Reservation summary metrics"),
		).toBeInTheDocument();
		expect(screen.getByText("Visible reservations")).toBeInTheDocument();
		expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
		expect(screen.getByText("Arrivals today")).toBeInTheDocument();
		expect(screen.getByText("Departures today")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Status views", level: 3 }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "All 2" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		expect(
			screen.getByRole("button", { name: "Confirmed 1" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Checked-in 1" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Filters", level: 3 }),
		).toBeInTheDocument();
		expect(
			screen.getByLabelText("Search reservations by guest name or reference"),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Reservation status")).toBeInTheDocument();
		expect(screen.getAllByText("Check-in").length).toBeGreaterThan(0);
		expect(screen.getByLabelText("Check-in from")).toBeInTheDocument();
		expect(screen.getByLabelText("Check-in to")).toBeInTheDocument();
		expect(screen.getAllByText("Check-out").length).toBeGreaterThan(0);
		expect(screen.getByLabelText("Check-out from")).toBeInTheDocument();
		expect(screen.getByLabelText("Check-out to")).toBeInTheDocument();
		expect(screen.getByLabelText("Room")).toBeInTheDocument();
		expect(screen.getByLabelText("Guest")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Reservation list", level: 3 }),
		).toBeInTheDocument();
		expect(
			screen.getByText("Showing 2 loaded reservations"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("table", { name: "Reservations table" }),
		).toBeInTheDocument();
		expect(screen.getByText("RES-0001")).toBeInTheDocument();
		expect(screen.getByText("Ana Lopez")).toBeInTheDocument();
		expect(screen.getByText("101 · Standard, 201 · Suite")).toBeInTheDocument();
		expect(screen.queryByText("res-1")).not.toBeInTheDocument();
		expect(screen.queryByText("guest-1")).not.toBeInTheDocument();
		expect(screen.queryByText("room-1")).not.toBeInTheDocument();
		expect(screen.getAllByText("confirmed").length).toBeGreaterThan(0);
		expect(
			screen.getByRole("button", { name: "Next page" }),
		).toBeInTheDocument();
	});

	it("renders status chips as accessible shortcuts without hiding filters or table", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		const confirmedChip = screen.getByRole("button", { name: "Confirmed 1" });
		expect(confirmedChip).toHaveAttribute("aria-pressed", "false");

		await user.click(confirmedChip);
		expect(hook.setStatus).toHaveBeenCalledWith("confirmed");
		expect(
			screen.getByLabelText("Search reservations by guest name or reference"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("table", { name: "Reservations table" }),
		).toBeInTheDocument();
	});

	it("wires search/filter/pagination interactions through hook API", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		fireEvent.change(
			screen.getByLabelText("Search reservations by guest name or reference"),
			{
				target: { value: "res-2" },
			},
		);
		expect(hook.setSearch).toHaveBeenLastCalledWith("res-2");

		fireEvent.change(screen.getByLabelText("Reservation status"), {
			target: { value: "confirmed" },
		});
		expect(hook.setStatus).toHaveBeenCalledWith("confirmed");

		fireEvent.change(screen.getByLabelText("Check-in from"), {
			target: { value: "2026-09-01" },
		});
		expect(hook.setCheckInFrom).toHaveBeenCalledWith("2026-09-01");
		fireEvent.change(screen.getByLabelText("Check-in to"), {
			target: { value: "2026-09-30" },
		});
		expect(hook.setCheckInTo).toHaveBeenCalledWith("2026-09-30");
		fireEvent.change(screen.getByLabelText("Check-out from"), {
			target: { value: "2026-09-02" },
		});
		expect(hook.setCheckOutFrom).toHaveBeenCalledWith("2026-09-02");
		fireEvent.change(screen.getByLabelText("Check-out to"), {
			target: { value: "2026-09-15" },
		});
		expect(hook.setCheckOutTo).toHaveBeenCalledWith("2026-09-15");
		await waitFor(() => {
			expect(
				screen.getByRole("option", { name: "101 · Standard" }),
			).toBeInTheDocument();
		});
		fireEvent.change(screen.getByLabelText("Room"), {
			target: { value: "room-1" },
		});
		expect(hook.setRoomId).toHaveBeenCalledWith("room-1");
		fireEvent.change(screen.getByLabelText("Guest"), {
			target: { value: "guest-1" },
		});
		expect(hook.setGuestId).toHaveBeenCalledWith("guest-1");

		await user.click(screen.getByRole("button", { name: "Next page" }));
		expect(hook.setPage).toHaveBeenCalledWith(2);
	});

	it("shows lifecycle-eligible actions only for active reservations", async () => {
		mockAuth(managerAuthState);
		mockLoaded();
		await renderPage();

		expect(
			screen.getByRole("button", { name: "Edit reservation RES-0001" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Cancel reservation RES-0001" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Archive reservation RES-0001" }),
		).toBeInTheDocument();

		expect(
			screen.queryByRole("button", { name: "Edit reservation RES-0002" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Cancel reservation RES-0002" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Archive reservation RES-0002" }),
		).not.toBeInTheDocument();
	});

	it("submits create payload from form values", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		await user.selectOptions(screen.getByLabelText("Primary guest"), "guest-1");
		await user.type(screen.getByLabelText("Check-in date"), "2026-10-01");
		await user.type(screen.getByLabelText("Check-out date"), "2026-10-03");
		await user.selectOptions(screen.getByLabelText("Room type"), "rt-1");
		await user.selectOptions(
			screen.getByLabelText("Room (optional)"),
			"room-1",
		);
		fireEvent.change(screen.getByLabelText("Guest count"), {
			target: { value: "3" },
		});

		await user.click(
			screen.getAllByRole("button", { name: "Create reservation" })[1],
		);

		expect(hook.create).toHaveBeenCalledWith(
			expect.objectContaining({
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-10-01",
				planned_check_out_date: "2026-10-03",
				room_type_id: "rt-1",
				room_id: "room-1",
				guest_count: 3,
			}),
		);
	});

	it("quick-creates a guest and auto-selects it", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		await user.click(screen.getByRole("button", { name: "Register guest" }));
		await user.type(screen.getByLabelText("Guest first name"), "Carlos");
		await user.type(screen.getByLabelText("Guest last name"), "Perez");
		await user.type(screen.getByLabelText("Document type"), "dni");
		await user.type(screen.getByLabelText("Document number"), "789");
		await user.click(screen.getByRole("button", { name: "Create guest" }));

		await waitFor(() => {
			expect(screen.getByLabelText("Primary guest")).toHaveValue("guest-new");
		});
	});

	it("prefills edit form with all item rows and supports removing an item before save", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Edit reservation RES-0001" }),
		);

		expect(screen.getAllByText(/Item \d/)).toHaveLength(2);
		expect(screen.getAllByLabelText("Room type")[0]).toHaveValue("rt-1");
		expect(screen.getAllByLabelText("Room type")[1]).toHaveValue("rt-2");
		expect(screen.getAllByLabelText("Room (optional)")[0]).toHaveValue(
			"room-1",
		);
		expect(screen.getAllByLabelText("Room (optional)")[1]).toHaveValue(
			"room-2",
		);
		expect(screen.getAllByLabelText("Guest count")[0]).toHaveValue(2);
		expect(screen.getAllByLabelText("Guest count")[1]).toHaveValue(1);

		await user.click(
			screen.getAllByRole("button", { name: "Remove item" })[1]!,
		);
		await user.click(screen.getByRole("button", { name: "Save changes" }));

		expect(hook.update).toHaveBeenCalledWith(
			"res-1",
			expect.objectContaining({
				reservation_items: [
					expect.objectContaining({
						room_type_id: "rt-1",
						room_id: "room-1",
						guest_count: 2,
					}),
				],
			}),
		);
	});

	it("supports adding a new item while editing an existing reservation", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Edit reservation RES-0001" }),
		);
		await user.click(screen.getByRole("button", { name: "Add item" }));
		await user.selectOptions(screen.getAllByLabelText("Room type")[2]!, "rt-1");
		expect(
			Array.from(
				screen
					.getAllByLabelText("Room (optional)")[2]!
					.querySelectorAll("option"),
			).map((option) => option.textContent),
		).toEqual(["No room assigned"]);
		fireEvent.change(screen.getAllByLabelText("Guest count")[2]!, {
			target: { value: "1" },
		});

		await user.click(screen.getByRole("button", { name: "Save changes" }));

		expect(hook.update).toHaveBeenCalledWith(
			"res-1",
			expect.objectContaining({
				reservation_items: [
					expect.objectContaining({
						room_type_id: "rt-1",
						room_id: "room-1",
						guest_count: 2,
					}),
					expect.objectContaining({
						room_type_id: "rt-2",
						room_id: "room-2",
						guest_count: 1,
					}),
					expect.objectContaining({
						room_type_id: "rt-1",
						room_id: null,
						guest_count: 1,
					}),
				],
			}),
		);
	});

	it("toggles trash mode and restores reservations with confirmation", async () => {
		const hook = {
			...baseHook(),
			showTrash: true,
		};
		mockAuth(managerAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		expect(
			screen.getByRole("button", { name: "View active reservations" }),
		).toBeInTheDocument();
		await user.click(screen.getAllByRole("button", { name: "Restore" })[0]);
		expect(
			screen.getByRole("heading", { name: "Restore reservation" }),
		).toBeInTheDocument();
		const restoreButtons = screen.getAllByRole("button", { name: "Restore" });
		await user.click(restoreButtons[restoreButtons.length - 1]);
		expect(hook.restore).toHaveBeenCalledWith("res-1");
	});

	it("requires strict confirmation and shows purge blockers", async () => {
		const hook = {
			...baseHook(),
			showTrash: true,
			purge: vi.fn().mockRejectedValue({
				code: "foreign-key-conflict",
				message:
					"reservation-has-financial-records invoiceCount=2 paymentCount=1",
			}),
		};
		mockAuth(adminAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", {
				name: "Purge reservation RES-0001 permanently",
			}),
		);
		expect(
			screen.getByRole("heading", { name: "Permanently delete reservation" }),
		).toBeInTheDocument();

		const purgeButton = screen.getByRole("button", {
			name: "Purge permanently",
		});
		expect(purgeButton).toBeDisabled();
		await user.type(screen.getByLabelText("Confirmation phrase"), "PURGE");
		expect(purgeButton).not.toBeDisabled();
		await user.click(purgeButton);
		await waitFor(() => {
			expect(
				screen.getByText(
					"Cannot purge reservation because 2 invoice(s) and 1 payment(s) are linked.",
				),
			).toBeInTheDocument();
		});
	});

	it("uses selector labels and hides raw create/edit ID labels in modal", async () => {
		mockAuth(receptionistAuthState);
		mockLoaded();
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);

		expect(screen.getByLabelText("Primary guest")).toBeInTheDocument();
		expect(screen.getByLabelText("Room type")).toBeInTheDocument();
		expect(screen.getByLabelText("Room (optional)")).toBeInTheDocument();
		expect(screen.queryByLabelText("Primary guest ID")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Room type ID")).not.toBeInTheDocument();
		expect(
			screen.queryByLabelText("Room ID (optional)"),
		).not.toBeInTheDocument();
	});

	it("keeps quick-create errors in modal and sends required guest fields", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		mockGuestCreate.mockResolvedValueOnce({
			ok: false,
			error: { code: "validation-error", message: "invalid" },
		});
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		await user.click(screen.getByRole("button", { name: "Register guest" }));
		await user.type(screen.getByLabelText("Guest first name"), "Carlos");
		await user.type(screen.getByLabelText("Guest last name"), "Perez");
		await user.type(screen.getByLabelText("Document type"), "dni");
		await user.type(screen.getByLabelText("Document number"), "789");
		await user.click(screen.getByRole("button", { name: "Create guest" }));

		await waitFor(() => {
			expect(
				screen.getByText("Could not create guest. Check required fields."),
			).toBeInTheDocument();
		});
		expect(
			screen.getByRole("heading", { name: "Create reservation" }),
		).toBeInTheDocument();
		expect(mockGuestCreate).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				first_name: "Carlos",
				last_name: "Perez",
				document_type: "dni",
				document_number: "789",
			}),
		);
	});

	it("filters rooms by room type, keeps unassigned option, and clears stale room", async () => {
		mockAuth(receptionistAuthState);
		mockLoaded();
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);

		const roomType = screen.getByLabelText("Room type");
		const room = screen.getByLabelText("Room (optional)");

		expect(
			screen.getByRole("option", { name: "No room assigned" }),
		).toBeInTheDocument();

		await user.selectOptions(roomType, "rt-1");
		expect(
			screen.getByRole("option", { name: "101 · available" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("option", { name: "201 · occupied" }),
		).not.toBeInTheDocument();

		await user.selectOptions(room, "room-1");
		expect(room).toHaveValue("room-1");

		await user.selectOptions(roomType, "rt-2");
		expect(room).toHaveValue("");
		expect(
			screen.getByRole("option", { name: "201 · occupied" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("option", { name: "101 · available" }),
		).not.toBeInTheDocument();
	});

	it("submits assigned and unassigned room payloads and shows submit-time conflict error", async () => {
		const hook = {
			...baseHook(),
			create: vi
				.fn()
				.mockRejectedValueOnce({
					code: "validation-error",
					message: "conflict",
				})
				.mockResolvedValueOnce(undefined),
		};
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		await user.selectOptions(screen.getByLabelText("Primary guest"), "guest-1");
		await user.type(screen.getByLabelText("Check-in date"), "2026-10-01");
		await user.type(screen.getByLabelText("Check-out date"), "2026-10-03");
		await user.selectOptions(screen.getByLabelText("Room type"), "rt-2");
		await user.selectOptions(
			screen.getByLabelText("Room (optional)"),
			"room-2",
		);
		await user.click(
			screen.getAllByRole("button", { name: "Create reservation" })[1],
		);

		await waitFor(() => {
			expect(
				screen.getByText("Check required fields and dates before saving."),
			).toBeInTheDocument();
		});
		expect(hook.create).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ room_id: "room-2", room_type_id: "rt-2" }),
		);

		await user.selectOptions(screen.getByLabelText("Room (optional)"), "");
		await user.click(
			screen.getAllByRole("button", { name: "Create reservation" })[1],
		);
		expect(hook.create).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ room_id: null }),
		);
	});

	it("supports adding and removing reservation item rows", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		expect(screen.getAllByText(/Item \d/)).toHaveLength(1);
		expect(
			screen.queryByRole("button", { name: "Remove item" }),
		).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Add item" }));
		expect(screen.getAllByText(/Item \d/)).toHaveLength(2);
		const removeButtons = screen.getAllByRole("button", {
			name: "Remove item",
		});
		await user.click(removeButtons[1]);
		expect(screen.getAllByText(/Item \d/)).toHaveLength(1);
	});

	it("clears incompatible selected room when item room type changes", async () => {
		mockAuth(receptionistAuthState);
		mockLoaded();
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		await user.click(screen.getByRole("button", { name: "Add item" }));

		const roomTypes = screen.getAllByLabelText("Room type");
		const roomsByRow = screen.getAllByLabelText("Room (optional)");

		await user.selectOptions(roomTypes[1]!, "rt-1");
		await user.selectOptions(roomsByRow[1]!, "room-1");
		expect(roomsByRow[1]).toHaveValue("room-1");
		await user.selectOptions(roomTypes[1]!, "rt-2");
		expect(roomsByRow[1]).toHaveValue("");
	});

	it("prevents selecting the same assigned room in multiple item rows", async () => {
		mockAuth(receptionistAuthState);
		mockLoaded();
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		await user.selectOptions(screen.getAllByLabelText("Room type")[0]!, "rt-1");
		await user.selectOptions(
			screen.getAllByLabelText("Room (optional)")[0]!,
			"room-1",
		);
		await user.click(screen.getByRole("button", { name: "Add item" }));
		await user.selectOptions(screen.getAllByLabelText("Room type")[1]!, "rt-1");

		const secondRowRoomOptions = Array.from(
			screen
				.getAllByLabelText("Room (optional)")[1]!
				.querySelectorAll("option"),
		).map((option) => option.textContent);
		expect(secondRowRoomOptions).not.toContain("101 · available");
	});

	it("submits create payload with multiple reservation items", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);
		await user.selectOptions(screen.getByLabelText("Primary guest"), "guest-1");
		await user.type(screen.getByLabelText("Check-in date"), "2026-10-01");
		await user.type(screen.getByLabelText("Check-out date"), "2026-10-03");
		await user.selectOptions(screen.getAllByLabelText("Room type")[0]!, "rt-1");
		await user.selectOptions(
			screen.getAllByLabelText("Room (optional)")[0]!,
			"room-1",
		);
		await user.click(screen.getByRole("button", { name: "Add item" }));
		await user.selectOptions(screen.getAllByLabelText("Room type")[1]!, "rt-2");
		fireEvent.change(screen.getAllByLabelText("Guest count")[1]!, {
			target: { value: "1" },
		});

		await user.click(
			screen.getAllByRole("button", { name: "Create reservation" })[1],
		);
		expect(hook.create).toHaveBeenCalledWith(
			expect.objectContaining({
				reservation_items: [
					expect.objectContaining({
						room_type_id: "rt-1",
						room_id: "room-1",
						guest_count: 1,
					}),
					expect.objectContaining({
						room_type_id: "rt-2",
						room_id: null,
						guest_count: 1,
					}),
				],
			}),
		);
	});

	it("shows safe selector-load error and allows quick-create with empty guest search", async () => {
		const hook = baseHook();
		mockAuth(receptionistAuthState);
		mockUseReservations.mockReturnValue(hook);
		mockGuestList.mockResolvedValueOnce({
			ok: true,
			data: { guests: [], page: 1, pageSize: 20, total: 0 },
		});
		mockRoomTypeList.mockResolvedValueOnce({
			ok: true,
			data: [],
		});
		const user = userEvent.setup();
		await renderPage();
		await user.click(
			screen.getByRole("button", { name: "Create reservation" }),
		);

		expect(
			screen.getByRole("option", { name: "All guests" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "All rooms" }),
		).toBeInTheDocument();

		await user.clear(screen.getByLabelText("Search guest"));
		await user.click(screen.getByRole("button", { name: "Register guest" }));
		expect(screen.getByLabelText("Guest first name")).toBeInTheDocument();
	});

	it("renders Spanish selector copy", async () => {
		await i18n.changeLanguage("es");
		mockAuth(receptionistAuthState);
		mockLoaded();
		const user = userEvent.setup();
		await renderPage();

		await user.click(screen.getByRole("button", { name: "Crear reserva" }));
		expect(screen.getByLabelText("Huésped principal")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Registrar huésped" }),
		).toBeInTheDocument();
	});

	it("icon-only actions provide accessible labels", async () => {
		mockAuth(receptionistAuthState);
		mockLoaded();
		await renderPage();

		const cancelButton = screen.getByRole("button", {
			name: "Cancel reservation RES-0001",
		});
		expect(cancelButton).toBeInTheDocument();
		await userEvent.click(cancelButton);
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "Confirm cancellation" }),
			).toBeInTheDocument();
		});
	});
});
