import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppSession } from "../../auth/types";
import type {
	Reservation,
	ReservationCreateData,
	ReservationListResult,
	ReservationPurgeResult,
} from "../types";

type QueryResult<T = unknown> = {
	readonly data: T | null;
	readonly error: unknown;
	readonly count?: number | null;
};

class FakeQuery<T = unknown> implements PromiseLike<QueryResult<T>> {
	readonly table: string;
	readonly operation: "select" | "insert" | "update" | "delete";
	readonly eqCalls: Array<{ column: string; value: unknown }> = [];
	readonly isCalls: Array<{ column: string; value: unknown }> = [];
	readonly neqCalls: Array<{ column: string; value: unknown }> = [];
	readonly inCalls: Array<{ column: string; values: unknown[] }> = [];
	readonly rangeCalls: Array<{ from: number; to: number }> = [];
	readonly orderCalls: Array<{ column: string; options?: unknown }> = [];
	readonly orCalls: string[] = [];
	readonly ltCalls: Array<{ column: string; value: unknown }> = [];
	readonly gtCalls: Array<{ column: string; value: unknown }> = [];
	readonly payload?: unknown;
	private readonly result: QueryResult<T>;

	constructor(args: {
		table: string;
		operation: "select" | "insert" | "update" | "delete";
		result: QueryResult<T>;
		payload?: unknown;
	}) {
		this.table = args.table;
		this.operation = args.operation;
		this.result = args.result;
		this.payload = args.payload;
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

	range(from: number, to: number): this {
		this.rangeCalls.push({ from, to });
		return this;
	}

	order(column: string, options?: unknown): this {
		this.orderCalls.push({ column, options });
		return this;
	}

	or(expression: string): this {
		this.orCalls.push(expression);
		return this;
	}

	lt(column: string, value: unknown): this {
		this.ltCalls.push({ column, value });
		return this;
	}

	gt(column: string, value: unknown): this {
		this.gtCalls.push({ column, value });
		return this;
	}

	select(): this {
		return this;
	}

	then<TResult>(
		onfulfilled?:
			| ((value: QueryResult<T>) => TResult | PromiseLike<TResult>)
			| null,
	): Promise<TResult> {
		return Promise.resolve(this.result).then(onfulfilled as never);
	}
}

type Plan = {
	readonly select?: QueryResult;
	readonly insert?: QueryResult;
	readonly update?: QueryResult;
	readonly delete?: QueryResult;
};

function createDeps(plans: Record<string, Plan>) {
	const calls: FakeQuery[] = [];
	return {
		deps: {
			from: (table: string) => ({
				select: (_columns: string, _options?: unknown) => {
					const query = new FakeQuery({
						table,
						operation: "select",
						result: plans[table]?.select ?? { data: [], error: null, count: 0 },
					});
					calls.push(query);
					return query;
				},
				insert: (payload: unknown) => {
					const query = new FakeQuery({
						table,
						operation: "insert",
						result: plans[table]?.insert ?? { data: null, error: null },
						payload,
					});
					calls.push(query);
					return query;
				},
				update: (payload: unknown) => {
					const query = new FakeQuery({
						table,
						operation: "update",
						result: plans[table]?.update ?? { data: null, error: null },
						payload,
					});
					calls.push(query);
					return query;
				},
				delete: () => {
					const query = new FakeQuery({
						table,
						operation: "delete",
						result: plans[table]?.delete ?? { data: null, error: null },
					});
					calls.push(query);
					return query;
				},
			}),
		},
		calls,
	};
}

const sessionByRole = (role: AppSession["profile"]["role"]): AppSession => ({
	user: { id: `user-${role}`, email: `${role}@innhub.test` },
	profile: {
		id: `profile-${role}`,
		authUserId: `user-${role}`,
		propertyId: "property-1",
		role,
		status: "active",
	},
	propertyId: "property-1",
});

afterEach(() => {
	vi.restoreAllMocks();
});

const sampleReservation: Reservation = {
	id: "res-1",
	property_id: "property-1",
	primary_guest_id: "guest-1",
	planned_check_in_date: "2026-08-10",
	planned_check_out_date: "2026-08-12",
	status: "confirmed",
	notes: null,
	created_at: "2026-08-01T00:00:00Z",
	updated_at: "2026-08-01T00:00:00Z",
	deleted_at: null,
};

describe("reservationService list/listTrash", () => {
	it("scopes active list by property and uses deleted_at is null", async () => {
		const { list } = await import("../reservationService");
		const { deps, calls } = createDeps({
			reservations: {
				select: { data: [sampleReservation], error: null, count: 1 },
			},
		});
		const result = await list(sessionByRole("receptionist"), { page: 1 }, deps);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect((result.data as ReservationListResult).total).toBe(1);
		}
		const selectCall = calls.find(
			(c) => c.table === "reservations" && c.operation === "select",
		);
		expect(selectCall?.eqCalls).toEqual(
			expect.arrayContaining([{ column: "property_id", value: "property-1" }]),
		);
		expect(selectCall?.isCalls).toEqual(
			expect.arrayContaining([{ column: "deleted_at", value: null }]),
		);
	});

	it("filters active list by date range, room, guest-name search and guest id", async () => {
		const { list } = await import("../reservationService");
		const { deps } = createDeps({
			reservations: {
				select: {
					data: [
						sampleReservation,
						{
							...sampleReservation,
							id: "res-2",
							primary_guest_id: "guest-2",
							planned_check_in_date: "2026-09-01",
							planned_check_out_date: "2026-09-03",
						},
					],
					error: null,
				},
			},
			reservation_items: {
				select: {
					data: [{ reservation_id: "res-2", room_id: "room-2" }],
					error: null,
				},
			},
			guests: {
				select: {
					data: [
						{ id: "guest-1", first_name: "Bob", last_name: "Stone" },
						{ id: "guest-2", first_name: "Alice", last_name: "Doe" },
					],
					error: null,
				},
			},
		});
		const result = await list(
			sessionByRole("receptionist"),
			{
				checkInFrom: "2026-09-01",
				checkInTo: "2026-09-30",
				room_id: "room-2",
				guest_id: "guest-2",
				search: "alice",
			},
			deps,
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.reservations).toHaveLength(1);
			expect(result.data.reservations[0]?.id).toBe("res-2");
		}
	});

	it("hydrates readable summaries across all reservation items", async () => {
		const { list } = await import("../reservationService");
		const { deps } = createDeps({
			reservations: {
				select: {
					data: [sampleReservation],
					error: null,
				},
			},
			reservation_items: {
				select: {
					data: [
						{
							reservation_id: "res-1",
							room_type_id: "rt-1",
							room_id: "room-1",
							guest_count: 2,
						},
						{
							reservation_id: "res-1",
							room_type_id: "rt-2",
							room_id: "room-2",
							guest_count: 1,
						},
					],
					error: null,
				},
			},
			guests: {
				select: {
					data: [{ id: "guest-1", first_name: "Ana", last_name: "Lopez" }],
					error: null,
				},
			},
			room_types: {
				select: {
					data: [
						{ id: "rt-1", name: "Standard" },
						{ id: "rt-2", name: "Suite" },
					],
					error: null,
				},
			},
			rooms: {
				select: {
					data: [
						{ id: "room-1", identifier: "101" },
						{ id: "room-2", identifier: "201" },
					],
					error: null,
				},
			},
		});
		const result = await list(sessionByRole("receptionist"), { page: 1 }, deps);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.reservations[0]?.item_summary).toBe(
				"101 · Standard, 201 · Suite",
			);
		}
	});

	it("lists trash with post-filter before pagination and no neq-null usage", async () => {
		const { listTrash } = await import("../reservationService");
		const { deps, calls } = createDeps({
			reservations: {
				select: {
					data: [
						sampleReservation,
						{
							...sampleReservation,
							id: "res-2",
							deleted_at: "2026-08-02T00:00:00Z",
						},
					],
					error: null,
					count: 2,
				},
			},
		});
		const result = await listTrash(
			sessionByRole("manager"),
			{ page: 1, pageSize: 1 },
			deps,
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.reservations).toHaveLength(1);
			expect(result.data.reservations[0]?.id).toBe("res-2");
			expect(result.data.total).toBe(1);
		}
		const selectCall = calls.find(
			(c) => c.table === "reservations" && c.operation === "select",
		);
		expect(selectCall?.neqCalls).toEqual([]);
	});
});

describe("reservationService create/update", () => {
	it("reuses availability validation when room is assigned on create", async () => {
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy.mockResolvedValue({ ok: true, data: undefined });

		const { create } = await import("../reservationService");
		const payload: ReservationCreateData = {
			primary_guest_id: "guest-1",
			planned_check_in_date: "2026-08-10",
			planned_check_out_date: "2026-08-12",
			room_type_id: "type-1",
			room_id: "room-1",
			guest_count: 2,
			notes: null,
		};
		const { deps } = createDeps({
			reservations: { insert: { data: [sampleReservation], error: null } },
			reservation_items: {
				insert: {
					data: [
						{
							id: "item-1",
							reservation_id: "res-1",
							room_type_id: "type-1",
							room_id: "room-1",
							guest_count: 2,
							status: "confirmed",
						},
					],
					error: null,
				},
			},
		});

		const result = await create(sessionByRole("receptionist"), payload, deps);
		expect(result.ok).toBe(true);
		expect(availabilitySpy).toHaveBeenCalled();
	});

	it("rejects create when no reservation items are provided", async () => {
		const { create } = await import("../reservationService");
		const result = await create(
			sessionByRole("receptionist"),
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [],
				notes: null,
			},
			createDeps({}).deps,
		);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("reservation-items-required");
		}
	});

	it("rejects create when submitted items assign the same room twice", async () => {
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy.mockResolvedValue({ ok: true, data: undefined });
		const { create } = await import("../reservationService");
		const result = await create(
			sessionByRole("receptionist"),
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 2 },
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 1 },
				],
				notes: null,
			},
			createDeps({}).deps,
		);
		expect(result.ok).toBe(false);
		expect(availabilitySpy).not.toHaveBeenCalled();
		if (!result.ok) {
			expect(result.error.message).toContain("duplicate-assigned-room");
		}
	});

	it("creates reservation with multiple reservation items", async () => {
		const availabilityModule = await import("../reservationAvailability");
		vi.spyOn(availabilityModule, "validateRoomAvailability").mockResolvedValue({
			ok: true,
			data: undefined,
		});
		const { create } = await import("../reservationService");
		const { deps, calls } = createDeps({
			reservations: { insert: { data: [sampleReservation], error: null } },
			reservation_items: {
				insert: { data: [{ id: "item-1" }, { id: "item-2" }], error: null },
			},
		});
		const result = await create(
			sessionByRole("receptionist"),
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 2 },
					{ room_type_id: "type-2", room_id: null, guest_count: 1 },
				],
				notes: "multi",
			},
			deps,
		);
		expect(result.ok).toBe(true);
		const itemInsertCall = calls.find(
			(c) => c.table === "reservation_items" && c.operation === "insert",
		);
		expect(itemInsertCall?.payload).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					room_type_id: "type-1",
					room_id: "room-1",
					guest_count: 2,
				}),
				expect.objectContaining({
					room_type_id: "type-2",
					room_id: null,
					guest_count: 1,
				}),
			]),
		);
	});

	it("rejects update when submitted items assign the same room twice", async () => {
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy.mockResolvedValue({ ok: true, data: undefined });
		const { update } = await import("../reservationService");
		const result = await update(
			sessionByRole("receptionist"),
			"res-1",
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 2 },
					{ room_type_id: "type-2", room_id: "room-1", guest_count: 1 },
				],
				notes: null,
			},
			createDeps({
				reservations: {
					select: { data: [sampleReservation], error: null },
				},
			}).deps,
		);
		expect(result.ok).toBe(false);
		expect(availabilitySpy).not.toHaveBeenCalled();
		if (!result.ok) {
			expect(result.error.message).toContain("duplicate-assigned-room");
		}
	});

	it("replaces reservation items on edit with multi-item payload", async () => {
		const availabilityModule = await import("../reservationAvailability");
		vi.spyOn(availabilityModule, "validateRoomAvailability").mockResolvedValue({
			ok: true,
			data: undefined,
		});
		const { update } = await import("../reservationService");
		const { deps, calls } = createDeps({
			reservations: {
				select: { data: [sampleReservation], error: null },
				update: { data: [sampleReservation], error: null },
			},
			reservation_items: {
				delete: { data: null, error: null },
				insert: { data: [{ id: "item-1" }, { id: "item-2" }], error: null },
			},
		});
		const result = await update(
			sessionByRole("receptionist"),
			"res-1",
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-2", room_id: "room-2", guest_count: 3 },
					{ room_type_id: "type-1", room_id: null, guest_count: 1 },
				],
				notes: "updated",
			},
			deps,
		);
		expect(result.ok).toBe(true);
		const deleteCall = calls.find(
			(c) => c.table === "reservation_items" && c.operation === "delete",
		);
		expect(deleteCall?.eqCalls).toEqual(
			expect.arrayContaining([{ column: "reservation_id", value: "res-1" }]),
		);
		const itemInsertCall = calls.find(
			(c) => c.table === "reservation_items" && c.operation === "insert",
		);
		expect(itemInsertCall?.payload).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					room_type_id: "type-2",
					room_id: "room-2",
					guest_count: 3,
				}),
				expect.objectContaining({
					room_type_id: "type-1",
					room_id: null,
					guest_count: 1,
				}),
			]),
		);
	});

	it("fails create when one assigned item conflicts even if other items are valid", async () => {
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy
			.mockResolvedValueOnce({ ok: true, data: undefined })
			.mockResolvedValueOnce({
				ok: false,
				error: {
					code: "validation-error",
					message: "room-not-available",
				},
			});
		const { create } = await import("../reservationService");
		const result = await create(
			sessionByRole("receptionist"),
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 2 },
					{ room_type_id: "type-2", room_id: "room-2", guest_count: 1 },
				],
				notes: null,
			},
			createDeps({}).deps,
		);
		expect(result.ok).toBe(false);
		expect(availabilitySpy).toHaveBeenCalledTimes(2);
		if (!result.ok) {
			expect(result.error.message).toContain("room-not-available");
		}
	});

	it("allows different assigned rooms and unassigned items in the same reservation", async () => {
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy.mockResolvedValue({ ok: true, data: undefined });
		const { create } = await import("../reservationService");
		const { deps } = createDeps({
			reservations: { insert: { data: [sampleReservation], error: null } },
			reservation_items: { insert: { data: [{ id: "item-1" }], error: null } },
		});
		const result = await create(
			sessionByRole("receptionist"),
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 2 },
					{ room_type_id: "type-2", room_id: null, guest_count: 1 },
					{ room_type_id: "type-2", room_id: "room-2", guest_count: 1 },
				],
				notes: null,
			},
			deps,
		);
		expect(result.ok).toBe(true);
		expect(availabilitySpy).toHaveBeenCalledTimes(2);
		expect(availabilitySpy).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.objectContaining({ roomId: "room-1" }),
		);
		expect(availabilitySpy).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			expect.objectContaining({ roomId: "room-2" }),
		);
	});

	it("validates availability only for assigned item rooms", async () => {
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy.mockResolvedValue({ ok: true, data: undefined });
		const { create } = await import("../reservationService");
		const { deps } = createDeps({
			reservations: { insert: { data: [sampleReservation], error: null } },
			reservation_items: { insert: { data: [{ id: "item-1" }], error: null } },
		});
		const result = await create(
			sessionByRole("receptionist"),
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 2 },
					{ room_type_id: "type-2", room_id: null, guest_count: 1 },
				],
				notes: null,
			},
			deps,
		);
		expect(result.ok).toBe(true);
		expect(availabilitySpy).toHaveBeenCalledTimes(1);
		expect(availabilitySpy).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ roomId: "room-1" }),
		);
	});

	it("preserves property scoping when replacing edited reservation items", async () => {
		const availabilityModule = await import("../reservationAvailability");
		vi.spyOn(availabilityModule, "validateRoomAvailability").mockResolvedValue({
			ok: true,
			data: undefined,
		});
		const { update } = await import("../reservationService");
		const { deps, calls } = createDeps({
			reservations: {
				select: { data: [sampleReservation], error: null },
				update: { data: [sampleReservation], error: null },
			},
			reservation_items: {
				delete: { data: [{ id: "old-item" }], error: null },
				insert: { data: [{ id: "new-item" }], error: null },
			},
		});
		const result = await update(
			sessionByRole("receptionist"),
			"res-1",
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				reservation_items: [
					{ room_type_id: "type-1", room_id: "room-1", guest_count: 2 },
				],
				notes: null,
			},
			deps,
		);
		expect(result.ok).toBe(true);
		const itemInsertCall = calls.find(
			(c) => c.table === "reservation_items" && c.operation === "insert",
		);
		expect(itemInsertCall?.payload).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					property_id: "property-1",
					reservation_id: "res-1",
				}),
			]),
		);
	});

	it("blocks edit for non-editable status", async () => {
		const { update } = await import("../reservationService");
		const { deps } = createDeps({
			reservations: {
				select: {
					data: [{ ...sampleReservation, status: "checked_in" }],
					error: null,
				},
			},
		});
		const result = await update(
			sessionByRole("receptionist"),
			"res-1",
			{
				primary_guest_id: "guest-1",
				planned_check_in_date: "2026-08-10",
				planned_check_out_date: "2026-08-12",
				room_type_id: "type-1",
				room_id: "room-1",
				guest_count: 2,
				notes: null,
			},
			deps,
		);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe("validation-error");
		}
	});
});

describe("reservationService lifecycle guards", () => {
	it("soft delete requires manager role", async () => {
		const { softDelete } = await import("../reservationService");
		const result = await softDelete(
			sessionByRole("receptionist"),
			"res-1",
			createDeps({}).deps,
		);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("permission");
		}
	});

	it("soft delete blocks active check-in reservation and linked active stays", async () => {
		const { softDelete } = await import("../reservationService");
		const byStatusDeps = createDeps({
			reservations: {
				select: {
					data: [{ ...sampleReservation, status: "checked_in" }],
					error: null,
				},
			},
		});
		const byStatus = await softDelete(
			sessionByRole("manager"),
			"res-1",
			byStatusDeps.deps,
		);
		expect(byStatus.ok).toBe(false);

		const byStayDeps = createDeps({
			reservations: {
				select: {
					data: [{ ...sampleReservation, status: "confirmed" }],
					error: null,
				},
			},
			reservation_items: {
				select: {
					data: [{ id: "item-1", reservation_id: "res-1" }],
					error: null,
				},
			},
			stays: {
				select: {
					data: [
						{ id: "stay-1", reservation_item_id: "item-1", status: "active" },
					],
					error: null,
				},
			},
		});
		const byStay = await softDelete(
			sessionByRole("manager"),
			"res-1",
			byStayDeps.deps,
		);
		expect(byStay.ok).toBe(false);
		if (!byStay.ok) {
			expect(byStay.error.message).toContain("active-check-in");
		}
	});

	it("restore requires archived record and manager+", async () => {
		const { restore } = await import("../reservationService");
		const { deps } = createDeps({
			reservations: { select: { data: [sampleReservation], error: null } },
		});
		const result = await restore(sessionByRole("manager"), "res-1", deps);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe("not-found");
		}
	});

	it("restore rejects archived reservations when any later assigned item conflicts", async () => {
		const { restore } = await import("../reservationService");
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy
			.mockResolvedValueOnce({ ok: true, data: undefined })
			.mockResolvedValueOnce({
				ok: false,
				error: {
					code: "validation-error",
					message: "room-not-available-for-requested-dates",
				},
			});
		const archivedReservation = {
			...sampleReservation,
			deleted_at: "2026-08-01T00:00:00Z",
		};
		const { deps } = createDeps({
			reservations: {
				select: { data: [archivedReservation], error: null },
				update: {
					data: [{ ...archivedReservation, deleted_at: null }],
					error: null,
				},
			},
			reservation_items: {
				select: {
					data: [
						{ id: "item-1", reservation_id: "res-1", room_id: "room-1" },
						{ id: "item-2", reservation_id: "res-1", room_id: "room-2" },
					],
					error: null,
				},
			},
		});
		const result = await restore(sessionByRole("manager"), "res-1", deps);
		expect(result.ok).toBe(false);
		expect(availabilitySpy).toHaveBeenCalledTimes(2);
		expect(availabilitySpy).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			expect.objectContaining({
				roomId: "room-2",
				excludeReservationId: "res-1",
				excludeReservationItemId: "item-2",
			}),
		);
	});

	it("restore ignores unassigned reservation items", async () => {
		const { restore } = await import("../reservationService");
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy.mockResolvedValue({ ok: true, data: undefined });
		const archivedReservation = {
			...sampleReservation,
			deleted_at: "2026-08-01T00:00:00Z",
		};
		const { deps } = createDeps({
			reservations: {
				select: { data: [archivedReservation], error: null },
				update: {
					data: [{ ...archivedReservation, deleted_at: null }],
					error: null,
				},
			},
			reservation_items: {
				select: {
					data: [
						{ id: "item-1", reservation_id: "res-1", room_id: null },
						{ id: "item-2", reservation_id: "res-1", room_id: null },
					],
					error: null,
				},
			},
		});
		const result = await restore(sessionByRole("manager"), "res-1", deps);
		expect(result.ok).toBe(true);
		expect(availabilitySpy).not.toHaveBeenCalled();
	});

	it("restore validates every assigned room before reactivating an archived reservation", async () => {
		const { restore } = await import("../reservationService");
		const availabilityModule = await import("../reservationAvailability");
		const availabilitySpy = vi.spyOn(
			availabilityModule,
			"validateRoomAvailability",
		);
		availabilitySpy.mockResolvedValue({ ok: true, data: undefined });
		const archivedReservation = {
			...sampleReservation,
			deleted_at: "2026-08-01T00:00:00Z",
		};
		const { deps } = createDeps({
			reservations: {
				select: { data: [archivedReservation], error: null },
				update: {
					data: [{ ...archivedReservation, deleted_at: null }],
					error: null,
				},
			},
			reservation_items: {
				select: {
					data: [
						{ id: "item-1", reservation_id: "res-1", room_id: "room-1" },
						{ id: "item-2", reservation_id: "res-1", room_id: "room-2" },
						{ id: "item-3", reservation_id: "res-1", room_id: null },
					],
					error: null,
				},
			},
		});
		const result = await restore(sessionByRole("manager"), "res-1", deps);
		expect(result.ok).toBe(true);
		expect(availabilitySpy).toHaveBeenCalledTimes(2);
		expect(availabilitySpy).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.objectContaining({
				roomId: "room-1",
				excludeReservationId: "res-1",
				excludeReservationItemId: "item-1",
			}),
		);
		expect(availabilitySpy).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			expect.objectContaining({
				roomId: "room-2",
				excludeReservationId: "res-1",
				excludeReservationItemId: "item-2",
			}),
		);
	});

	it("restore fails closed when reservation item loading fails", async () => {
		const { restore } = await import("../reservationService");
		const archivedReservation = {
			...sampleReservation,
			deleted_at: "2026-08-01T00:00:00Z",
		};
		const { deps, calls } = createDeps({
			reservations: {
				select: { data: [archivedReservation], error: null },
				update: {
					data: [{ ...archivedReservation, deleted_at: null }],
					error: null,
				},
			},
			reservation_items: {
				select: {
					data: null,
					error: { message: "backend exploded" },
				},
			},
		});
		const result = await restore(sessionByRole("manager"), "res-1", deps);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe("backend-error");
		}
		expect(
			calls.some(
				(call) => call.table === "reservations" && call.operation === "update",
			),
		).toBe(false);
	});

	it("purge is admin-only and reports blocker counts", async () => {
		const { purge } = await import("../reservationService");
		const managerDenied = await purge(
			sessionByRole("manager"),
			"res-1",
			createDeps({}).deps,
		);
		expect(managerDenied.ok).toBe(false);

		const activeDeps = createDeps({
			reservations: { select: { data: [sampleReservation], error: null } },
		});
		const activePurge = await purge(
			sessionByRole("administrator"),
			"res-1",
			activeDeps.deps,
		);
		expect(activePurge.ok).toBe(false);
		if (!activePurge.ok) {
			expect(activePurge.error.message).toContain("archived");
		}

		const { deps, calls } = createDeps({
			reservations: {
				select: {
					data: [{ ...sampleReservation, deleted_at: "2026-08-01T00:00:00Z" }],
					error: null,
				},
			},
			invoices: {
				select: { data: [{ id: "inv-1" }], error: null, count: 1 },
			},
			payments: {
				select: { data: [{ id: "pay-1" }], error: null, count: 1 },
			},
		});
		const blocked = await purge(sessionByRole("administrator"), "res-1", deps);
		expect(blocked.ok).toBe(false);
		if (!blocked.ok) {
			expect(blocked.error.code).toBe("foreign-key-conflict");
			expect(blocked.error.message).toContain("invoiceCount=1");
		}
		const paymentSelectCall = calls.find(
			(c) => c.table === "payments" && c.operation === "select",
		);
		expect(paymentSelectCall?.inCalls).toEqual(
			expect.arrayContaining([{ column: "invoice_id", values: ["inv-1"] }]),
		);

		const emptyDeps = createDeps({
			reservations: {
				select: {
					data: [{ ...sampleReservation, deleted_at: "2026-08-01T00:00:00Z" }],
					error: null,
				},
				delete: {
					data: [{ ...sampleReservation, deleted_at: "2026-08-01T00:00:00Z" }],
					error: null,
				},
			},
			invoices: { select: { data: [], error: null, count: 0 } },
			payments: { select: { data: [], error: null, count: 0 } },
		});
		const purged = await purge(
			sessionByRole("administrator"),
			"res-1",
			emptyDeps.deps,
		);
		expect(purged.ok).toBe(true);
		if (purged.ok) {
			expect(
				(purged.data as ReservationPurgeResult).blockers.invoiceCount,
			).toBe(0);
		}
	});
});
