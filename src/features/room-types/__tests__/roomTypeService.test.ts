import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";
import type { RoomType, RoomTypeFormData } from "../types";

// ── Type + Schema tests (RED for types.ts) ───────────────────────────────
// These tests reference roomTypeFormSchema which does NOT exist yet.
// The first test will fail at the import level until types.ts is created.

describe("roomTypeFormSchema", () => {
	it("parses valid form data", async () => {
		// This import will fail until types.ts is created — that is the RED state.
		const { roomTypeFormSchema } = await import("../types");

		const input = {
			name: "Standard Queen",
			description: "A standard queen-sized room",
			capacity: 2,
			base_price: 150.0,
		};

		const result = roomTypeFormSchema.safeParse(input);
		expect(result.success, "valid input should parse").toBe(true);
		if (result.success) {
			expect(result.data.name).toBe("Standard Queen");
			expect(result.data.capacity).toBe(2);
			expect(result.data.base_price).toBe(150.0);
			expect(result.data.description).toBe(
				"A standard queen-sized room",
			);
		}
	});

	it("parses valid data with null description", async () => {
		const { roomTypeFormSchema } = await import("../types");

		const input = { name: "Single", description: null, capacity: 1, base_price: 80 };
		const result = roomTypeFormSchema.safeParse(input);
		expect(result.success, "null description is valid").toBe(true);
	});

	it("rejects empty name", async () => {
		const { roomTypeFormSchema } = await import("../types");

		const input = { name: "", capacity: 2, base_price: 100 };
		const result = roomTypeFormSchema.safeParse(input);
		expect(result.success).toBe(false);
	});

	it("rejects zero capacity", async () => {
		const { roomTypeFormSchema } = await import("../types");

		const input = { name: "Test", capacity: 0, base_price: 50 };
		const result = roomTypeFormSchema.safeParse(input);
		expect(result.success).toBe(false);
	});

	it("rejects negative base_price", async () => {
		const { roomTypeFormSchema } = await import("../types");

		const input = { name: "Test", capacity: 2, base_price: -1 };
		const result = roomTypeFormSchema.safeParse(input);
		expect(result.success).toBe(false);
	});

		it("coerces string capacity and base_price to numbers", async () => {
		const { roomTypeFormSchema } = await import("../types");

		const input = {
			name: "Suite",
			description: null,
			capacity: "3",
			base_price: "200.50",
		};
		const result = roomTypeFormSchema.safeParse(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.capacity).toBe(3);
			expect(result.data.base_price).toBe(200.5);
		}
	});
});

// ── Service tests (RED for roomTypeService.ts) ────────────────────────────
// These tests reference list, getById, create, update which do NOT exist yet.

// ── Fake query builder ────────────────────────────────────────────────────
// Implements EqQuery (for scopeOperationalQuery) and PromiseLike
// (for executeServiceQuery), following the same pattern as
// FakePropertyQuery in propertyService.test.ts.

type QueryResult<T> = { readonly data: T | null; readonly error: unknown };

class FakeRoomTypeQuery<T> implements PromiseLike<QueryResult<T>> {
	readonly eqCalls: Array<{ column: string; value: string }> = [];
	readonly result: QueryResult<T>;

	constructor(result: QueryResult<T>) {
		this.result = result;
	}

	eq(column: string, value: string): this {
		this.eqCalls.push({ column, value });
		return this;
	}

	select(): this {
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
	return (_table: string) => ({
		select: (_columns: string) => new FakeRoomTypeQuery(result),
		insert: (_data: unknown) => new FakeRoomTypeQuery(result),
		update: (_data: unknown) => new FakeRoomTypeQuery(result),
	});
}

// ── Test data ─────────────────────────────────────────────────────────────

const aRoomType: RoomType = {
	id: "rt-1",
	property_id: "property-1",
	name: "Standard Queen",
	description: "A standard queen-sized room",
	capacity: 2,
	base_price: 150.0,
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

const formData: RoomTypeFormData = {
	name: "Standard Queen",
	description: "A standard queen-sized room",
	capacity: 2,
	base_price: 150.0,
};

// ── list ──────────────────────────────────────────────────────────────────

describe("list", () => {
	it("returns property-scope-error when session is null", async () => {
		const { list } = await import("../roomTypeService");

		const result = await list(null, {
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

	it("returns list of room types for a valid session", async () => {
		const { list } = await import("../roomTypeService");

		const result = await list(aSession, {
			from: fakeFrom({ data: [aRoomType], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [aRoomType] });
	});

	it("returns empty array when no room types exist", async () => {
		const { list } = await import("../roomTypeService");

		const result = await list(aSession, {
			from: fakeFrom({ data: [], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [] });
	});

	it("returns a safe backend-error on query failure", async () => {
		const { list } = await import("../roomTypeService");

		const result = await list(aSession, {
			from: fakeFrom({
				data: null,
				error: { message: "connection refused" },
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
	});
});

// ── getById ───────────────────────────────────────────────────────────────

describe("getById", () => {
	it("returns property-scope-error when session is null", async () => {
		const { getById } = await import("../roomTypeService");

		const result = await getById(null, "rt-1", {
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

	it("returns a single room type by id", async () => {
		const { getById } = await import("../roomTypeService");

		const result = await getById(aSession, "rt-1", {
			from: fakeFrom({ data: aRoomType, error: null }),
		});

		expect(result).toEqual({ ok: true, data: aRoomType });
	});

	it("returns not-found when the room type does not exist", async () => {
		const { getById } = await import("../roomTypeService");

		const result = await getById(aSession, "nonexistent", {
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
});

// ── create ────────────────────────────────────────────────────────────────

describe("create", () => {
	it("returns property-scope-error when session is null", async () => {
		const { create } = await import("../roomTypeService");

		const result = await create(null, formData, {
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

	it("creates and returns a new room type", async () => {
		const { create } = await import("../roomTypeService");

		const result = await create(aSession, formData, {
			from: fakeFrom({ data: aRoomType, error: null }),
		});

		expect(result).toEqual({ ok: true, data: aRoomType });
	});

	it("returns validation-error on UNIQUE constraint violation (code 23505)", async () => {
		const { create } = await import("../roomTypeService");

		const result = await create(aSession, formData, {
			from: fakeFrom({
				data: null,
				error: {
					code: "23505",
					details: 'Key (property_id, name)=(p1, Standard Queen) already exists.',
				},
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "A room type with this name already exists.",
			},
		});
	});

	it("returns backend-error on other database errors", async () => {
		const { create } = await import("../roomTypeService");

		const result = await create(aSession, formData, {
			from: fakeFrom({
				data: null,
				error: { message: "disk full" },
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
	});

	it("returns validation-error / permission-denied when user has low-privileged role", async () => {
		const { create } = await import("../roomTypeService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: {
				...aSession.profile,
				role: "receptionist",
			},
		};

		const result = await create(lowPrivSession, formData, {
			from: fakeFrom({ data: aRoomType, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "permission-denied",
			},
		});
	});
});

// ── update ────────────────────────────────────────────────────────────────

describe("update", () => {
	const updatedRoomType: RoomType = {
		...aRoomType,
		name: "Standard Queen Updated",
	};

	it("returns property-scope-error when session is null", async () => {
		const { update } = await import("../roomTypeService");

		const result = await update(null, "rt-1", formData, {
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

	it("updates and returns the room type", async () => {
		const { update } = await import("../roomTypeService");

		const result = await update(aSession, "rt-1", formData, {
			from: fakeFrom({ data: updatedRoomType, error: null }),
		});

		expect(result).toEqual({ ok: true, data: updatedRoomType });
	});

	it("returns validation-error on UNIQUE constraint violation (code 23505)", async () => {
		const { update } = await import("../roomTypeService");

		const result = await update(aSession, "rt-1", formData, {
			from: fakeFrom({
				data: null,
				error: {
					code: "23505",
					details: 'Key (property_id, name)=(p1, Duplicate Name) already exists.',
				},
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "A room type with this name already exists.",
			},
		});
	});

	it("returns not-found when room type does not exist", async () => {
		const { update } = await import("../roomTypeService");

		const result = await update(aSession, "nonexistent", formData, {
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

	it("returns backend-error on other database errors", async () => {
		const { update } = await import("../roomTypeService");

		const result = await update(aSession, "rt-1", formData, {
			from: fakeFrom({
				data: null,
				error: { message: "timeout" },
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "backend-error",
				message: "The service request could not be completed.",
			},
		});
	});

	it("returns validation-error / permission-denied when user has low-privileged role", async () => {
		const { update } = await import("../roomTypeService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: {
				...aSession.profile,
				role: "receptionist",
			},
		};

		const result = await update(lowPrivSession, "rt-1", formData, {
			from: fakeFrom({ data: aRoomType, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "permission-denied",
			},
		});
	});
});
