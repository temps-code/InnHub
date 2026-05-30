import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";
import type { Room, RoomFormData } from "../types";
import type { RoomServiceDepsDeleteQuery } from "../roomService";

// ── Type + Schema tests (RED for types.ts) ───────────────────────────────

describe("roomFormSchema", () => {
	it("parses valid form data", async () => {
		const { roomFormSchema } = await import("../types");

		const input = {
			identifier: "101",
			room_type_id: "rt-1",
			floor: "1",
			state: "available" as const,
			description: "A cozy room",
		};

		const result = roomFormSchema.safeParse(input);
		expect(result.success, "valid input should parse").toBe(true);
		if (result.success) {
			expect(result.data.identifier).toBe("101");
			expect(result.data.room_type_id).toBe("rt-1");
			expect(result.data.floor).toBe("1");
			expect(result.data.state).toBe("available");
			expect(result.data.description).toBe("A cozy room");
		}
	});

	it("parses valid data with optional fields omitted", async () => {
		const { roomFormSchema } = await import("../types");

		const input = { identifier: "102", room_type_id: "rt-1" };
		const result = roomFormSchema.safeParse(input);
		expect(result.success, "minimal input is valid").toBe(true);
		if (result.success) {
			expect(result.data.floor).toBeUndefined();
			expect(result.data.description).toBeUndefined();
			expect(result.data.state).toBe("available");
		}
	});

	it("rejects empty identifier", async () => {
		const { roomFormSchema } = await import("../types");

		const input = { identifier: "", room_type_id: "rt-1" };
		const result = roomFormSchema.safeParse(input);
		expect(result.success).toBe(false);
	});

	it("rejects empty room_type_id", async () => {
		const { roomFormSchema } = await import("../types");

		const input = { identifier: "101", room_type_id: "" };
		const result = roomFormSchema.safeParse(input);
		expect(result.success).toBe(false);
	});

	it("rejects invalid state", async () => {
		const { roomFormSchema } = await import("../types");

		const input = { identifier: "101", room_type_id: "rt-1", state: "bogus" };
		const result = roomFormSchema.safeParse(input);
		expect(result.success).toBe(false);
	});
});

// ── Service tests (RED for roomService.ts) ────────────────────────────────

type QueryResult<T> = { readonly data: T | null; readonly error: unknown };

class FakeRoomQuery<T> implements PromiseLike<QueryResult<T>> {
	readonly eqCalls: Array<{ column: string; value: string }> = [];
	readonly isCalls: Array<{ column: string; value: string | null }> = [];
	readonly neqCalls: Array<{ column: string; value: unknown }> = [];
	readonly inCalls: Array<{ column: string; values: string[] }> = [];
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

	in(column: string, values: string[]): this {
		this.inCalls.push({ column, values });
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
		select: (_columns: string) => new FakeRoomQuery(result),
		insert: (_data: unknown) => new FakeRoomQuery(result),
		update: (_data: unknown) => new FakeRoomQuery(result),
		"delete": () => {
			const q = new FakeRoomQuery<T | null>(result);
			return {
				eq: (column: string, value: string) => {
					q.eqCalls.push({ column, value });
					return q;
				},
				then: q.then as RoomServiceDepsDeleteQuery["then"],
			};
		},
	});
}

// ── Test data ─────────────────────────────────────────────────────────────

const aRoom: Room = {
	id: "room-1",
	property_id: "property-1",
	room_type_id: "rt-1",
	identifier: "101",
	floor: "1",
	state: "available",
	description: "A cozy room",
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

const roomFormData: RoomFormData = {
	identifier: "101",
	room_type_id: "rt-1",
	floor: "1",
	state: "available",
	description: "A cozy room",
};

// ── list ──────────────────────────────────────────────────────────────────

describe("list", () => {
	it("returns property-scope-error when session is null", async () => {
		const { list } = await import("../roomService");

		const result = await list(null, undefined, {
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

	it("returns list of rooms for a valid session", async () => {
		const { list } = await import("../roomService");

		const result = await list(aSession, undefined, {
			from: fakeFrom({ data: [aRoom], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [aRoom] });
	});

	it("returns empty array when no rooms exist", async () => {
		const { list } = await import("../roomService");

		const result = await list(aSession, undefined, {
			from: fakeFrom({ data: [], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [] });
	});

	it("returns a safe backend-error on query failure", async () => {
		const { list } = await import("../roomService");

		const result = await list(aSession, undefined, {
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
		const { list } = await import("../roomService");
		let capturedQuery: FakeRoomQuery<unknown> | undefined;

		const result = await list(aSession, undefined, {
			from: (_table: string) => ({
				select: (_columns: string) => {
					capturedQuery = new FakeRoomQuery({ data: [aRoom], error: null });
					return capturedQuery;
				},
				insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				"delete": () => ({
					eq: () => new FakeRoomQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: [aRoom] });
		expect(capturedQuery).toBeDefined();
		expect(capturedQuery!.isCalls).toEqual([{ column: "deleted_at", value: null }]);
	});

	it("filters by status (state) client-side", async () => {
		const { list } = await import("../roomService");

		const room2: Room = { ...aRoom, id: "room-2", identifier: "102", state: "occupied" };
		const allRooms = [aRoom, room2];

		const result = await list(aSession, { status: "occupied" }, {
			from: fakeFrom({ data: allRooms, error: null }),
		});

		expect(result).toEqual({ ok: true, data: [room2] });
	});

	it("filters by room_type_id client-side", async () => {
		const { list } = await import("../roomService");

		const room2: Room = { ...aRoom, id: "room-2", identifier: "102", room_type_id: "rt-2" };
		const allRooms = [aRoom, room2];

		const result = await list(aSession, { room_type_id: "rt-2" }, {
			from: fakeFrom({ data: allRooms, error: null }),
		});

		expect(result).toEqual({ ok: true, data: [room2] });
	});

	it("filters by search term matching identifier", async () => {
		const { list } = await import("../roomService");

		const room2: Room = { ...aRoom, id: "room-2", identifier: "202", description: null };
		const allRooms = [aRoom, room2];

		const result = await list(aSession, { search: "101" }, {
			from: fakeFrom({ data: allRooms, error: null }),
		});

		expect(result).toEqual({ ok: true, data: [aRoom] });
	});

	it("filters by search term matching description", async () => {
		const { list } = await import("../roomService");

		const room2: Room = { ...aRoom, id: "room-2", identifier: "202", description: "A big suite" };
		const allRooms = [aRoom, room2];

		const result = await list(aSession, { search: "suite" }, {
			from: fakeFrom({ data: allRooms, error: null }),
		});

		expect(result).toEqual({ ok: true, data: [room2] });
	});

	it("search is case-insensitive", async () => {
		const { list } = await import("../roomService");

		const room2: Room = { ...aRoom, id: "room-2", identifier: "202", description: "Deluxe Suite" };
		const allRooms = [aRoom, room2];

		const result = await list(aSession, { search: "DELUXE" }, {
			from: fakeFrom({ data: allRooms, error: null }),
		});

		expect(result).toEqual({ ok: true, data: [room2] });
	});
});

// ── getById ───────────────────────────────────────────────────────────────

describe("getById", () => {
	it("returns property-scope-error when session is null", async () => {
		const { getById } = await import("../roomService");

		const result = await getById(null, "room-1", {
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

	it("returns a single room by id", async () => {
		const { getById } = await import("../roomService");

		const result = await getById(aSession, "room-1", {
			from: fakeFrom({ data: aRoom, error: null }),
		});

		expect(result).toEqual({ ok: true, data: aRoom });
	});

	it("returns not-found when the room does not exist", async () => {
		const { getById } = await import("../roomService");

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
		const { getById } = await import("../roomService");
		let capturedQuery: FakeRoomQuery<unknown> | undefined;

		const result = await getById(aSession, "room-1", {
			from: (_table: string) => ({
				select: (_columns: string) => {
					capturedQuery = new FakeRoomQuery({ data: aRoom, error: null });
					return capturedQuery;
				},
				insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				"delete": () => ({
					eq: () => new FakeRoomQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: aRoom });
		expect(capturedQuery).toBeDefined();
		expect(capturedQuery!.isCalls).toEqual([{ column: "deleted_at", value: null }]);
	});
});

// ── create ────────────────────────────────────────────────────────────────

describe("create", () => {
	it("returns property-scope-error when session is null", async () => {
		const { create } = await import("../roomService");

		const result = await create(null, roomFormData, {
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

	it("creates and returns a new room", async () => {
		const { create } = await import("../roomService");

		const result = await create(aSession, roomFormData, {
			from: fakeFrom({ data: aRoom, error: null }),
		});

		expect(result).toEqual({ ok: true, data: aRoom });
	});

	it("returns validation-error on UNIQUE constraint violation (code 23505)", async () => {
		const { create } = await import("../roomService");

		const result = await create(aSession, roomFormData, {
			from: fakeFrom({
				data: null,
				error: {
					code: "23505",
					details: 'Key (property_id, identifier)=(p1, 101) already exists.',
				},
			}),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "A room with this identifier already exists.",
			},
		});
	});

	it("returns backend-error on other database errors", async () => {
		const { create } = await import("../roomService");

		const result = await create(aSession, roomFormData, {
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
		const { create } = await import("../roomService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: {
				...aSession.profile,
				role: "housekeeping",
			},
		};

		const result = await create(lowPrivSession, roomFormData, {
			from: fakeFrom({ data: aRoom, error: null }),
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
	const updatedRoom: Room = {
		...aRoom,
		floor: "2",
		state: "occupied",
	};

	it("returns property-scope-error when session is null", async () => {
		const { update } = await import("../roomService");

		const result = await update(null, "room-1", roomFormData, {
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

	it("updates and returns the room", async () => {
		const { update } = await import("../roomService");

		const result = await update(aSession, "room-1", roomFormData, {
			from: fakeFrom({ data: updatedRoom, error: null }),
		});

		expect(result).toEqual({ ok: true, data: updatedRoom });
	});

	it("returns not-found when room does not exist", async () => {
		const { update } = await import("../roomService");

		const result = await update(aSession, "nonexistent", roomFormData, {
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

	it("calls .is('deleted_at', null) before .eq('id', id) to guard against soft-deleted records", async () => {
		const { update } = await import("../roomService");
		let capturedQuery: FakeRoomQuery<unknown> | undefined;

		const result = await update(aSession, "room-1", roomFormData, {
			from: (_table: string) => ({
				select: (_columns: string) => new FakeRoomQuery({ data: null, error: null }),
				insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				update: (_data: unknown) => {
					capturedQuery = new FakeRoomQuery({ data: updatedRoom, error: null });
					return capturedQuery;
				},
				"delete": () => ({
					eq: () => new FakeRoomQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: updatedRoom });
		expect(capturedQuery).toBeDefined();
		expect(capturedQuery!.isCalls).toEqual([{ column: "deleted_at", value: null }]);
		expect(capturedQuery!.eqCalls).toContainEqual({ column: "id", value: "room-1" });
	});

	it("returns not-found when the room is soft-deleted", async () => {
		const { update } = await import("../roomService");

		const result = await update(aSession, "room-1", roomFormData, {
			from: (_table: string) => ({
				select: (_columns: string) => new FakeRoomQuery({ data: null, error: null }),
				insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomQuery({ data: [], error: null }),
				"delete": () => ({
					eq: () => new FakeRoomQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
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
		const { softDelete } = await import("../roomService");

		const result = await softDelete(null, "room-1", {
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

	it("soft-deletes and returns the room", async () => {
		const { softDelete } = await import("../roomService");
		const deletedRoom = { ...aRoom, deleted_at: "2025-07-01T00:00:00Z" };

		const result = await softDelete(aSession, "room-1", {
			from: (_table: string) => {
				if (_table === "reservation_items") {
					return {
						select: (_columns: string) => new FakeRoomQuery({ data: [], error: null }),
						insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						"delete": () => ({
							eq: () => new FakeRoomQuery({ data: null, error: null }),
							then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
						}),
					};
				}
				return {
					select: (_columns: string) => new FakeRoomQuery({ data: deletedRoom, error: null }),
					insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
					update: (_data: unknown) => new FakeRoomQuery({ data: deletedRoom, error: null }),
					"delete": () => ({
						eq: () => new FakeRoomQuery({ data: null, error: null }),
						then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
					}),
				};
			},
		});

		expect(result).toEqual({ ok: true, data: deletedRoom });
	});

	it("returns validation-error / permission-denied when user has low-privileged role", async () => {
		const { softDelete } = await import("../roomService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: {
				...aSession.profile,
				role: "housekeeping",
			},
		};

		const result = await softDelete(lowPrivSession, "room-1", {
			from: fakeFrom({ data: aRoom, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "permission-denied",
			},
		});
	});

	it("returns validation-error when room has active reservations", async () => {
		const { softDelete } = await import("../roomService");

		const today = new Date().toISOString().split("T")[0];
		const activeReservation = { id: "res-1", status: "confirmed", planned_check_out_date: today };

		const result = await softDelete(aSession, "room-1", {
			from: (_table: string) => {
				if (_table === "rooms") {
					return {
						select: (_columns: string) => new FakeRoomQuery({ data: aRoom, error: null }),
						insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						"delete": () => ({
							eq: () => new FakeRoomQuery({ data: null, error: null }),
							then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
						}),
					};
				}
				if (_table === "reservation_items") {
					return {
						select: (_columns: string) => new FakeRoomQuery({ data: [{ id: "item-1", reservation_id: "res-1" }], error: null }),
						insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						"delete": () => ({
							eq: () => new FakeRoomQuery({ data: null, error: null }),
							then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
						}),
					};
				}
				if (_table === "reservations") {
					return {
						select: (_columns: string) => new FakeRoomQuery({ data: activeReservation, error: null }),
						insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
						"delete": () => ({
							eq: () => new FakeRoomQuery({ data: null, error: null }),
							then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
						}),
					};
				}
				return {
					select: (_columns: string) => new FakeRoomQuery({ data: null, error: null }),
					insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
					update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
					"delete": () => ({
						eq: () => new FakeRoomQuery({ data: null, error: null }),
						then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
					}),
				};
			},
		});

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "Cannot delete room with active reservations",
			},
		});
	});

	it("returns not-found when the room does not exist", async () => {
		const { softDelete } = await import("../roomService");

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

const anArchivedRoom: Room = {
	...aRoom,
	id: "room-archived",
	deleted_at: "2025-07-01T00:00:00Z",
};

const restoredRoom: Room = {
	...aRoom,
	id: "room-archived",
	deleted_at: null,
};

function fakeFromForRestore(
	loadData: Room,
	updateData: Room,
	duplicateData: unknown = [],
) {
	return (_table: string) => ({
		select: (columns: string) => {
			if (columns === "id") {
				return new FakeRoomQuery({ data: duplicateData, error: null });
			}
			return new FakeRoomQuery({ data: loadData, error: null });
		},
		insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
		update: (_data: unknown) => new FakeRoomQuery({ data: updateData, error: null }),
		"delete": () => {
			const q = new FakeRoomQuery<null>({ data: null, error: null });
			return {
				eq: (column: string, value: string) => {
					q.eqCalls.push({ column, value });
					return q;
				},
				then: q.then as RoomServiceDepsDeleteQuery["then"],
			};
		},
	});
}

function fakeFromForPurge(
	loadData: Room,
	deleteData: unknown = null,
	fkData: Record<string, unknown> = {},
) {
	return (table: string) => ({
		select: (_columns: string) => {
			if (table !== "rooms") {
				return new FakeRoomQuery({ data: fkData[table] ?? [], error: null });
			}
			return new FakeRoomQuery({ data: loadData, error: null });
		},
		insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
		update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
		"delete": () => {
			const q = new FakeRoomQuery<unknown>({ data: deleteData, error: null });
			return {
				eq: (column: string, value: string) => {
					q.eqCalls.push({ column, value });
					return q;
				},
				then: q.then as RoomServiceDepsDeleteQuery["then"],
			};
		},
	});
}

// ── listArchived ────────────────────────────────────────────────────────

describe("listArchived", () => {
	it("returns property-scope-error when session is null", async () => {
		const { listArchived } = await import("../roomService");

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

	it("returns archived rooms", async () => {
		const { listArchived } = await import("../roomService");

		const result = await listArchived(aSession, {
			from: fakeFrom({ data: [anArchivedRoom], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [anArchivedRoom] });
	});

	it("returns only soft-deleted records (post-filter)", async () => {
		const { listArchived } = await import("../roomService");

		const activeRoom = { ...anArchivedRoom, id: "room-active", deleted_at: null };
		const archivedRoom = { ...anArchivedRoom, id: "room-archived", deleted_at: "2025-07-01T00:00:00Z" };

		const result = await listArchived(aSession, {
			from: (_table: string) => ({
				select: (_columns: string) => new FakeRoomQuery({ data: [activeRoom, archivedRoom], error: null }),
				insert: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				update: (_data: unknown) => new FakeRoomQuery({ data: null, error: null }),
				"delete": () => ({
					eq: () => new FakeRoomQuery({ data: null, error: null }),
					then: (() => Promise.resolve({ data: null, error: null })) as RoomServiceDepsDeleteQuery["then"],
				}),
			}),
		});

		expect(result).toEqual({ ok: true, data: [archivedRoom] });
	});

	it("returns validation-error / permission-denied for low-privileged role", async () => {
		const { listArchived } = await import("../roomService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: { ...aSession.profile, role: "housekeeping" },
		};

		const result = await listArchived(lowPrivSession, {
			from: fakeFrom({ data: [anArchivedRoom], error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});
	});

	it("returns empty array when no archived rooms exist", async () => {
		const { listArchived } = await import("../roomService");

		const result = await listArchived(aSession, {
			from: fakeFrom({ data: [], error: null }),
		});

		expect(result).toEqual({ ok: true, data: [] });
	});

	it("returns backend-error on query failure", async () => {
		const { listArchived } = await import("../roomService");

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
		const { restore } = await import("../roomService");

		const result = await restore(null, "room-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "property-scope-error", message: "A valid property scope is required." },
		});
	});

	it("restores a soft-deleted room", async () => {
		const { restore } = await import("../roomService");

		const result = await restore(aSession, "room-archived", {
			from: fakeFromForRestore(anArchivedRoom, restoredRoom),
		});

		expect(result).toEqual({ ok: true, data: restoredRoom });
	});

	it("returns validation-error on duplicate active identifier", async () => {
		const { restore } = await import("../roomService");
		const duplicateActiveRoom: Room = { ...aRoom, id: "room-other" };

		const result = await restore(aSession, "room-archived", {
			from: fakeFromForRestore(anArchivedRoom, restoredRoom, [duplicateActiveRoom]),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "A room with this identifier already exists." },
		});
	});

	it("returns not-found when room is not soft-deleted", async () => {
		const { restore } = await import("../roomService");

		const result = await restore(aSession, "room-1", {
			from: fakeFrom({ data: aRoom, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns not-found when room belongs to different property", async () => {
		const { restore } = await import("../roomService");
		const otherPropertySession: AppSession = {
			...aSession,
			propertyId: "property-2",
			profile: { ...aSession.profile, propertyId: "property-2" },
		};

		const result = await restore(otherPropertySession, "room-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns validation-error / permission-denied for low-privileged role", async () => {
		const { restore } = await import("../roomService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: { ...aSession.profile, role: "housekeeping" },
		};

		const result = await restore(lowPrivSession, "room-archived", {
			from: fakeFrom({ data: anArchivedRoom, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});
	});

	it("returns not-found when room does not exist", async () => {
		const { restore } = await import("../roomService");

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
		const { purge } = await import("../roomService");

		const result = await purge(null, "room-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "property-scope-error", message: "A valid property scope is required." },
		});
	});

	it("purges a soft-deleted room with no FK references", async () => {
		const { purge } = await import("../roomService");

		const result = await purge(aSession, "room-archived", {
			from: fakeFromForPurge(anArchivedRoom, null, {}),
		});

		expect(result).toEqual({ ok: true, data: anArchivedRoom });
	});

	it("returns foreign-key-conflict when reservation_items reference the room", async () => {
		const { purge } = await import("../roomService");

		const result = await purge(aSession, "room-archived", {
			from: fakeFromForPurge(anArchivedRoom, null, { reservation_items: [{ id: "item-1" }] }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "foreign-key-conflict", message: "This record is referenced by other data and cannot be deleted." },
		});
	});

	it("returns not-found when room is not soft-deleted", async () => {
		const { purge } = await import("../roomService");

		const result = await purge(aSession, "room-1", {
			from: fakeFrom({ data: aRoom, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns not-found when room belongs to different property", async () => {
		const { purge } = await import("../roomService");
		const otherPropertySession: AppSession = {
			...aSession,
			propertyId: "property-2",
			profile: { ...aSession.profile, propertyId: "property-2" },
		};

		const result = await purge(otherPropertySession, "room-archived", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});

	it("returns validation-error / permission-denied for low-privileged role", async () => {
		const { purge } = await import("../roomService");
		const lowPrivSession: AppSession = {
			...aSession,
			profile: { ...aSession.profile, role: "housekeeping" },
		};

		const result = await purge(lowPrivSession, "room-archived", {
			from: fakeFrom({ data: anArchivedRoom, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});
	});

	it("returns not-found when room does not exist", async () => {
		const { purge } = await import("../roomService");

		const result = await purge(aSession, "nonexistent", {
			from: fakeFrom({ data: null, error: null }),
		});

		expect(result).toEqual({
			ok: false,
			error: { code: "not-found", message: "The requested record was not found." },
		});
	});
});
