// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageSection } from "../PageSection";

afterEach(cleanup);

describe("PageSection", () => {
	it("renders heading, description, actions, and children", () => {
		render(
			<PageSection
				actions={<button type="button">Create</button>}
				description="Manage reusable sections."
				eyebrow="Foundation"
				title="Shared UI"
			>
				<p>Section content</p>
			</PageSection>,
		);

		expect(screen.getByText("Foundation")).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Shared UI" })).toBeTruthy();
		expect(screen.getByText("Manage reusable sections.")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
		expect(screen.getByText("Section content")).toBeTruthy();
	});

	it("can label the section by title id", () => {
		render(<PageSection title="Metrics" titleId="metrics-title" />);

		const section = screen.getByRole("region", { name: "Metrics" });
		expect(section.getAttribute("aria-labelledby")).toBe("metrics-title");
	});

	it("supports quiet and panel variants", () => {
		render(<PageSection title="Quiet section" variant="quiet" />);

		expect(screen.getByRole("heading", { name: "Quiet section" })).toBeTruthy();
	});
});
