// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "../Button";

afterEach(cleanup);

describe("Button", () => {
	it("renders an accessible native button", () => {
		render(<Button>Save changes</Button>);

		expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
	});

	it("calls the click handler when enabled", () => {
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Continue</Button>);
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("does not call the click handler when disabled", () => {
		const onClick = vi.fn();

		render(
			<Button disabled onClick={onClick}>
				Continue
			</Button>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));

		expect(onClick).not.toHaveBeenCalled();
	});

	it("uses loading as a busy unavailable state", () => {
		const onClick = vi.fn();

		render(
			<Button isLoading onClick={onClick}>
				Saving
			</Button>,
		);
		const button = screen.getByRole("button", { name: "Saving" });
		fireEvent.click(button);

		expect(button.getAttribute("aria-busy")).toBe("true");
		expect(button).toHaveProperty("disabled", true);
		expect(onClick).not.toHaveBeenCalled();
	});

	it("supports variant, size, and full width options", () => {
		render(
			<Button fullWidth size="lg" variant="secondary">
				Open details
			</Button>,
		);

		expect(screen.getByRole("button", { name: "Open details" })).toBeTruthy();
	});
});
