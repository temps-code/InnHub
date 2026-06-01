import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";

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
	readonly gteCalls: Array<{ column: string; value: unknown }> = [];
	readonly rangeCalls: Array<{ from: number; to: number }> = [];
	readonly orderCalls: Array<{ column: string; options?: unknown }> = [];
	readonly orCalls: string[] = [];
	readonly ilikeCalls: Array<{ column: string; value: string }> = [];
	readonly selectCalls: Array<{ columns?: string; options?: unknown }> = [];
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

	gte(column: string, value: unknown): this {
		this.gteCalls.push({ column, value });
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

	ilike(column: string, value: string): this {
		this.ilikeCalls.push({ column, value });
		return this;
	}

	select(columns?: string, options?: unknown): this {
		this.selectCalls.push({ columns, options });
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
				select: (columns: string) => {
					const query = new FakeQuery({
						table,
						operation: "select",
						result: plans[table]?.select ?? { data: [], error: null, count: 0 },
					});
					query.select(columns, undefined);
					calls.push(query);
					return query;
				},
				insert: (data: unknown) => {
					const query = new FakeQuery({
						table,
						operation: "insert",
						result: plans[table]?.insert ?? { data: null, error: null },
						payload: data,
					});
					calls.push(query);
					return query;
				},
				update: (data: unknown) => {
					const query = new FakeQuery({
						table,
						operation: "update",
						result: plans[table]?.update ?? { data: null, error: null },
						payload: data,
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

function findCall(
	calls: FakeQuery[],
	table: string,
	operation: FakeQuery["operation"],
) {
	const call = calls.find(
		(c) => c.table === table && c.operation === operation,
	);
	expect(call, `${table}:${operation} call should exist`).toBeDefined();
	return call!;
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

const sampleGuest = {
	id: "guest-1",
	property_id: "property-1",
	first_name: "James",
	last_name: "Davis",
	document_type: "passport",
	document_number: "A123",
	email: "james@example.com",
	phone: "+1 555",
	notes: null,
	created_at: "2026-01-01T00:00:00Z",
	updated_at: "2026-01-01T00:00:00Z",
	deleted_at: null,
};

describe("guestFormSchema", () => {
	it("requires document fields, normalizes blanks, and validates non-empty email", async () => {
		const { guestFormSchema } = await import("../types");

		const parsed = guestFormSchema.parse({
			first_name: " James ",
			last_name: " Davis ",
			document_type: " passport ",
			document_number: " A-123 ",
			email: "",
			phone: "",
			notes: "",
		});

		expect(parsed).toEqual({
			first_name: "James",
			last_name: "Davis",
			document_type: "passport",
			document_number: "A-123",
			email: null,
			phone: null,
			notes: null,
		});
		expect(
			guestFormSchema.safeParse({
				first_name: "a",
				last_name: "b",
				document_type: "",
				document_number: "",
				email: "ok@example.com",
			}).success,
		).toBe(false);
		expect(
			guestFormSchema.safeParse({
				first_name: "a",
				last_name: "b",
				document_type: "passport",
				document_number: "A1",
				email: "bad",
			}).success,
		).toBe(false);
	});
});

describe("list", () => {
	it("scopes by property, excludes deleted, applies pagination/search metadata", async () => {
		const { list } = await import("../guestService");
		const { deps, calls } = createDeps({
			guests: {
				select: { data: [sampleGuest], error: null, count: 34 },
			},
		});

		const result = await list(
			sessionByRole("receptionist"),
			{ search: "jam", page: 2 },
			deps,
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.pageSize).toBe(20);
			expect(result.data.page).toBe(2);
			expect(result.data.total).toBe(1);
			expect(result.data.guests).toEqual([]);
		}

		const selectCall = findCall(calls, "guests", "select");
		expect(selectCall.eqCalls).toEqual(
			expect.arrayContaining([{ column: "property_id", value: "property-1" }]),
		);
		expect(selectCall.isCalls).toEqual(
			expect.arrayContaining([{ column: "deleted_at", value: null }]),
		);
		expect(selectCall.orCalls.length).toBeGreaterThan(0);
	});

	it("applies withOpenReservations activity filter using scoped reservation guard query", async () => {
		const { list } = await import("../guestService");
		const withOpenGuest = { ...sampleGuest, id: "guest-open" };
		const closedGuest = { ...sampleGuest, id: "guest-closed" };
		const { deps, calls } = createDeps({
			reservations: {
				select: {
					data: [
						{
							id: "res-1",
							primary_guest_id: "guest-open",
							status: "confirmed",
							planned_check_out_date: "2999-01-01",
						},
					],
					error: null,
				},
			},
			guests: {
				select: {
					data: [withOpenGuest, closedGuest],
					error: null,
					count: 2,
				},
			},
		});

		const result = await list(
			sessionByRole("receptionist"),
			{ activity: "withOpenReservations", page: 1, pageSize: 20 },
			deps,
		);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.guests.map((guest) => guest.id)).toEqual([
				"guest-open",
			]);
			expect(result.data.total).toBe(1);
		}

		const reservationsCall = findCall(calls, "reservations", "select");
		expect(reservationsCall.eqCalls).toEqual(
			expect.arrayContaining([{ column: "property_id", value: "property-1" }]),
		);
		expect(reservationsCall.isCalls).toEqual(
			expect.arrayContaining([{ column: "deleted_at", value: null }]),
		);
		expect(reservationsCall.inCalls).toEqual(
			expect.arrayContaining([
				{ column: "status", values: ["pending", "confirmed", "checked_in"] },
			]),
		);
		expect(reservationsCall.gteCalls).toEqual(
			expect.arrayContaining([
				{ column: "planned_check_out_date", value: expect.any(String) },
			]),
		);
	});

	it("applies withoutOpenReservations activity filter", async () => {
		const { list } = await import("../guestService");
		const withOpenGuest = { ...sampleGuest, id: "guest-open" };
		const closedGuest = { ...sampleGuest, id: "guest-closed" };
		const { deps } = createDeps({
			reservations: {
				select: {
					data: [{ id: "res-1", primary_guest_id: "guest-open" }],
					error: null,
				},
			},
			guests: {
				select: {
					data: [withOpenGuest, closedGuest],
					error: null,
					count: 2,
				},
			},
		});

		const result = await list(
			sessionByRole("receptionist"),
			{ activity: "withoutOpenReservations" },
			deps,
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.guests.map((guest) => guest.id)).toEqual([
				"guest-closed",
			]);
			expect(result.data.total).toBe(1);
		}
	});
});

describe("listTrash", () => {
	it("applies activity filters in trash mode while preserving deleted scope", async () => {
		const { listTrash } = await import("../guestService");
		const trashedOpen = {
			...sampleGuest,
			id: "guest-open",
			deleted_at: "2026-01-03T00:00:00Z",
		};
		const trashedClosed = {
			...sampleGuest,
			id: "guest-closed",
			deleted_at: "2026-01-04T00:00:00Z",
		};
		const { deps, calls } = createDeps({
			reservations: {
				select: {
					data: [{ id: "res-open", primary_guest_id: "guest-open" }],
					error: null,
				},
			},
			guests: {
				select: {
					data: [trashedOpen, trashedClosed],
					error: null,
					count: 2,
				},
			},
		});
		const result = await listTrash(
			sessionByRole("manager"),
			{ activity: "withoutOpenReservations" },
			deps,
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.guests.map((guest) => guest.id)).toEqual([
				"guest-closed",
			]);
		}
		const selectCall = findCall(calls, "guests", "select");
		expect(selectCall.neqCalls).toEqual([]);
		expect(selectCall.isCalls).toEqual([]);
	});

	it("requires manager+ and filters trashed records in memory", async () => {
		const { listTrash } = await import("../guestService");
		const unauthorized = await listTrash(
			sessionByRole("receptionist"),
			{},
			createDeps({ guests: { select: { data: [], error: null } } }).deps,
		);
		expect(unauthorized).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});

		const { deps, calls } = createDeps({
			guests: {
				select: {
					data: [
						{
							...sampleGuest,
							id: "guest-a",
							deleted_at: "2026-01-02T00:00:00Z",
						},
						{ ...sampleGuest, id: "guest-b", deleted_at: null },
					],
					error: null,
					count: 2,
				},
			},
		});
		const authorized = await listTrash(sessionByRole("manager"), {}, deps);
		expect(authorized.ok).toBe(true);
		if (authorized.ok) {
			expect(authorized.data.guests.map((guest) => guest.id)).toEqual([
				"guest-a",
			]);
			expect(authorized.data.total).toBe(1);
		}
		const selectCall = findCall(calls, "guests", "select");
		expect(selectCall.neqCalls).toEqual([]);
		expect(selectCall.isCalls).toEqual([]);
	});
});

describe("create and update", () => {
	it("create requires receptionist+, enforces ownership and update never sends property_id", async () => {
		const { create, update } = await import("../guestService");
		const payload = {
			first_name: "James",
			last_name: "Davis",
			document_type: "passport",
			document_number: "A123",
			email: "james@example.com",
			phone: "+1",
			notes: null,
		};

		const denied = await create(
			sessionByRole("housekeeping"),
			payload,
			createDeps({ guests: { insert: { data: sampleGuest, error: null } } })
				.deps,
		);
		expect(denied).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});

		const mismatch = await create(
			sessionByRole("receptionist"),
			{ ...payload, property_id: "other" } as never,
			createDeps({ guests: { insert: { data: sampleGuest, error: null } } })
				.deps,
		);
		expect(mismatch).toEqual({
			ok: false,
			error: {
				code: "property-scope-error",
				message: "A valid property scope is required.",
			},
		});

		const createHarness = createDeps({
			guests: { insert: { data: sampleGuest, error: null } },
		});
		const created = await create(
			sessionByRole("receptionist"),
			payload,
			createHarness.deps,
		);
		expect(created.ok).toBe(true);
		const insertCall = findCall(createHarness.calls, "guests", "insert");
		expect(insertCall.payload).toMatchObject({ property_id: "property-1" });

		const updateHarness = createDeps({
			guests: { update: { data: sampleGuest, error: null } },
		});
		const updated = await update(
			sessionByRole("receptionist"),
			"guest-1",
			{ ...payload, property_id: "property-1" } as never,
			updateHarness.deps,
		);
		expect(updated.ok).toBe(true);
		const updateCall = findCall(updateHarness.calls, "guests", "update");
		expect(updateCall.payload).not.toHaveProperty("property_id");
		expect(updateCall.eqCalls).toEqual(
			expect.arrayContaining([
				{ column: "property_id", value: "property-1" },
				{ column: "id", value: "guest-1" },
			]),
		);
		expect(updateCall.isCalls).toEqual(
			expect.arrayContaining([{ column: "deleted_at", value: null }]),
		);
	});
});

describe("softDelete", () => {
	it("blocks current/future active reservations and scopes reservation guard", async () => {
		const { softDelete } = await import("../guestService");
		const harness = createDeps({
			guests: {
				select: { data: sampleGuest, error: null },
				update: {
					data: [{ ...sampleGuest, deleted_at: "2026-01-02T00:00:00Z" }],
					error: null,
				},
			},
			reservations: {
				select: {
					data: [
						{
							id: "res-1",
							status: "confirmed",
							planned_check_out_date: "2999-01-01",
						},
					],
					error: null,
				},
			},
		});

		const blocked = await softDelete(
			sessionByRole("manager"),
			"guest-1",
			harness.deps,
		);
		expect(blocked).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "guest-has-active-or-future-reservations",
			},
		});

		const reservationCall = harness.calls.find(
			(c) => c.table === "reservations" && c.operation === "select",
		);
		expect(reservationCall?.eqCalls).toEqual(
			expect.arrayContaining([
				{ column: "property_id", value: "property-1" },
				{ column: "primary_guest_id", value: "guest-1" },
			]),
		);
		expect(reservationCall?.isCalls).toEqual(
			expect.arrayContaining([{ column: "deleted_at", value: null }]),
		);
		expect(reservationCall?.gteCalls).toEqual(
			expect.arrayContaining([
				{ column: "planned_check_out_date", value: expect.any(String) },
			]),
		);
		expect(reservationCall?.inCalls).toEqual(
			expect.arrayContaining([
				{ column: "status", values: ["pending", "confirmed", "checked_in"] },
			]),
		);
	});

	it("allows manager role and deletes when guard passes", async () => {
		const { softDelete } = await import("../guestService");
		const harness = createDeps({
			guests: {
				select: { data: sampleGuest, error: null },
				update: {
					data: [{ ...sampleGuest, deleted_at: "2026-01-02T00:00:00Z" }],
					error: null,
				},
			},
			reservations: { select: { data: [], error: null } },
		});
		const result = await softDelete(
			sessionByRole("manager"),
			"guest-1",
			harness.deps,
		);
		expect(result.ok).toBe(true);
	});

	it("does not block soft delete for past reservations outside current/future boundary", async () => {
		const { softDelete } = await import("../guestService");
		const harness = createDeps({
			guests: {
				select: { data: sampleGuest, error: null },
				update: {
					data: [{ ...sampleGuest, deleted_at: "2026-01-02T00:00:00Z" }],
					error: null,
				},
			},
			reservations: {
				select: {
					data: [
						{
							id: "res-old",
							status: "confirmed",
							planned_check_out_date: "2000-01-01",
						},
					],
					error: null,
				},
			},
		});
		const result = await softDelete(
			sessionByRole("manager"),
			"guest-1",
			harness.deps,
		);
		expect(result.ok).toBe(true);
	});
});

describe("restore", () => {
	it("requires manager+ and clears deleted_at for trashed guest only", async () => {
		const { restore } = await import("../guestService");
		const denied = await restore(
			sessionByRole("receptionist"),
			"guest-1",
			createDeps({ guests: { select: { data: sampleGuest, error: null } } })
				.deps,
		);
		expect(denied).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});

		const trashed = { ...sampleGuest, deleted_at: "2026-01-02T00:00:00Z" };
		const harness = createDeps({
			guests: {
				select: { data: trashed, error: null },
				update: { data: [{ ...trashed, deleted_at: null }], error: null },
			},
		});
		const restored = await restore(
			sessionByRole("manager"),
			"guest-1",
			harness.deps,
		);
		expect(restored.ok).toBe(true);
	});
});

describe("purge", () => {
	it("requires administrator, blocks on any reservation reference, and returns blocking count", async () => {
		const { purge } = await import("../guestService");
		const denied = await purge(
			sessionByRole("manager"),
			"guest-1",
			createDeps({ guests: { select: { data: sampleGuest, error: null } } })
				.deps,
		);
		expect(denied).toEqual({
			ok: false,
			error: { code: "validation-error", message: "permission-denied" },
		});

		const trashed = { ...sampleGuest, deleted_at: "2026-01-02T00:00:00Z" };
		const blockedHarness = createDeps({
			guests: { select: { data: trashed, error: null } },
			reservations: {
				select: { data: [{ id: "res-1" }, { id: "res-2" }], error: null },
			},
		});
		const blocked = await purge(
			sessionByRole("administrator"),
			"guest-1",
			blockedHarness.deps,
		);
		expect(blocked).toEqual({
			ok: false,
			error: {
				code: "foreign-key-conflict",
				message: "guest-has-reservation-references:2",
			},
		});

		const reservationCall = blockedHarness.calls.find(
			(c) => c.table === "reservations" && c.operation === "select",
		);
		expect(reservationCall?.eqCalls).toEqual(
			expect.arrayContaining([
				{ column: "property_id", value: "property-1" },
				{ column: "primary_guest_id", value: "guest-1" },
			]),
		);
	});

	it("deletes trashed guest when no references remain", async () => {
		const { purge } = await import("../guestService");
		const trashed = { ...sampleGuest, deleted_at: "2026-01-02T00:00:00Z" };
		const harness = createDeps({
			guests: {
				select: { data: trashed, error: null },
				delete: { data: null, error: null },
			},
			reservations: { select: { data: [], error: null } },
		});
		const result = await purge(
			sessionByRole("administrator"),
			"guest-1",
			harness.deps,
		);
		expect(result).toEqual({
			ok: true,
			data: { guest: trashed, blockingCount: 0 },
		});
	});

	it("returns backend-error when reservation guard query fails unexpectedly", async () => {
		const { purge } = await import("../guestService");
		const trashed = { ...sampleGuest, deleted_at: "2026-01-02T00:00:00Z" };
		const harness = createDeps({
			guests: { select: { data: trashed, error: null } },
			reservations: { select: { data: null, error: { message: "db down" } } },
		});
		const result = await purge(
			sessionByRole("administrator"),
			"guest-1",
			harness.deps,
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

describe("safe missing behavior", () => {
	it("returns not-found for scoped miss without cross-property leakage", async () => {
		const { getById } = await import("../guestService");
		const result = await getById(
			sessionByRole("manager"),
			"missing",
			createDeps({ guests: { select: { data: null, error: null } } }).deps,
		);
		expect(result).toEqual({
			ok: false,
			error: {
				code: "not-found",
				message: "The requested record was not found.",
			},
		});
	});
});
