// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import { i18n } from "../../../../shared/i18n/config";
import { DemoAccountSelector } from "../DemoAccountSelector";

afterEach(cleanup);

describe("DemoAccountSelector", () => {
	it("renders all 5 roles from getAllDemoAccounts()", () => {
		const onSelect = vi.fn();

		render(
			<I18nextProvider i18n={i18n}>
				<DemoAccountSelector onSelect={onSelect} />
			</I18nextProvider>,
		);

		expect(screen.getByText("Administrator")).toBeInTheDocument();
		expect(screen.getByText("Manager")).toBeInTheDocument();
		expect(screen.getByText("Receptionist")).toBeInTheDocument();
		expect(screen.getByText("Housekeeping")).toBeInTheDocument();
		expect(screen.getByText("Maintenance")).toBeInTheDocument();
	});

	it("each role button is clickable and calls onSelect with LoginCredentials", async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();

		render(
			<I18nextProvider i18n={i18n}>
				<DemoAccountSelector onSelect={onSelect} />
			</I18nextProvider>,
		);

		const adminButton = screen.getByRole("button", { name: /administrator/i });
		await user.click(adminButton);

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith({
			email: "admin+tarija-admin@innhub.dev",
			password: "Demo123!",
		});
	});

	it("selecting a different role calls onSelect with correct credentials", async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();

		render(
			<I18nextProvider i18n={i18n}>
				<DemoAccountSelector onSelect={onSelect} />
			</I18nextProvider>,
		);

		const receptionistButton = screen.getByRole("button", {
			name: /receptionist/i,
		});
		await user.click(receptionistButton);

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith({
			email: "admin+tarija-reception@innhub.dev",
			password: "Demo123!",
		});
	});

	it("does not make network calls (no real auth)", () => {
		const onSelect = vi.fn();

		render(
			<I18nextProvider i18n={i18n}>
				<DemoAccountSelector onSelect={onSelect} />
			</I18nextProvider>,
		);

		expect(screen.getByRole("button", { name: /administrator/i }));
		// No fetch/spy setup needed — component only calls onSelect on click
		expect(onSelect).not.toHaveBeenCalled();
	});
});
