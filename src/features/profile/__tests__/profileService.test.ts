import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";

// ── Fake query builder (same pattern as propertyService.test.ts) ────────

type QueryResult<T> = { readonly data: T | null; readonly error: unknown };

class FakeProfileQuery<T> implements PromiseLike<QueryResult<T>> {
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

function fakeFrom<T>(result: QueryResult<T>) {
	return () => ({
		select: () => new FakeProfileQuery(result),
		update: () => new FakeProfileQuery(result),
	});
}

// ── Test data ───────────────────────────────────────────────────────────

const aSession: AppSession = {
	user: { id: "auth-user-1", email: "admin@innhub.test" },
	profile: {
		id: "profile-1",
		authUserId: "auth-user-1",
		propertyId: "property-1",
		role: "administrator",
		status: "active",
		fullName: "Admin User",
	},
	propertyId: "property-1",
};

// ── Tests ───────────────────────────────────────────────────────────────

describe("getProfileData", () => {
	it("returns property-scope-error when session is null", async () => {
		const { getProfileData } = await import("../profileService");

		const result = await getProfileData(null, {
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

	it("returns profile data with resolved property name", async () => {
		const { getProfileData } = await import("../profileService");

		const result = await getProfileData(aSession, {
			from: fakeFrom({ data: { name: "My Hotel" }, error: null }),
		});

		expect(result).toEqual({
			ok: true,
			data: {
				fullName: "Admin User",
				email: "admin@innhub.test",
				role: "administrator",
				propertyName: "My Hotel",
			},
		});
	});

	it("falls back to propertyId when property name query returns no result", async () => {
		const { getProfileData } = await import("../profileService");

		const result = await getProfileData(aSession, {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: true,
			data: {
				fullName: "Admin User",
				email: "admin@innhub.test",
				role: "administrator",
				propertyName: "property-1",
			},
		});
	});

	it("falls back to propertyId when property name query returns empty array", async () => {
		const { getProfileData } = await import("../profileService");

		const result = await getProfileData(aSession, {
			from: fakeFrom({ data: [], error: null }),
		});

		expect(result).toEqual({
			ok: true,
			data: {
				fullName: "Admin User",
				email: "admin@innhub.test",
				role: "administrator",
				propertyName: "property-1",
			},
		});
	});

	it("falls back to propertyId when property name query errors", async () => {
		const { getProfileData } = await import("../profileService");

		const result = await getProfileData(aSession, {
			from: fakeFrom({
				data: null,
				error: { message: "backend unavailable" },
			}),
		});

		expect(result).toEqual({
			ok: true,
			data: {
				fullName: "Admin User",
				email: "admin@innhub.test",
				role: "administrator",
				propertyName: "property-1",
			},
		});
	});

	it("handles null fullName in session profile", async () => {
		const { getProfileData } = await import("../profileService");

		const sessionNoName: AppSession = {
			...aSession,
			profile: { ...aSession.profile, fullName: null },
		};

		const result = await getProfileData(sessionNoName, {
			from: fakeFrom({ data: { name: "My Hotel" }, error: null }),
		});

		expect(result).toEqual({
			ok: true,
			data: {
				fullName: null,
				email: "admin@innhub.test",
				role: "administrator",
				propertyName: "My Hotel",
			},
		});
	});
});

describe("updateProfileFullName", () => {
	it("returns property-scope-error when session is null", async () => {
		const { updateProfileFullName } = await import("../profileService");

		const result = await updateProfileFullName(null, "Updated Name", {
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

	it("updates fullName and returns success", async () => {
		const { updateProfileFullName } = await import("../profileService");

		const result = await updateProfileFullName(
			aSession,
			"Updated Name",
			{
				from: fakeFrom({ data: null, error: null }),
			},
		);

		expect(result).toEqual({ ok: true, data: null });
	});

	it("returns backend-error on update failure", async () => {
		const { updateProfileFullName } = await import("../profileService");

		const result = await updateProfileFullName(
			aSession,
			"Updated Name",
			{
				from: fakeFrom({
					data: null,
					error: { message: "update failed" },
				}),
			},
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
	});
});
