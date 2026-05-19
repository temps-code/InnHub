// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MetricCard } from "../MetricCard";

afterEach(cleanup);

describe("MetricCard", () => {
	it("renders caller-provided metric label and value", () => {
		render(<MetricCard label="Generic metric" value="42" />);

		expect(screen.getByText("Generic metric")).toBeTruthy();
		expect(screen.getByText("42")).toBeTruthy();
	});

	it("renders optional helper and trend content without calculations", () => {
		render(
			<MetricCard
				helperText="Provided by caller"
				label="Review load"
				trend={<span>Stable</span>}
				value="12"
			/>,
		);

		expect(screen.getByText("Provided by caller")).toBeTruthy();
		expect(screen.getByText("Stable")).toBeTruthy();
	});

	it("supports generic visual tones", () => {
		render(<MetricCard label="Tone smoke" tone="info" value="Ready" />);

		expect(screen.getByText("Tone smoke")).toBeTruthy();
		expect(screen.getByText("Ready")).toBeTruthy();
	});
});
