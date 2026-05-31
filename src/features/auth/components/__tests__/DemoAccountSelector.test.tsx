// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import { i18n } from "../../../../shared/i18n/config";
import { DemoAccountSelector } from "../DemoAccountSelector";

afterEach(cleanup);

function renderSelector(onSelect = vi.fn()) {
	render(
		<I18nextProvider i18n={i18n}>
			<DemoAccountSelector onSelect={onSelect} />
		</I18nextProvider>,
	);
	return onSelect;
}

describe("DemoAccountSelector", () => {
	it("renders property controls, defaults to Tarija, and submits Tarija Admin", async () => {
		const onSelect = renderSelector();
		const user = userEvent.setup();

		expect(
			screen.getByRole("button", { name: /hotel tarija/i }),
		).toHaveAttribute("aria-pressed", "true");
		expect(
			screen.getByRole("button", { name: /hostal los chapacos/i }),
		).toHaveAttribute("aria-pressed", "false");
		for (const role of [
			"Administrator",
			"Manager",
			"Receptionist",
			"Housekeeping",
			"Maintenance",
		]) {
			expect(screen.getByText(role)).toBeInTheDocument();
		}

		await user.click(screen.getByRole("button", { name: /administrator/i }));
		expect(onSelect).toHaveBeenCalledWith({
			email: "admin+tarija-admin@innhub.dev",
			password: "Demo123!",
		});
	});

	it("selects Hostal Los Chapacos and submits only LoginCredentials", async () => {
		const onSelect = renderSelector();
		const user = userEvent.setup();

		await user.click(
			screen.getByRole("button", { name: /hostal los chapacos/i }),
		);
		expect(
			screen.getByRole("button", { name: /hostal los chapacos/i }),
		).toHaveAttribute("aria-pressed", "true");
		await user.click(screen.getByRole("button", { name: /manager/i }));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith({
			email: "admin+loschapacos-manager@innhub.dev",
			password: "Demo123!",
		});
		expect(onSelect).not.toHaveBeenCalledWith({
			email: "admin+tarija-manager@innhub.dev",
			password: "Demo123!",
		});
		expect(onSelect.mock.calls[0][0]).not.toHaveProperty("propertyId");
	});
});
