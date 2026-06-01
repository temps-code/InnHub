import { describe, expect, it } from "vitest";

import {
	rangesOverlap,
	validateAvailabilityDateOrder,
} from "../reservationAvailability";

describe("rangesOverlap", () => {
	it("returns true for exact overlap", () => {
		expect(
			rangesOverlap("2026-06-10", "2026-06-12", "2026-06-10", "2026-06-12"),
		).toBe(true);
	});

	it("returns true for partial overlap", () => {
		expect(
			rangesOverlap("2026-06-10", "2026-06-12", "2026-06-11", "2026-06-13"),
		).toBe(true);
	});

	it("returns false for same-day turnover boundaries", () => {
		expect(
			rangesOverlap("2026-06-10", "2026-06-12", "2026-06-12", "2026-06-15"),
		).toBe(false);
		expect(
			rangesOverlap("2026-06-12", "2026-06-15", "2026-06-10", "2026-06-12"),
		).toBe(false);
	});
});

describe("validateAvailabilityDateOrder", () => {
	it("returns error when checkOut <= checkIn", () => {
		expect(validateAvailabilityDateOrder("2026-06-10", "2026-06-10")).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "check-out-must-be-after-check-in",
			},
		});
	});

	it("returns success when date order is valid", () => {
		expect(validateAvailabilityDateOrder("2026-06-10", "2026-06-11")).toEqual({
			ok: true,
			data: undefined,
		});
	});
});
