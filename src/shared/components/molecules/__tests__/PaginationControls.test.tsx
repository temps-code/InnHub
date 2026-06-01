// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PaginationControls } from "../PaginationControls";

afterEach(cleanup);

describe("PaginationControls", () => {
	it("renders pagination summary and current page", () => {
		render(
			<PaginationControls
				currentPage={2}
				onPageChange={() => {}}
				pageSize={20}
				totalItems={1248}
			/>,
		);

		expect(screen.getByText("Page 2 of 63")).toBeInTheDocument();
		expect(screen.getByText("Showing 21-40 of 1248")).toBeInTheDocument();
	});

	it("disables previous on first page and next on last page", () => {
		const { rerender } = render(
			<PaginationControls
				currentPage={1}
				onPageChange={() => {}}
				pageSize={20}
				totalItems={30}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Previous page" }),
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "Next page" }),
		).not.toBeDisabled();

		rerender(
			<PaginationControls
				currentPage={2}
				onPageChange={() => {}}
				pageSize={20}
				totalItems={30}
			/>,
		);

		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
	});

	it("calls onPageChange for previous and next actions", async () => {
		const user = userEvent.setup();
		const onPageChange = vi.fn();

		render(
			<PaginationControls
				currentPage={2}
				onPageChange={onPageChange}
				pageSize={20}
				totalItems={60}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Previous page" }));
		await user.click(screen.getByRole("button", { name: "Next page" }));

		expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
		expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
	});

	it("renders zero-state summary safely", () => {
		render(
			<PaginationControls
				currentPage={1}
				onPageChange={() => {}}
				pageSize={20}
				totalItems={0}
			/>,
		);

		expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
		expect(screen.getByText("Showing 0 of 0")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Previous page" }),
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
	});
});
