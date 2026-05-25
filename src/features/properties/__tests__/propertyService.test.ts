import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";
import type { Property } from "../types";

// ── Fake query builder ──────────────────────────────────────────────────
// Implements both EqQuery (for scopeCurrentPropertyQuery) and PromiseLike
// (for executeServiceQuery), so we can wire it through the service's
// injected from() dependency without needing the real InsForge SDK.

type QueryResult<T> = { readonly data: T | null; readonly error: unknown };

class FakePropertyQuery<T> implements PromiseLike<QueryResult<T>> {
	readonly eqCalls: Array<{ column: string; value: string }> = [];
	readonly result: QueryResult<T>;

	constructor(result: QueryResult<T>) {
		this.result = result;
	}

	eq(column: string, value: string): this {
		this.eqCalls.push({ column, value });
		return this;
	}

	then<TResult>(
		onfulfilled?: (value: QueryResult<T>) => TResult | PromiseLike<TResult>,
	): Promise<TResult> {
		return Promise.resolve(this.result).then(
			onfulfilled as (v: QueryResult<T>) => TResult,
		);
	}
}

/** Returns a fake `from(table)` function — the dependency that the service
 *  accepts as `deps.from`. */
function fakeFrom<T>(result: QueryResult<T>) {
	return () => ({
		select: () => new FakePropertyQuery(result),
		update: () => new FakePropertyQuery(result),
	});
}

function fakePropertyFrom<T>({
	selectResult,
	updateResult,
}: {
	readonly selectResult: QueryResult<T>;
	readonly updateResult: QueryResult<T>;
}) {
	return () => ({
		select: () => new FakePropertyQuery(selectResult),
		update: () => new FakePropertyQuery(updateResult),
	});
}

// ── Test helpers ─────────────────────────────────────────────────────────

const aProperty: Property = {
	id: "property-1",
	slug: "my-hotel",
	name: "My Hotel",
	business_type: "hotel",
	timezone: "America/Argentina/Buenos_Aires",
	currency: "ARS",
	address: "Av. Corrientes 1234",
	phone: "+54 11 5555-1234",
	email: "info@myhotel.test",
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
};

const aSession: AppSession = {
	user: { id: "auth-user-1", email: "admin@innhub.test" },
	profile: {
		id: "profile-1",
		authUserId: "auth-user-1",
		propertyId: "property-1",
		role: "administrator",
		status: "active",
	},
	propertyId: "property-1",
};

async function expectSecretFree(value: unknown) {
	const serialized = JSON.stringify(value);
	expect(serialized).not.toContain("secret-token");
	expect(serialized).not.toContain("secret-jwt");
	expect(serialized).not.toContain("secret-anon");
}

// ── The actual tests ─────────────────────────────────────────────────────

describe("getCurrentProperty", () => {
	it("returns property-scope-error when session is null", async () => {
		const { getCurrentProperty } = await import("../propertyService");

		const result = await getCurrentProperty(null, {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "property-scope-error",
				message: "A valid property scope is required.",
			},
		});
	});

	it("returns property data for a valid session", async () => {
		const { getCurrentProperty } = await import("../propertyService");

		const result = await getCurrentProperty(aSession, {
			from: fakeFrom({ data: aProperty, error: null }),
		});

		expect(result).toEqual({ ok: true, data: aProperty });
	});

	it("normalizes array responses from the backend to the first property", async () => {
		const { getCurrentProperty } = await import("../propertyService");

		const result = await getCurrentProperty(aSession, {
			from: fakeFrom({ data: [aProperty], error: null }),
		});

		expect(result).toEqual({ ok: true, data: aProperty });
	});

	it("returns not-found when the scoped backend array is empty", async () => {
		const { getCurrentProperty } = await import("../propertyService");

		const result = await getCurrentProperty(aSession, {
			from: fakeFrom({ data: [], error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		});
	});

	it("returns not-found when the query returns null data", async () => {
		const { getCurrentProperty } = await import("../propertyService");

		const result = await getCurrentProperty(aSession, {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		});
	});

	it("returns a safe backend-error without leaking raw error payloads", async () => {
		const { getCurrentProperty } = await import("../propertyService");

		const result = await getCurrentProperty(aSession, {
			from: fakeFrom({
				data: null,
				error: { message: "access_token=secret-token jwt=secret-jwt" },
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
		await expectSecretFree(result);
	});
});

describe("updateCurrentProperty", () => {
	const formData = {
		name: "My Updated Hotel",
		business_type: "hotel",
		timezone: "America/New_York",
		currency: "USD",
		address: "123 Main St",
		phone: "+1 555-1234",
		email: "info@updated.test",
	};

	it("returns property-scope-error when session is null", async () => {
		const { updateCurrentProperty } = await import("../propertyService");

		const result = await updateCurrentProperty(null, formData, {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "property-scope-error",
				message: "A valid property scope is required.",
			},
		});
	});

	it("returns updated property data after a successful update", async () => {
		const { updateCurrentProperty } = await import("../propertyService");

		const updated = { ...aProperty, ...formData };
		const result = await updateCurrentProperty(aSession, formData, {
			from: fakeFrom({ data: updated, error: null }),
		});

		expect(result).toEqual({ ok: true, data: updated });
	});

	it("normalizes array responses after a successful update", async () => {
		const { updateCurrentProperty } = await import("../propertyService");

		const updated = { ...aProperty, ...formData };
		const result = await updateCurrentProperty(aSession, formData, {
			from: fakeFrom({ data: [updated], error: null }),
		});

		expect(result).toEqual({ ok: true, data: updated });
	});

	it("re-reads the property when a successful update returns no row payload", async () => {
		const { updateCurrentProperty } = await import("../propertyService");

		const updated = { ...aProperty, ...formData };
		const result = await updateCurrentProperty(aSession, formData, {
			from: fakePropertyFrom({
				selectResult: { data: [updated], error: null },
				updateResult: { data: null, error: null },
			}),
		});

		expect(result).toEqual({ ok: true, data: updated });
	});

	it("returns a safe backend-error on update failure", async () => {
		const { updateCurrentProperty } = await import("../propertyService");

		const result = await updateCurrentProperty(aSession, formData, {
			from: fakeFrom({
				data: null,
				error: { message: "jwt=secret-jwt update failed" },
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
		await expectSecretFree(result);
	});
});
