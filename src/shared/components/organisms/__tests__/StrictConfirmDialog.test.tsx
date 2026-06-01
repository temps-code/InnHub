// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StrictConfirmDialog } from "../StrictConfirmDialog";

afterEach(cleanup);

describe("StrictConfirmDialog", () => {
	it("disables confirm until typed phrase matches exactly", async () => {
		const user = userEvent.setup();

		render(
			<StrictConfirmDialog
				confirmPhrase="DELETE"
				isOpen={true}
				onCancel={() => {}}
				onConfirm={() => {}}
				title="Confirm purge"
			/>,
		);

		const confirmButton = screen.getByRole("button", { name: "Confirm" });
		expect(confirmButton).toBeDisabled();

		await user.type(screen.getByLabelText("Confirmation phrase"), "delete");
		expect(confirmButton).toBeDisabled();

		await user.clear(screen.getByLabelText("Confirmation phrase"));
		await user.type(screen.getByLabelText("Confirmation phrase"), "DELETE");
		expect(confirmButton).not.toBeDisabled();
	});

	it("calls onConfirm when phrase matches and confirm is clicked", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();

		render(
			<StrictConfirmDialog
				confirmPhrase="James Davis"
				isOpen={true}
				onCancel={() => {}}
				onConfirm={onConfirm}
				title="Confirm purge"
			/>,
		);

		await user.type(
			screen.getByLabelText("Confirmation phrase"),
			"James Davis",
		);
		await user.click(screen.getByRole("button", { name: "Confirm" }));

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("renders provided error message", () => {
		render(
			<StrictConfirmDialog
				confirmPhrase="DELETE"
				error="Blocked by reservation references"
				isOpen={true}
				onCancel={() => {}}
				onConfirm={() => {}}
				title="Confirm purge"
			/>,
		);

		expect(
			screen.getByText("Blocked by reservation references"),
		).toBeInTheDocument();
	});

	it("keeps confirm disabled while processing even when phrase matches", async () => {
		const user = userEvent.setup();

		render(
			<StrictConfirmDialog
				confirmPhrase="DELETE"
				isOpen={true}
				isProcessing={true}
				onCancel={() => {}}
				onConfirm={() => {}}
				title="Confirm purge"
			/>,
		);

		await user.type(screen.getByLabelText("Confirmation phrase"), "DELETE");
		expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
	});
});
