// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "../../../shared/i18n/config";
import type { AuthSessionState } from "../../auth/types";
import type { Guest, GuestListResult } from "../types";

const { mockUseGuests, mockUseAuthSession } = vi.hoisted(() => ({
	mockUseGuests: vi.fn(),
	mockUseAuthSession: vi.fn(),
}));

vi.mock("../useGuests", () => ({
	useGuests: mockUseGuests,
}));

vi.mock("../../auth/hooks/useAuthSession", () => ({
	useAuthSession: mockUseAuthSession,
}));

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

const guestA: Guest = {
	id: "guest-1",
	property_id: "property-1",
	first_name: "James",
	last_name: "Davis",
	document_type: "passport",
	document_number: "A1234567",
	email: "james@example.com",
	phone: "+1 555-123",
	notes: "Quiet room",
	created_at: "2026-01-01T00:00:00Z",
	updated_at: "2026-01-01T00:00:00Z",
	deleted_at: null,
};

const guestB: Guest = {
	...guestA,
	id: "guest-2",
	first_name: "Sarah",
	last_name: "Martinez",
	document_number: "B222",
	email: "sarah@example.com",
	notes: null,
};

const loadedResult: GuestListResult = {
	guests: [guestA, guestB],
	page: 1,
	pageSize: 20,
	total: 40,
};

function mockAuth(state: AuthSessionState) {
	mockUseAuthSession.mockReturnValue({
		state,
		login: vi.fn(),
		logout: vi.fn(),
		refresh: vi.fn(),
	});
}

function mockLoaded(overrides?: Partial<ReturnType<typeof baseHook>>) {
	mockUseGuests.mockReturnValue({ ...baseHook(), ...overrides });
}

function baseHook() {
	return {
		state: { status: "loaded", result: loadedResult } as const,
		showTrash: false,
		params: { page: 1, pageSize: 20, search: "", activity: "all" as const },
		setSearch: vi.fn(),
		setActivity: vi.fn(),
		setPage: vi.fn(),
		toggleTrash: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		restore: vi.fn(),
		purge: vi.fn(),
		refresh: vi.fn(),
	};
}

async function renderPage() {
	const { GuestsPage } = await import("../GuestsPage");
	return render(
		<I18nextProvider i18n={i18n}>
			<GuestsPage />
		</I18nextProvider>,
	);
}

describe("GuestsPage", () => {
	beforeEach(async () => {
		await i18n.changeLanguage("en");
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("shows loading, error, and empty states safely", async () => {
		mockAuth(adminAuthState);
		mockUseGuests.mockReturnValue({
			...baseHook(),
			state: { status: "loading" },
		});
		await renderPage();
		expect(screen.getByText("Loading guests...")).toBeInTheDocument();

		cleanup();
		mockAuth(adminAuthState);
		mockUseGuests.mockReturnValue({
			...baseHook(),
			state: {
				status: "error",
				error: { code: "backend-error", message: "secret" },
			},
		});
		await renderPage();
		expect(screen.getByText("Unable to load guests.")).toBeInTheDocument();
		expect(document.body.textContent).not.toContain("secret");

		cleanup();
		mockAuth(adminAuthState);
		mockLoaded({
			state: {
				status: "loaded",
				result: { ...loadedResult, guests: [], total: 0 },
			},
		});
		await renderPage();
		expect(screen.getByText("No guests found.")).toBeInTheDocument();

		cleanup();
		mockAuth(adminAuthState);
		mockLoaded({
			params: {
				page: 1,
				pageSize: 20,
				search: "james",
				activity: "all",
			},
			state: {
				status: "loaded",
				result: { ...loadedResult, guests: [], total: 10 },
			},
		});
		await renderPage();
		expect(
			screen.getByText("No guests match the current search or filters."),
		).toBeInTheDocument();
	});

	it("renders prototype-aligned layout without duplicate internal heading", async () => {
		mockAuth(adminAuthState);
		mockLoaded();
		await renderPage();

		expect(
			screen.queryByRole("heading", { name: "Guests", level: 2 }),
		).not.toBeInTheDocument();
		expect(screen.getByPlaceholderText("Search guests")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Add guest" }),
		).toBeInTheDocument();
		expect(screen.getByText("Total guests")).toBeInTheDocument();
		expect(screen.getByText("Returning guests")).toBeInTheDocument();
		expect(screen.getByText("Active stays")).toBeInTheDocument();
		expect(screen.getByText("Pending invoices")).toBeInTheDocument();
		expect(screen.getByTestId("metric-icon-total-guests")).toBeInTheDocument();
		expect(
			screen.getByTestId("metric-icon-returning-guests"),
		).toBeInTheDocument();
		expect(screen.getByTestId("metric-icon-active-stays")).toBeInTheDocument();
		expect(
			screen.getByTestId("metric-icon-pending-invoices"),
		).toBeInTheDocument();
		expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(3);
		expect(screen.queryByText("Guest profile")).not.toBeInTheDocument();
		expect(screen.queryByText("With email")).not.toBeInTheDocument();
		expect(screen.queryByText("With phone")).not.toBeInTheDocument();
		expect(screen.queryByText("With notes")).not.toBeInTheDocument();
		expect(document.querySelector("article.border-sky-200")).toBeNull();
		expect(document.querySelector("article.border-emerald-200")).toBeNull();
		expect(document.querySelector("article.border-amber-200")).toBeNull();

		const table = screen.getByRole("table", { name: "Guests table" });
		expect(table.className).not.toContain("min-w-[980px]");
		expect(within(table).getByText("James Davis")).toBeInTheDocument();
		expect(within(table).getByText("A1234567")).toBeInTheDocument();
		expect(screen.queryByText("Quiet room")).not.toBeInTheDocument();
		expect(screen.queryByText("Recent stays")).not.toBeInTheDocument();
		expect(screen.queryByText("Billing summary")).not.toBeInTheDocument();
	});

	it("keeps search/filter actions aligned with trash/create actions in one toolbar row", async () => {
		mockAuth(adminAuthState);
		mockLoaded();
		await renderPage();

		const toolbar = screen.getByTestId("guests-toolbar");
		expect(
			within(toolbar).getByTestId("guests-search-icon"),
		).toBeInTheDocument();
		expect(
			within(toolbar).getByTestId("guests-trash-icon"),
		).toBeInTheDocument();
		expect(within(toolbar).getByTestId("guests-add-icon")).toBeInTheDocument();
		expect(
			within(toolbar).getByPlaceholderText("Search guests"),
		).toBeInTheDocument();
		expect(within(toolbar).getByLabelText("Activity")).toBeInTheDocument();
		expect(
			within(toolbar).getByRole("button", { name: "View Trash" }),
		).toBeInTheDocument();
		expect(
			within(toolbar).getByRole("button", { name: "Add guest" }),
		).toBeInTheDocument();

		const content = screen.getByTestId("guests-content");
		expect(content.className).toContain("w-full");
		expect(content.className).toContain("max-w-none");
	});

	it("keeps table actions readable with horizontal overflow support", async () => {
		mockAuth(adminAuthState);
		mockLoaded();
		await renderPage();

		const tableViewport = screen.getByTestId("guests-table-viewport");
		expect(tableViewport.className).toContain("overflow-x-auto");
		expect(
			screen.getByRole("table", { name: "Guests table" }).className,
		).toContain("w-full");
	});

	it("supports search and pagination actions through hook API", async () => {
		const hook = baseHook();
		mockAuth(adminAuthState);
		mockUseGuests.mockReturnValue(hook);
		const user = userEvent.setup();
		await renderPage();

		fireEvent.change(screen.getByPlaceholderText("Search guests"), {
			target: { value: "james" },
		});
		expect(hook.setSearch).toHaveBeenLastCalledWith("james");

		await user.click(screen.getByRole("button", { name: "Next page" }));
		expect(hook.setPage).toHaveBeenCalledWith(2);
	});

	it("toggles trash mode and shows restore/purge controls", async () => {
		const restore = vi.fn();
		const purge = vi.fn();
		mockAuth(adminAuthState);
		mockLoaded({
			showTrash: true,
			restore,
			purge,
			state: {
				status: "loaded",
				result: {
					...loadedResult,
					guests: [{ ...guestA, deleted_at: "2026-01-02T00:00:00Z" }],
				},
			},
		});

		const user = userEvent.setup();
		await renderPage();

		expect(screen.getByText("Deleted at")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Restore" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Purge" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Restore" }));
		const restoreButtons = screen.getAllByRole("button", { name: "Restore" });
		await user.click(restoreButtons[restoreButtons.length - 1]!);
		await user.click(screen.getByRole("button", { name: "Purge" }));
		await user.type(screen.getByLabelText("Confirmation phrase"), "DELETE");
		await user.click(screen.getByRole("button", { name: "Confirm purge" }));
		await waitFor(() => expect(restore).toHaveBeenCalledWith("guest-1"));
		await waitFor(() => expect(purge).toHaveBeenCalledWith("guest-1"));
	});

	it("hides purge action for non-administrator roles", async () => {
		mockAuth(managerAuthState);
		mockLoaded({
			showTrash: true,
			state: {
				status: "loaded",
				result: {
					...loadedResult,
					guests: [{ ...guestA, deleted_at: "2026-01-02T00:00:00Z" }],
				},
			},
		});
		await renderPage();

		expect(screen.getByRole("button", { name: "Restore" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Purge" })).toBeNull();
	});

	it("shows localized strings in spanish", async () => {
		await i18n.changeLanguage("es");
		mockAuth(adminAuthState);
		mockLoaded();
		await renderPage();

		expect(
			screen.queryByRole("heading", { name: "Huéspedes" }),
		).not.toBeInTheDocument();
		expect(screen.getByPlaceholderText("Buscar huéspedes")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Agregar huésped" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Página anterior" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Página siguiente" }),
		).toBeInTheDocument();
	});
});
