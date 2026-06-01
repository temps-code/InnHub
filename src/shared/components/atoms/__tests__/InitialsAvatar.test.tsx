// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InitialsAvatar } from "../InitialsAvatar";

afterEach(cleanup);

describe("InitialsAvatar", () => {
	it("renders caller-provided initials with an accessible label", () => {
		render(<InitialsAvatar ariaLabel="Guest avatar" initials="JD" />);

		expect(screen.getByLabelText("Guest avatar")).toBeInTheDocument();
		expect(screen.getByText("JD")).toBeInTheDocument();
	});

	it("falls back to initials derived from name when initials are omitted", () => {
		render(<InitialsAvatar ariaLabel="Profile avatar" name="James Davis" />);

		expect(screen.getByText("JD")).toBeInTheDocument();
	});

	it("falls back to a generic marker when no name or initials are provided", () => {
		render(<InitialsAvatar ariaLabel="Unknown avatar" />);

		expect(screen.getByText("?")).toBeInTheDocument();
	});
});
