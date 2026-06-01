import { describe, expect, it } from "vitest";

import type { AppSession } from "../../auth/types";
import {
	findRoomAvailabilityBlockers,
	validateRoomAvailability,
	type ReservationAvailabilityDeps,
} from "../reservationAvailability";

type QueryResult<T> = { data: T | null; error: unknown };

type Filters = {
	eq: Array<{ column: string; value: unknown }>;
	in: Array<{ column: string; values: unknown[] }>;
	neq: Array<{ column: string; value: unknown }>;
	lt: Array<{ column: string; value: unknown }>;
	gt: Array<{ column: string; value: unknown }>;
};

class FakeQuery<T extends Record<string, unknown>>
	implements PromiseLike<QueryResult<T[]>>
{
	public readonly filters: Filters = {
		eq: [],
		in: [],
		neq: [],
		lt: [],
		gt: [],
	};
	private readonly rows: T[];
	private readonly error: unknown;

	constructor(rows: T[], error: unknown = null) {
		this.rows = rows;
		this.error = error;
	}

	eq(column: string, value: unknown): this {
		this.filters.eq.push({ column, value });
		return this;
	}

	in(column: string, values: unknown[]): this {
		this.filters.in.push({ column, values });
		return this;
	}

	neq(column: string, value: unknown): this {
		this.filters.neq.push({ column, value });
		return this;
	}

	lt(column: string, value: unknown): this {
		this.filters.lt.push({ column, value });
		return this;
	}

	gt(column: string, value: unknown): this {
		this.filters.gt.push({ column, value });
		return this;
	}

	then<TResult>(
		onfulfilled?: (value: QueryResult<T[]>) => TResult | PromiseLike<TResult>,
	): Promise<TResult> {
		if (this.error) {
			return Promise.resolve({ data: null, error: this.error }).then(
				onfulfilled as (v: QueryResult<T[]>) => TResult,
			);
		}

		const data = this.rows.filter((row) => {
			const eqOk = this.filters.eq.every((f) => row[f.column] === f.value);
			const inOk = this.filters.in.every((f) =>
				f.values.includes(row[f.column]),
			);
			const neqOk = this.filters.neq.every((f) => row[f.column] !== f.value);
			const ltOk = this.filters.lt.every(
				(f) => String(row[f.column] ?? "") < String(f.value),
			);
			const gtOk = this.filters.gt.every(
				(f) => String(row[f.column] ?? "") > String(f.value),
			);
			return eqOk && inOk && neqOk && ltOk && gtOk;
		});

		return Promise.resolve({ data, error: null }).then(
			onfulfilled as (v: QueryResult<T[]>) => TResult,
		);
	}
}

function createDeps(data: Record<string, Record<string, unknown>[]>) {
	const queries: Array<{
		table: string;
		query: FakeQuery<Record<string, unknown>>;
	}> = [];

	const deps: ReservationAvailabilityDeps = {
		from: (table: string) => ({
			select: () => {
				const query = new FakeQuery<Record<string, unknown>>(data[table] ?? []);
				queries.push({ table, query });
				return query;
			},
		}),
	};

	return { deps, queries };
}

const session: AppSession = {
	user: { id: "auth-1", email: "admin@innhub.test" },
	profile: {
		id: "profile-1",
		authUserId: "auth-1",
		propertyId: "property-1",
		role: "administrator",
		status: "active",
	},
	propertyId: "property-1",
};

const request = {
	roomId: "room-1",
	checkInDate: "2026-06-10",
	checkOutDate: "2026-06-12",
};

describe("validateRoomAvailability", () => {
	it("returns property-scope-error when session is null", async () => {
		const { deps } = createDeps({});

		const result = await validateRoomAvailability(null, request, deps);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "property-scope-error",
				message: "A valid property scope is required.",
			},
		});
	});

	it("returns validation-error when reservation overlap exists", async () => {
		const { deps } = createDeps({
			reservation_items: [
				{
					id: "ri-1",
					property_id: "property-1",
					room_id: "room-1",
					reservation_id: "r-1",
					status: "confirmed",
				},
			],
			reservations: [
				{
					id: "r-1",
					property_id: "property-1",
					status: "confirmed",
					planned_check_in_date: "2026-06-10",
					planned_check_out_date: "2026-06-12",
				},
			],
			stays: [],
			maintenance_tickets: [],
		});

		const result = await validateRoomAvailability(session, request, deps);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "validation-error",
				message: "room-not-available-for-requested-dates",
			},
		});
	});

	it("returns success when all rows are non-blocking", async () => {
		const { deps } = createDeps({
			reservation_items: [
				{
					id: "ri-1",
					property_id: "property-1",
					room_id: "room-1",
					reservation_id: "r-1",
					status: "pending",
				},
			],
			reservations: [
				{
					id: "r-1",
					property_id: "property-1",
					status: "cancelled",
					planned_check_in_date: "2026-06-10",
					planned_check_out_date: "2026-06-12",
				},
			],
			stays: [
				{
					id: "s-1",
					property_id: "property-1",
					room_id: "room-1",
					status: "checked_out",
					actual_check_in_at: "2026-06-09T12:00:00Z",
					expected_check_out_date: "2026-06-10",
				},
			],
			maintenance_tickets: [
				{
					id: "m-1",
					property_id: "property-1",
					room_id: "room-1",
					status: "resolved",
					blocks_availability: true,
					created_at: "2026-06-08T10:00:00Z",
				},
			],
		});

		const result = await validateRoomAvailability(session, request, deps);

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it("supports self exclusion for reservation item and reservation", async () => {
		const { deps } = createDeps({
			reservation_items: [
				{
					id: "ri-1",
					property_id: "property-1",
					room_id: "room-1",
					reservation_id: "r-1",
					status: "confirmed",
				},
			],
			reservations: [
				{
					id: "r-1",
					property_id: "property-1",
					status: "confirmed",
					planned_check_in_date: "2026-06-10",
					planned_check_out_date: "2026-06-12",
				},
			],
			stays: [],
			maintenance_tickets: [],
		});

		const result = await validateRoomAvailability(
			session,
			{
				...request,
				excludeReservationItemId: "ri-1",
				excludeReservationId: "r-1",
			},
			deps,
		);

		expect(result).toEqual({ ok: true, data: undefined });
	});
});

describe("findRoomAvailabilityBlockers", () => {
	it("returns blockers from reservation, stay, and maintenance", async () => {
		const { deps } = createDeps({
			reservation_items: [
				{
					id: "ri-1",
					property_id: "property-1",
					room_id: "room-1",
					reservation_id: "r-1",
					status: "confirmed",
				},
			],
			reservations: [
				{
					id: "r-1",
					property_id: "property-1",
					status: "checked_in",
					planned_check_in_date: "2026-06-09",
					planned_check_out_date: "2026-06-13",
				},
			],
			stays: [
				{
					id: "s-1",
					property_id: "property-1",
					room_id: "room-1",
					status: "active",
					actual_check_in_at: "2026-06-10T09:00:00Z",
					expected_check_out_date: "2026-06-11",
				},
			],
			maintenance_tickets: [
				{
					id: "m-1",
					property_id: "property-1",
					room_id: "room-1",
					status: "open",
					blocks_availability: true,
					created_at: "2026-06-01T10:00:00Z",
				},
			],
		});

		const result = await findRoomAvailabilityBlockers(session, request, deps);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toEqual([
				{ source: "reservation-item", id: "ri-1", reservationId: "r-1" },
				{ source: "stay", id: "s-1" },
				{ source: "maintenance-ticket", id: "m-1" },
			]);
		}
	});

	it("ignores cross-property rows by property-scoped query", async () => {
		const { deps } = createDeps({
			reservation_items: [
				{
					id: "ri-1",
					property_id: "property-2",
					room_id: "room-1",
					reservation_id: "r-1",
					status: "confirmed",
				},
			],
			reservations: [
				{
					id: "r-1",
					property_id: "property-2",
					status: "confirmed",
					planned_check_in_date: "2026-06-10",
					planned_check_out_date: "2026-06-12",
				},
			],
			stays: [],
			maintenance_tickets: [],
		});

		const result = await findRoomAvailabilityBlockers(session, request, deps);

		expect(result).toEqual({ ok: true, data: [] });
	});

	it("applies property_id scoping on all table queries", async () => {
		const { deps, queries } = createDeps({
			reservation_items: [],
			reservations: [],
			stays: [],
			maintenance_tickets: [],
		});

		await findRoomAvailabilityBlockers(session, request, deps);

		expect(queries.length).toBeGreaterThanOrEqual(3);
		for (const entry of queries) {
			expect(entry.query.filters.eq).toContainEqual({
				column: "property_id",
				value: "property-1",
			});
		}
	});
});
