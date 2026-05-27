// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Modal } from "../Modal";

afterEach(cleanup);

describe("Modal", () => {
	it("renders nothing when isOpen=false", () => {
		const { container } = render(
			<Modal isOpen={false} onClose={() => {}} title="Test">
				<p>Content</p>
			</Modal>,
		);

		expect(container.innerHTML).toBe("");
	});

	it("renders title and children when isOpen=true", () => {
		render(
			<Modal isOpen={true} onClose={() => {}} title="Test Title">
				<p>Modal content here</p>
			</Modal>,
		);

		expect(
			screen.getByRole("heading", { name: "Test Title" }),
		).toBeInTheDocument();
		expect(screen.getByText("Modal content here")).toBeInTheDocument();
	});

	it("calls onClose when Escape key is pressed", async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={onClose} title="Test">
				<p>Content</p>
			</Modal>,
		);

		await user.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onClose when backdrop overlay is clicked", async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={onClose} title="Test">
				<p>Content</p>
			</Modal>,
		);

		const overlay = screen.getByTestId("modal-overlay");
		await user.click(overlay);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("does NOT import anything from features/auth (domain-neutral boundary check)", async () => {
		const modalModule = await import("../Modal");
		const modalSource = modalModule.Modal.toString();

		expect(modalSource).not.toContain("features/auth");
	});

	it("clicking inside the modal content does NOT trigger onClose", async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();

		render(
			<Modal isOpen={true} onClose={onClose} title="Test">
				<p>Clickable content</p>
			</Modal>,
		);

		const content = screen.getByText("Clickable content");
		await user.click(content);

		expect(onClose).not.toHaveBeenCalled();
	});
});
