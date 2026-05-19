// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ModuleCard } from "../ModuleCard";

afterEach(cleanup);

describe("ModuleCard", () => {
	it("renders caller-provided title and description", () => {
		render(<ModuleCard description="Reusable summary" title="Shared module" />);

		expect(screen.getByRole("article")).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Shared module" })).toBeTruthy();
		expect(screen.getByText("Reusable summary")).toBeTruthy();
	});

	it("renders optional eyebrow, icon, and action slots", () => {
		render(
			<ModuleCard
				action={<button type="button">Open</button>}
				eyebrow="Foundation"
				icon={<span aria-label="Generic icon" role="img" />}
				title="Configurable card"
			/>,
		);

		expect(screen.getByText("Foundation")).toBeTruthy();
		expect(screen.getByRole("img", { name: "Generic icon" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Open" })).toBeTruthy();
	});
});
