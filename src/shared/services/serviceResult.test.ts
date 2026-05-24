import { describe, expect, it } from "vitest";

import {
	executeServiceQuery,
	normalizeServiceError,
	serviceFailure,
	serviceSuccess,
	type ServiceError,
} from "./serviceResult";

const secretPayload = {
	message:
		"backend failed with access_token=secret-token jwt=secret-jwt anon_key=secret-anon private_key=secret-private SELECT * FROM profiles",
	access_token: "secret-token",
	jwt: "secret-jwt",
	anon_key: "secret-anon",
};

function expectNoSecretText(value: unknown) {
	const serialized = JSON.stringify(value);
	expect(serialized).not.toContain("secret-token");
	expect(serialized).not.toContain("secret-jwt");
	expect(serialized).not.toContain("secret-anon");
	expect(serialized).not.toContain("secret-private");
	expect(serialized).not.toContain("SELECT * FROM profiles");
}

describe("service result foundation", () => {
	it("returns typed success results", () => {
		expect(serviceSuccess({ id: "record-1" })).toEqual({
			ok: true,
			data: { id: "record-1" },
		});
	});

	it("returns safe default failures", () => {
		expect(serviceFailure("backend-error")).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
	});

	it("allows trusted local failure messages", () => {
		expect(serviceFailure("validation-error", "Name is required.")).toEqual({
			ok: false,
			error: { code: "validation-error", message: "Name is required." },
		});
	});

	it("normalizes unknown errors without exposing raw backend payloads", () => {
		const error = normalizeServiceError(secretPayload);

		expect(error).toEqual({
			code: "unknown-error",
			message: "An unexpected service error occurred.",
		});
		expectNoSecretText(error);
	});

	it("preserves trusted local service errors", () => {
		const localError: ServiceError = {
			code: "property-scope-error",
			message: "A valid property scope is required.",
		};

		expect(normalizeServiceError(localError)).toEqual(localError);
	});

	it("does not preserve untrusted service-error-shaped messages", () => {
		const error = normalizeServiceError({
			code: "backend-error",
			message: "access_token=secret-token",
		});

		expect(error).toEqual({
			code: "backend-error",
			message: "The service request could not be completed.",
		});
		expectNoSecretText(error);
	});
});

describe("service query execution", () => {
	it("maps query data to success", async () => {
		await expect(
			executeServiceQuery(
				Promise.resolve({ data: { id: "record-1" }, error: null }),
			),
		).resolves.toEqual({ ok: true, data: { id: "record-1" } });
	});

	it("maps null data to not-found", async () => {
		await expect(
			executeServiceQuery(Promise.resolve({ data: null, error: null })),
		).resolves.toEqual({
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		});
	});

	it("maps backend errors to safe backend failures", async () => {
		const result = await executeServiceQuery(
			Promise.resolve({ data: null, error: secretPayload }),
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
		expectNoSecretText(result);
	});

	it("maps thrown query failures to safe unknown failures", async () => {
		const result = await executeServiceQuery(Promise.reject(secretPayload));

		expect(result).toEqual({
			ok: false,
			error: {
				code: "unknown-error",
				message: "An unexpected service error occurred.",
			},
		});
		expectNoSecretText(result);
	});
});
