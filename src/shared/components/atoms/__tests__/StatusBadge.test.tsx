// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusBadge } from "../StatusBadge";

afterEach(cleanup);

describe("StatusBadge", () => {
	it("renders caller-provided arbitrary labels", () => {
		render(<StatusBadge label="Ready for review" />);

		expect(screen.getByText("Ready for review")).toBeTruthy();
	});

	it("supports generic visual tones without domain mappings", () => {
		render(<StatusBadge label="Generic warning" tone="warning" />);

		expect(screen.getByText("Generic warning")).toBeTruthy();
	});

	it("supports compact and regular sizes", () => {
		render(<StatusBadge label="Small badge" size="sm" />);

		expect(screen.getByText("Small badge")).toBeTruthy();
	});
});
