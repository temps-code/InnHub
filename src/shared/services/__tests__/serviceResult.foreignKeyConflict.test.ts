import { describe, expect, it } from "vitest";

import type { ServiceErrorCode } from "../serviceResult";
import { serviceFailure } from "../serviceResult";

describe("ServiceErrorCode — foreign-key-conflict", () => {
	it("is assignable to ServiceErrorCode", () => {
		const code: ServiceErrorCode = "foreign-key-conflict";
		expect(code).toBe("foreign-key-conflict");
	});

	it("serviceFailure returns the code in the error object", () => {
		const result = serviceFailure(
			"foreign-key-conflict",
			"A room type is still referenced by rooms.",
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "foreign-key-conflict",
				message: "A room type is still referenced by rooms.",
			},
		});
	});

	it("serviceFailure uses the default message when none is provided", () => {
		const result = serviceFailure("foreign-key-conflict");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe("foreign-key-conflict");
			expect(result.error.message.length).toBeGreaterThan(0);
		}
	});

	it("does not break existing error codes", () => {
		const codes: ServiceErrorCode[] = [
			"configuration-error",
			"backend-error",
			"validation-error",
			"property-scope-error",
			"not-found",
			"foreign-key-conflict",
			"unknown-error",
		];

		for (const code of codes) {
			const result = serviceFailure(code);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe(code);
			}
		}
	});
});
