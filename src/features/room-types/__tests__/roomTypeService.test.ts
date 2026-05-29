import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";
import type { RoomType, RoomTypeFormData } from "../types";
import type { RoomTypeServiceDepsDeleteQuery } from "../roomTypeService";

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
	readonly isCalls: Array<{ column: string; value: string | null }> = [];
	readonly neqCalls: Array<{ column: string; value: unknown }> = [];
	readonly result: QueryResult<T>;

	constructor(result: QueryResult<T>) {
		this.result = result;
	}

	eq(column: string, value: string): this {
		this.eqCalls.push({ column, value });
		return this;
	}

	is(column: string, value: string | null): this {
		this.isCalls.push({ column, value });
		return this;
	}

	neq(column: string, value: unknown): this {
		this.neqCalls.push({ column, value });
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
		"delete": () => {
			const q = new FakeRoomTypeQuery<T | null>(result);
			return {
				eq: (column: string, value: string) => {
					q.eqCalls.push({ column, value });
					return q;
				},
				then: q.then as RoomTypeServiceDepsDeleteQuery["then"],
			};
		},
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
	deleted_at: null,
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

	it("calls .is('deleted_at', null) to exclude soft-deleted records", async () => {
		const { list } = await import("../roomTypeService");
		let capturedQuery: FakeRoomTypeQuery<unknown> | undefined;

		const result = await list(aSession, {
			from: (_table: string) => ({
				select: (_columns: string) => {
					capturedQuery = new FakeRoomTypeQuery({ data: [aRoomType], error: null });
					return capturedQuery;
				},
				insert: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				"delete": () => ({
					eq: () => new FakeRoomTypeQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomTypeServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: [aRoomType] });
		expect(capturedQuery).toBeDefined();
		expect(capturedQuery!.isCalls).toEqual([{ column: "deleted_at", value: null }]);
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

	it("calls .is('deleted_at', null) to exclude soft-deleted records", async () => {
		const { getById } = await import("../roomTypeService");
		let capturedQuery: FakeRoomTypeQuery<unknown> | undefined;

		const result = await getById(aSession, "rt-1", {
			from: (_table: string) => ({
				select: (_columns: string) => {
					capturedQuery = new FakeRoomTypeQuery({ data: aRoomType, error: null });
					return capturedQuery;
				},
				insert: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				"delete": () => ({
					eq: () => new FakeRoomTypeQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomTypeServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: aRoomType });
		expect(capturedQuery).toBeDefined();
		expect(capturedQuery!.isCalls).toEqual([{ column: "deleted_at", value: null }]);
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

	it("allows creating a room type with the same name as a soft-deleted one", async () => {
		const { create } = await import("../roomTypeService");

		const duplicateNameRoomType: RoomType = {
			...aRoomType,
			id: "rt-new",
			name: formData.name,
		};

		const result = await create(aSession, formData, {
			from: fakeFrom({ data: duplicateNameRoomType, error: null }),
		});

		expect(result).toEqual({ ok: true, data: duplicateNameRoomType });
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

	it("calls .is('deleted_at', null) before .eq('id', id) to guard against soft-deleted records", async () => {
		const { update } = await import("../roomTypeService");
		let capturedQuery: FakeRoomTypeQuery<unknown> | undefined;

		const result = await update(aSession, "rt-1", formData, {
			from: (_table: string) => ({
				select: (_columns: string) => new FakeRoomTypeQuery({ data: null, error: null }),
				insert: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				update: (_data: unknown) => {
					capturedQuery = new FakeRoomTypeQuery({ data: updatedRoomType, error: null });
					return capturedQuery;
				},
				"delete": () => ({
					eq: () => new FakeRoomTypeQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomTypeServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: updatedRoomType });
		expect(capturedQuery).toBeDefined();
		expect(capturedQuery!.isCalls).toEqual([{ column: "deleted_at", value: null }]);
		expect(capturedQuery!.eqCalls).toContainEqual({ column: "id", value: "rt-1" });
	});

	it("returns not-found when the room type is soft-deleted", async () => {
		const { update } = await import("../roomTypeService");

		const result = await update(aSession, "rt-1", formData, {
			from: (_table: string) => ({
				select: (_columns: string) => new FakeRoomTypeQuery({ data: null, error: null }),
				insert: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomTypeQuery({ data: [], error: null }),
				"delete": () => ({
					eq: () => new FakeRoomTypeQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomTypeServiceDepsDeleteQuery["then"],
				}),
			}),
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

// ── softDelete ────────────────────────────────────────────────────────────

describe("softDelete", () => {
	it("returns property-scope-error when session is null", async () => {
		const { softDelete } = await import("../roomTypeService");

		const result = await softDelete(null, "rt-1", {
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

	it("soft-deletes and returns the room type", async () => {
		const { softDelete } = await import("../roomTypeService");
		const deletedRoomType = { ...aRoomType, deleted_at: "2025-07-01T00:00:00Z" };

		const result = await softDelete(aSession, "rt-1", {
			from: fakeFrom({ data: deletedRoomType, error: null }),
		});

		expect(result).toEqual({ ok: true, data: deletedRoomType });
	});

	it("returns validation-error / permission-denied when user has low-privileged role", async () => {
		const { softDelete } = await import("../roomTypeService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: {
				...aSession.profile,
				role: "receptionist",
			},
		};

		const result = await softDelete(lowPrivSession, "rt-1", {
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

	it("returns not-found when the room type does not exist", async () => {
		const { softDelete } = await import("../roomTypeService");

		const result = await softDelete(aSession, "nonexistent", {
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

// ── Test data for archive/restore/purge ─────────────────────────────────

const anArchivedRoomType: RoomType = {
	...aRoomType,
	id: "rt-archived",
	deleted_at: "2025-07-01T00:00:00Z",
};

const restoredRoomType: RoomType = {
	...aRoomType,
	id: "rt-archived",
	name: "Standard Queen",
	deleted_at: null,
};

// Fake that returns different data for load vs update in restore
function fakeFromForRestore(
	loadData: RoomType,
	updateData: RoomType,
	duplicateData: unknown = [],
) {
	return (_table: string) => ({
		select: (columns: string) => {
			if (columns === "id") {
				return new FakeRoomTypeQuery({ data: duplicateData, error: null });
			}
			return new FakeRoomTypeQuery({ data: loadData, error: null });
		},
		insert: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
		update: (_data: unknown) => new FakeRoomTypeQuery({ data: updateData, error: null }),
		"delete": () => {
			const q = new FakeRoomTypeQuery<null>({ data: null, error: null });
			return {
				eq: (column: string, value: string) => {
					q.eqCalls.push({ column, value });
					return q;
				},
				then: q.then as RoomTypeServiceDepsDeleteQuery["then"],
			};
		},
	});
}

// Fake that returns data only for room_types table, and per-table FK data
function fakeFromForPurge(
	loadData: RoomType,
	deleteData: unknown = null,
	fkData: Record<string, unknown> = {},
) {
	return (table: string) => ({
		select: (_columns: string) => {
			if (table !== "room_types") {
				return new FakeRoomTypeQuery({ data: fkData[table] ?? [], error: null });
			}
			return new FakeRoomTypeQuery({ data: loadData, error: null });
		},
		insert: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
		update: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
		"delete": () => {
			const q = new FakeRoomTypeQuery<unknown>({ data: deleteData, error: null });
			return {
				eq: (column: string, value: string) => {
					q.eqCalls.push({ column, value });
					return q;
				},
				then: q.then as RoomTypeServiceDepsDeleteQuery["then"],
			};
		},
	});
}

// ── listArchived ────────────────────────────────────────────────────────

describe("listArchived", () => {
	it("returns property-scope-error when session is null", async () => {
		const { listArchived } = await import("../roomTypeService");

		const result = await listArchived(null, {
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

	it("returns archived room types", async () => {
		const { listArchived } = await import("../roomTypeService");

		const result = await listArchived(aSession, {
			from: fakeFrom({ data: [anArchivedRoomType], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [anArchivedRoomType] });
	});

	it("returns only soft-deleted records (post-filter)", async () => {
		const { listArchived } = await import("../roomTypeService");

		const activeRoomType = { ...anArchivedRoomType, id: "rt-active", deleted_at: null };
		const archivedRoomType = { ...anArchivedRoomType, id: "rt-archived", deleted_at: "2025-07-01T00:00:00Z" };

		const result = await listArchived(aSession, {
			from: (_table: string) => ({
				select: (_columns: string) => new FakeRoomTypeQuery({ data: [activeRoomType, archivedRoomType], error: null }),
				insert: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomTypeQuery({ data: null, error: null }),
				"delete": () => ({
					eq: () => new FakeRoomTypeQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomTypeServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: [archivedRoomType] });
	});

	it("returns validation-error / permission-denied for low-privileged role", async () => {
		const { listArchived } = await import("../roomTypeService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: { ...aSession.profile, role: "receptionist" },
		};

		const result = await listArchived(lowPrivSession, {
			from: fakeFrom({ data: [anArchivedRoomType], error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});
	});

	it("returns empty array when no archived room types exist", async () => {
		const { listArchived } = await import("../roomTypeService");

		const result = await listArchived(aSession, {
			from: fakeFrom({ data: [], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [] });
	});

	it("returns backend-error on query failure", async () => {
		const { listArchived } = await import("../roomTypeService");

		const result = await listArchived(aSession, {
			from: fakeFrom({ data: null, error: { message: "connection refused" } }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "backend-error", message: "The service request could not be completed." },
		});
	});
});

// ── restore ─────────────────────────────────────────────────────────────

describe("restore", () => {
	it("returns property-scope-error when session is null", async () => {
		const { restore } = await import("../roomTypeService");

		const result = await restore(null, "rt-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "property-scope-error", message: "A valid property scope is required." },
		});
	});

	it("restores a soft-deleted room type", async () => {
		const { restore } = await import("../roomTypeService");

		const result = await restore(aSession, "rt-archived", {
			from: fakeFromForRestore(anArchivedRoomType, restoredRoomType),
		});

		expect(result).toEqual({ ok: true, data: restoredRoomType });
	});

	it("returns validation-error on duplicate active name", async () => {
		const { restore } = await import("../roomTypeService");
		const duplicateActiveType: RoomType = { ...aRoomType, id: "rt-other" };

		const result = await restore(aSession, "rt-archived", {
			from: fakeFromForRestore(anArchivedRoomType, restoredRoomType, [duplicateActiveType]),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "A room type with this name already exists." },
		});
	});

	it("returns not-found when room type is not soft-deleted", async () => {
		const { restore } = await import("../roomTypeService");

		const result = await restore(aSession, "rt-1", {
			from: fakeFrom({ data: aRoomType, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns not-found when room type belongs to different property", async () => {
		const { restore } = await import("../roomTypeService");
		const otherPropertySession: AppSession = {
			...aSession,
			propertyId: "property-2",
			profile: { ...aSession.profile, propertyId: "property-2" },
		};

		const result = await restore(otherPropertySession, "rt-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns validation-error / permission-denied for low-privileged role", async () => {
		const { restore } = await import("../roomTypeService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: { ...aSession.profile, role: "receptionist" },
		};

		const result = await restore(lowPrivSession, "rt-archived", {
			from: fakeFrom({ data: anArchivedRoomType, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});
	});

	it("returns not-found when room type does not exist", async () => {
		const { restore } = await import("../roomTypeService");

		const result = await restore(aSession, "nonexistent", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});
});

// ── purge ───────────────────────────────────────────────────────────────

describe("purge", () => {
	it("returns property-scope-error when session is null", async () => {
		const { purge } = await import("../roomTypeService");

		const result = await purge(null, "rt-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "property-scope-error", message: "A valid property scope is required." },
		});
	});

	it("purges a soft-deleted room type with no FK references", async () => {
		const { purge } = await import("../roomTypeService");

		const result = await purge(aSession, "rt-archived", {
			from: fakeFromForPurge(anArchivedRoomType, null, {}),
		});

		expect(result).toEqual({ ok: true, data: anArchivedRoomType });
	});

	it("returns foreign-key-conflict when rooms reference the type", async () => {
		const { purge } = await import("../roomTypeService");

		const result = await purge(aSession, "rt-archived", {
			from: fakeFromForPurge(anArchivedRoomType, null, { rooms: [{ id: "room-1" }] }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "foreign-key-conflict", message: "This record is referenced by other data and cannot be deleted." },
		});
	});

	it("returns foreign-key-conflict when reservation_items reference the type", async () => {
		const { purge } = await import("../roomTypeService");

		const result = await purge(aSession, "rt-archived", {
			from: fakeFromForPurge(anArchivedRoomType, null, { reservation_items: [{ id: "item-1" }] }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "foreign-key-conflict", message: "This record is referenced by other data and cannot be deleted." },
		});
	});

	it("returns foreign-key-conflict when both tables reference the type", async () => {
		const { purge } = await import("../roomTypeService");

		const result = await purge(aSession, "rt-archived", {
			from: fakeFromForPurge(anArchivedRoomType, null, {
				rooms: [{ id: "ref-1" }],
				reservation_items: [{ id: "ref-1" }],
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "foreign-key-conflict", message: "This record is referenced by other data and cannot be deleted." },
		});
	});

	it("returns not-found when room type is not soft-deleted", async () => {
		const { purge } = await import("../roomTypeService");

		const result = await purge(aSession, "rt-1", {
			from: fakeFrom({ data: aRoomType, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns not-found when room type belongs to different property", async () => {
		const { purge } = await import("../roomTypeService");
		const otherPropertySession: AppSession = {
			...aSession,
			propertyId: "property-2",
			profile: { ...aSession.profile, propertyId: "property-2" },
		};

		const result = await purge(otherPropertySession, "rt-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns validation-error / permission-denied for low-privileged role", async () => {
		const { purge } = await import("../roomTypeService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: { ...aSession.profile, role: "receptionist" },
		};

		const result = await purge(lowPrivSession, "rt-archived", {
			from: fakeFrom({ data: anArchivedRoomType, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});
	});

	it("returns not-found when room type does not exist", async () => {
		const { purge } = await import("../roomTypeService");

		const result = await purge(aSession, "nonexistent", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});
});
