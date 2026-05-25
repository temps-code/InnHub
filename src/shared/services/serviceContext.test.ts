import { describe, expect, it } from "vitest";

import { createServiceContext, withServiceContext } from "./serviceContext";
import { serviceFailure, serviceSuccess } from "./serviceResult";

describe("service context foundation", () => {
	it("creates service context from a valid session-like property id", () => {
		expect(createServiceContext({ propertyId: " property-1 " })).toEqual({
			ok: true,
			data: { propertyScope: { propertyId: "property-1" } },
		});
	});

	it.each([
		null,
		undefined,
		{},
		{ propertyId: "   " },
	])("returns a safe property-scope error for invalid session %#", (session) => {
		expect(createServiceContext(session)).toEqual({
			ok: false,
			error: {
				code: "property-scope-error",
				message: "A valid property scope is required.",
			},
		});
	});

	it("does not run operations when property scope is invalid", async () => {
		let called = false;
		const result = await withServiceContext(null, async () => {
			called = true;
			return serviceSuccess("should-not-run");
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "property-scope-error",
				message: "A valid property scope is required.",
			},
		});
		expect(called).toBe(false);
	});

	it("passes property scope into valid operations", async () => {
		const result = await withServiceContext(
			{ propertyId: "property-1" },
			async (context) => serviceSuccess(context.propertyScope.propertyId),
		);

		expect(result).toEqual({ ok: true, data: "property-1" });
	});

	it("preserves operation failure results", async () => {
		const result = await withServiceContext(
			{ propertyId: "property-1" },
			async () =>
				serviceFailure(
					"validation-error",
					"Operation-specific validation failed.",
				),
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "Operation-specific validation failed.",
			},
		});
	});
});
