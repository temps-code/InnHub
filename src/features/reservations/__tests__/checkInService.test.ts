import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";
import type { Reservation, ReservationItem } from "../types";
import { checkInReservationItem } from "../checkInService";

type Room = {
	readonly id: string;
	readonly property_id: string;
	readonly room_type_id: string;
	readonly state:
		| "available"
		| "occupied"
		| "cleaning"
		| "maintenance"
		| "inactive";
	readonly identifier: string;
	readonly floor: string | null;
	readonly description: string | null;
	readonly created_at: string;
	readonly updated_at: string;
	readonly deleted_at: string | null;
};

type Stay = {
	readonly id: string;
	readonly property_id: string;
	readonly reservation_item_id: string | null;
	readonly primary_guest_id: string;
	readonly room_id: string;
	readonly actual_check_in_at: string;
	readonly expected_check_out_date: string;
	readonly actual_check_out_at: string | null;
	readonly status: "active" | "checked_out" | "cancelled";
	readonly guest_count: number;
	readonly notes: string | null;
	readonly created_at: string;
	readonly updated_at: string;
	readonly deleted_at?: string | null;
};

type QueryResult<T = unknown> = {
	readonly data: T | null;
	readonly error: unknown;
	readonly count?: number | null;
};

type TableMap = {
	reservations: Reservation[];
	reservation_items: ReservationItem[];
	rooms: Room[];
	stays: Stay[];
};

type TableName = keyof TableMap;

type Filter = { column: string; value: unknown };

type OperationRecord = {
	table: TableName;
	operation: "select" | "insert" | "update";
	payload?: unknown;
};

class FakeQuery<TTable extends TableName>
	implements
		PromiseLike<QueryResult<TableMap[TTable] | TableMap[TTable][number]>>
{
	readonly eqCalls: Filter[] = [];
	readonly isCalls: Filter[] = [];
	readonly neqCalls: Filter[] = [];
	readonly inCalls: Array<{ column: string; values: unknown[] }> = [];
	private readonly table: TTable;
	private readonly operation: "select" | "insert" | "update";
	private readonly store: TableMap;
	private readonly calls: OperationRecord[];
	private readonly payload?:
		| Partial<TableMap[TTable][number]>
		| Array<Partial<TableMap[TTable][number]>>;

	constructor(
		table: TTable,
		operation: "select" | "insert" | "update",
		store: TableMap,
		calls: OperationRecord[],
		payload?:
			| Partial<TableMap[TTable][number]>
			| Array<Partial<TableMap[TTable][number]>>,
	) {
		this.table = table;
		this.operation = operation;
		this.store = store;
		this.calls = calls;
		this.payload = payload;
	}

	eq(column: string, value: unknown): this {
		this.eqCalls.push({ column, value });
		return this;
	}

	is(column: string, value: unknown): this {
		this.isCalls.push({ column, value });
		return this;
	}

	neq(column: string, value: unknown): this {
		this.neqCalls.push({ column, value });
		return this;
	}

	in(column: string, values: unknown[]): this {
		this.inCalls.push({ column, values });
		return this;
	}

	select(): this {
		return this;
	}

	then<TResult>(
		onfulfilled?: (
			value: QueryResult<TableMap[TTable] | TableMap[TTable][number]>,
		) => TResult | PromiseLike<TResult>,
	): Promise<TResult> {
		const response = this.execute();
		return Promise.resolve(response).then(onfulfilled as never);
	}

	private execute(): QueryResult<TableMap[TTable] | TableMap[TTable][number]> {
		this.calls.push({
			table: this.table,
			operation: this.operation,
			payload: this.payload,
		});

		if (this.operation === "select") {
			return {
				data: this.filterRows(),
				error: null,
			};
		}

		if (this.operation === "insert") {
			const payloads = Array.isArray(this.payload)
				? this.payload
				: [this.payload ?? {}];
			const inserted = payloads.map((payload, index) => ({
				id: String(
					(payload as { id?: string }).id ??
						`${this.table}-${this.store[this.table].length + index + 1}`,
				),
				deleted_at: null,
				created_at: "2026-08-10T15:00:00Z",
				updated_at: "2026-08-10T15:00:00Z",
				...payload,
			})) as TableMap[TTable];
			(this.store[this.table] as Array<TableMap[TTable][number]>).push(
				...inserted,
			);
			return { data: inserted, error: null };
		}

		const updated = this.filterRows().map((row) =>
			Object.assign(row, this.payload ?? {}),
		);
		return { data: updated as TableMap[TTable], error: null };
	}

	private filterRows(): TableMap[TTable] {
		return this.store[this.table].filter((row) => {
			const eqOk = this.eqCalls.every(
				(filter) => row[filter.column as keyof typeof row] === filter.value,
			);
			const isOk = this.isCalls.every(
				(filter) => row[filter.column as keyof typeof row] === filter.value,
			);
			const neqOk = this.neqCalls.every(
				(filter) => row[filter.column as keyof typeof row] !== filter.value,
			);
			const inOk = this.inCalls.every((filter) =>
				filter.values.includes(row[filter.column as keyof typeof row]),
			);
			return eqOk && isOk && neqOk && inOk;
		}) as TableMap[TTable];
	}
}

function createDeps(seed?: Partial<TableMap>) {
	const data: TableMap = {
		reservations: [buildReservation()],
		reservation_items: [buildReservationItem()],
		rooms: [buildRoom()],
		stays: [],
		...seed,
	};
	const calls: OperationRecord[] = [];

	return {
		deps: {
			from: (table: string) => ({
				select: () => new FakeQuery(table as TableName, "select", data, calls),
				insert: (payload: unknown) =>
					new FakeQuery(
						table as TableName,
						"insert",
						data,
						calls,
						payload as never,
					),
				update: (payload: unknown) =>
					new FakeQuery(
						table as TableName,
						"update",
						data,
						calls,
						payload as never,
					),
			}),
		},
		data,
		calls,
	};
}

const receptionistSession: AppSession = {
	user: { id: "user-1", email: "frontdesk@innhub.test" },
	profile: {
		id: "profile-1",
		authUserId: "user-1",
		propertyId: "property-1",
		role: "receptionist",
		status: "active",
	},
	propertyId: "property-1",
};

function buildReservation(overrides: Partial<Reservation> = {}): Reservation {
	return {
		id: "reservation-1",
		property_id: "property-1",
		primary_guest_id: "guest-1",
		planned_check_in_date: "2026-08-10",
		planned_check_out_date: "2026-08-12",
		status: "confirmed",
		notes: null,
		created_at: "2026-08-01T00:00:00Z",
		updated_at: "2026-08-01T00:00:00Z",
		deleted_at: null,
		...overrides,
	};
}

function buildReservationItem(
	overrides: Partial<ReservationItem> = {},
): ReservationItem {
	return {
		id: "reservation-item-1",
		property_id: "property-1",
		reservation_id: "reservation-1",
		room_type_id: "room-type-1",
		room_id: "room-1",
		status: "confirmed",
		guest_count: 2,
		notes: null,
		deleted_at: null,
		...overrides,
	};
}

function buildRoom(overrides: Partial<Room> = {}): Room {
	return {
		id: "room-1",
		property_id: "property-1",
		room_type_id: "room-type-1",
		identifier: "101",
		floor: "1",
		state: "available",
		description: null,
		created_at: "2026-08-01T00:00:00Z",
		updated_at: "2026-08-01T00:00:00Z",
		deleted_at: null,
		...overrides,
	};
}

function buildStay(overrides: Partial<Stay> = {}): Stay {
	return {
		id: "stay-1",
		property_id: "property-1",
		reservation_item_id: "reservation-item-1",
		primary_guest_id: "guest-1",
		room_id: "room-1",
		actual_check_in_at: "2026-08-10T12:00:00Z",
		expected_check_out_date: "2026-08-12",
		actual_check_out_at: null,
		status: "checked_out",
		guest_count: 2,
		notes: null,
		created_at: "2026-08-10T12:00:00Z",
		updated_at: "2026-08-12T10:00:00Z",
		deleted_at: null,
		...overrides,
	};
}

describe("checkInReservationItem", () => {
	it("creates an active stay and updates reservation, item, and room for a valid single-item check-in", async () => {
		const { deps, data, calls } = createDeps();

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T15:00:00Z",
			},
			deps,
		);

		expect(result.ok).toBe(true);
		if (!result.ok) {
			return;
		}

		expect(result.data.reservation.status).toBe("checked_in");
		expect(result.data.reservationItem.status).toBe("checked_in");
		expect(result.data.stay.status).toBe("active");
		expect(result.data.stay.room_id).toBe("room-1");
		expect(result.data.room.state).toBe("occupied");
		expect(data.stays).toHaveLength(1);
		expect(
			calls.filter((call) => call.operation === "update").at(-1),
		).toMatchObject({
			table: "rooms",
			operation: "update",
		});
	});

	it("rejects missing property scope before querying", async () => {
		const { deps, calls } = createDeps();

		const result = await checkInReservationItem(
			null,
			{ reservationItemId: "reservation-item-1" },
			deps,
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "property-scope-error",
				message: "A valid property scope is required.",
			},
		});
		expect(calls).toHaveLength(0);
	});

	it("rejects insufficient role", async () => {
		const { deps, calls } = createDeps();

		const result = await checkInReservationItem(
			{
				...receptionistSession,
				profile: { ...receptionistSession.profile, role: "housekeeping" },
			},
			{ reservationItemId: "reservation-item-1" },
			deps,
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "permission-denied",
			},
		});
		expect(calls).toHaveLength(0);
	});

	it("rejects ineligible reservation or reservation item statuses", async () => {
		const byReservation = await checkInReservationItem(
			receptionistSession,
			{ reservationItemId: "reservation-item-1" },
			createDeps({ reservations: [buildReservation({ status: "pending" })] })
				.deps,
		);
		expect(byReservation).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "reservation-not-check-in-eligible",
			},
		});

		const byItem = await checkInReservationItem(
			receptionistSession,
			{ reservationItemId: "reservation-item-1" },
			createDeps({
				reservation_items: [buildReservationItem({ status: "pending" })],
			}).deps,
		);
		expect(byItem).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "reservation-item-not-check-in-eligible",
			},
		});
	});

	it.each([
		["before planned check-in", "2026-08-09T12:00:00Z"],
		["on planned check-out", "2026-08-12T00:00:00Z"],
	])("rejects check-in %s", async (_label, actualCheckInAt) => {
		const result = await checkInReservationItem(
			receptionistSession,
			{ reservationItemId: "reservation-item-1", actualCheckInAt },
			createDeps().deps,
		);
		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "check-in-outside-planned-window",
			},
		});
	});

	it("rejects malformed actual check-in timestamps before mutating data", async () => {
		const { deps, data } = createDeps();

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10-not-a-timestamp",
			},
			deps,
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "invalid-actual-check-in-at",
			},
		});
		expect(data.stays).toHaveLength(0);
		expect(data.reservation_items[0]?.status).toBe("confirmed");
		expect(data.rooms[0]?.state).toBe("available");
	});

	it("rejects missing assigned room and explicit room mismatch", async () => {
		const missingAssignedRoom = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			createDeps({
				reservation_items: [buildReservationItem({ room_id: null })],
			}).deps,
		);
		expect(missingAssignedRoom).toEqual({
			ok: false,
			error: { code: "validation-error", message: "assigned-room-required" },
		});

		const mismatch = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				roomId: "room-2",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			createDeps().deps,
		);
		expect(mismatch).toEqual({
			ok: false,
			error: { code: "validation-error", message: "room-assignment-mismatch" },
		});
	});

	it("rejects cross-property reservation item without mutating data", async () => {
		const { deps, data } = createDeps({
			reservation_items: [buildReservationItem({ property_id: "property-2" })],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{ reservationItemId: "reservation-item-1" },
			deps,
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		});
		expect(data.stays).toHaveLength(0);
		expect(data.reservations[0]?.status).toBe("confirmed");
		expect(data.rooms[0]?.state).toBe("available");
	});

	it("rejects cross-property parent reservation without mutating data", async () => {
		const { deps, data } = createDeps({
			reservations: [buildReservation({ property_id: "property-2" })],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{ reservationItemId: "reservation-item-1" },
			deps,
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		});
		expect(data.stays).toHaveLength(0);
		expect(data.reservation_items[0]?.status).toBe("confirmed");
		expect(data.rooms[0]?.state).toBe("available");
	});

	it("rejects cross-property room without mutating data", async () => {
		const { deps, data } = createDeps({
			rooms: [buildRoom({ property_id: "property-2" })],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			deps,
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		});
		expect(data.stays).toHaveLength(0);
		expect(data.reservation_items[0]?.status).toBe("confirmed");
		expect(data.reservations[0]?.status).toBe("confirmed");
	});

	it("rejects room type mismatch", async () => {
		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			createDeps({ rooms: [buildRoom({ room_type_id: "room-type-2" })] }).deps,
		);
		expect(result).toEqual({
			ok: false,
			error: { code: "validation-error", message: "room-type-mismatch" },
		});
	});

	it.each([
		"occupied",
		"cleaning",
		"maintenance",
		"inactive",
	] as const)("rejects non-assignable room state %s", async (state) => {
		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			createDeps({ rooms: [buildRoom({ state })] }).deps,
		);
		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "room-not-assignable-for-check-in",
			},
		});
	});

	it("sets a multi-item reservation to partially checked in when siblings remain confirmed", async () => {
		const { deps, data } = createDeps({
			reservation_items: [
				buildReservationItem(),
				buildReservationItem({ id: "reservation-item-2", room_id: "room-2" }),
			],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			deps,
		);
		expect(result.ok ? result.data.reservation.status : "failed").toBe(
			"partially_checked_in",
		);
		expect(data.reservation_items[0]?.status).toBe("checked_in");
		expect(data.reservation_items[1]?.status).toBe("confirmed");
	});

	it("sets a multi-item reservation to checked in when the final eligible item arrives", async () => {
		const { deps } = createDeps({
			reservations: [buildReservation({ status: "partially_checked_in" })],
			reservation_items: [
				buildReservationItem(),
				buildReservationItem({
					id: "reservation-item-2",
					room_id: "room-2",
					status: "checked_in",
				}),
			],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			deps,
		);

		expect(result.ok ? result.data.reservation.status : "failed").toBe(
			"checked_in",
		);
	});

	it("ignores cancelled and no-show siblings when deriving full check-in status", async () => {
		const { deps } = createDeps({
			reservation_items: [
				buildReservationItem(),
				buildReservationItem({
					id: "reservation-item-2",
					room_id: "room-2",
					status: "cancelled",
				}),
				buildReservationItem({
					id: "reservation-item-3",
					room_id: "room-3",
					status: "no_show",
				}),
			],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			deps,
		);

		expect(result.ok ? result.data.reservation.status : "failed").toBe(
			"checked_in",
		);
	});

	it("returns a retry-safe existing check-in without inserting another stay", async () => {
		const { deps, data, calls } = createDeps({
			reservations: [buildReservation({ status: "checked_in" })],
			reservation_items: [buildReservationItem({ status: "checked_in" })],
			rooms: [buildRoom({ state: "occupied" })],
			stays: [buildStay({ status: "active" })],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			deps,
		);

		expect(result.ok ? result.data.stay.id : "failed").toBe("stay-1");
		expect(data.stays).toHaveLength(1);
		expect(
			calls.some(
				(call) => call.table === "stays" && call.operation === "insert",
			),
		).toBe(false);
	});

	it("rejects retry attempts outside the planned stay window", async () => {
		const { deps } = createDeps({
			reservations: [buildReservation({ status: "checked_in" })],
			reservation_items: [buildReservationItem({ status: "checked_in" })],
			rooms: [buildRoom({ state: "occupied" })],
			stays: [buildStay({ status: "active" })],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-12T12:00:00Z",
			},
			deps,
		);

		expect(result.ok).toBe(false);
		expect(result.ok ? null : result.error.message).toBe(
			"check-in-outside-planned-window",
		);
	});

	it("rejects conflicting existing stay data without creating a duplicate", async () => {
		const { deps, calls } = createDeps({
			stays: [buildStay({ room_id: "room-2", status: "active" })],
		});

		const result = await checkInReservationItem(
			receptionistSession,
			{
				reservationItemId: "reservation-item-1",
				actualCheckInAt: "2026-08-10T12:00:00Z",
			},
			deps,
		);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "conflicting-stay-for-reservation-item",
			},
		});
		expect(
			calls.some(
				(call) => call.table === "stays" && call.operation === "insert",
			),
		).toBe(false);
	});
});
