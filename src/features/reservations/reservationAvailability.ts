import { createInsForgeClient } from "../../shared/services/insforgeClient";
import { scopeOperationalQuery } from "../../shared/services/propertyScope";
import { withServiceContext } from "../../shared/services/serviceContext";
import {
	executeServiceQuery,
	serviceFailure,
	serviceSuccess,
	type ServiceResult,
} from "../../shared/services/serviceResult";
import type { AppSession } from "../auth/types";

const RESERVATION_ITEM_BLOCKING_STATUSES = ["confirmed", "checked_in"];
const RESERVATION_BLOCKING_STATUSES = [
	"confirmed",
	"partially_checked_in",
	"checked_in",
];
const STAY_BLOCKING_STATUS = "active";
const MAINTENANCE_BLOCKING_STATUSES = ["open", "in_progress"];

export type AvailabilityRequest = {
	roomId: string;
	checkInDate: string;
	checkOutDate: string;
	excludeReservationItemId?: string;
	excludeReservationId?: string;
};

type ReservationItemRow = {
	id: string;
	reservation_id: string;
	status: string;
};

type ReservationRow = {
	id: string;
	status: string;
	planned_check_in_date: string;
	planned_check_out_date: string;
};

type StayRow = {
	id: string;
	status: string;
	actual_check_in_at: string;
	expected_check_out_date: string;
};

type MaintenanceRow = {
	id: string;
	status: string;
	blocks_availability: boolean;
	created_at: string;
};

export type AvailabilityBlocker =
	| { source: "reservation-item"; id: string; reservationId: string }
	| { source: "stay"; id: string }
	| { source: "maintenance-ticket"; id: string };

export interface ReservationAvailabilityDeps {
	readonly from: (table: string) => {
		readonly select: (
			columns: string,
			options?: unknown,
		) => ReservationAvailabilityQuery;
	};
}

export interface ReservationAvailabilityQuery {
	readonly eq: (column: string, value: unknown) => this;
	readonly in: (column: string, values: unknown[]) => this;
	readonly lt: (column: string, value: unknown) => this;
	readonly gt: (column: string, value: unknown) => this;
	readonly neq: (column: string, value: unknown) => this;
	readonly then: <TResult>(
		onfulfilled?: (value: {
			readonly data: unknown;
			readonly error: unknown;
			readonly count?: number | null;
		}) => TResult | PromiseLike<TResult>,
		onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
	) => Promise<TResult>;
}

export function rangesOverlap(
	requestedCheckIn: string,
	requestedCheckOut: string,
	existingCheckIn: string,
	existingCheckOut: string,
): boolean {
	return (
		requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn
	);
}

export function validateAvailabilityDateOrder(
	checkInDate: string,
	checkOutDate: string,
): ServiceResult<void> {
	if (checkOutDate <= checkInDate) {
		return serviceFailure(
			"validation-error",
			"check-out-must-be-after-check-in",
		);
	}

	return serviceSuccess(undefined);
}

export async function validateRoomAvailability(
	session: AppSession | null,
	request: AvailabilityRequest,
	deps?: ReservationAvailabilityDeps,
): Promise<ServiceResult<void>> {
	const dateOrder = validateAvailabilityDateOrder(
		request.checkInDate,
		request.checkOutDate,
	);
	if (!dateOrder.ok) {
		return dateOrder;
	}

	const blockers = await findRoomAvailabilityBlockers(session, request, deps);
	if (!blockers.ok) {
		return blockers;
	}

	if (blockers.data.length > 0) {
		return serviceFailure(
			"validation-error",
			"room-not-available-for-requested-dates",
		);
	}

	return serviceSuccess(undefined);
}

export async function findRoomAvailabilityBlockers(
	session: AppSession | null,
	request: AvailabilityRequest,
	deps?: ReservationAvailabilityDeps,
): Promise<ServiceResult<AvailabilityBlocker[]>> {
	const dateOrder = validateAvailabilityDateOrder(
		request.checkInDate,
		request.checkOutDate,
	);
	if (!dateOrder.ok) {
		return dateOrder;
	}

	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		const reservationBlockersResult = await findReservationItemBlockers(
			from,
			ctx.propertyScope.propertyId,
			request,
		);
		if (!reservationBlockersResult.ok) {
			return reservationBlockersResult;
		}

		const stayBlockersResult = await findStayBlockers(
			from,
			ctx.propertyScope.propertyId,
			request,
		);
		if (!stayBlockersResult.ok) {
			return stayBlockersResult;
		}

		const maintenanceBlockersResult = await findMaintenanceBlockers(
			from,
			ctx.propertyScope.propertyId,
			request,
		);
		if (!maintenanceBlockersResult.ok) {
			return maintenanceBlockersResult;
		}

		return serviceSuccess([
			...reservationBlockersResult.data,
			...stayBlockersResult.data,
			...maintenanceBlockersResult.data,
		]);
	});
}

async function findReservationItemBlockers(
	from: ReservationAvailabilityDeps["from"],
	propertyId: string,
	request: AvailabilityRequest,
): Promise<ServiceResult<AvailabilityBlocker[]>> {
	let reservationItemsQuery = scopeOperationalQuery(
		from("reservation_items").select("id, reservation_id, status"),
		{ propertyId },
	)
		.eq("room_id", request.roomId)
		.in("status", RESERVATION_ITEM_BLOCKING_STATUSES);

	if (request.excludeReservationItemId) {
		reservationItemsQuery = reservationItemsQuery.neq(
			"id",
			request.excludeReservationItemId,
		);
	}

	const reservationItemsResult = await executeServiceQuery<
		ReservationItemRow | ReservationItemRow[]
	>(reservationItemsQuery as never);

	if (!reservationItemsResult.ok) {
		if (reservationItemsResult.error.code === "not-found") {
			return serviceSuccess([]);
		}
		return serviceFailure("backend-error");
	}

	const reservationItems = normalizeArray(reservationItemsResult.data);
	if (reservationItems.length === 0) {
		return serviceSuccess([]);
	}

	const reservationIds = [
		...new Set(reservationItems.map((item) => item.reservation_id)),
	];

	let reservationsQuery = scopeOperationalQuery(
		from("reservations").select(
			"id, status, planned_check_in_date, planned_check_out_date",
		),
		{ propertyId },
	)
		.in("id", reservationIds)
		.in("status", RESERVATION_BLOCKING_STATUSES)
		.lt("planned_check_in_date", request.checkOutDate)
		.gt("planned_check_out_date", request.checkInDate);

	if (request.excludeReservationId) {
		reservationsQuery = reservationsQuery.neq(
			"id",
			request.excludeReservationId,
		);
	}

	const reservationsResult = await executeServiceQuery<
		ReservationRow | ReservationRow[]
	>(reservationsQuery as never);

	if (!reservationsResult.ok) {
		if (reservationsResult.error.code === "not-found") {
			return serviceSuccess([]);
		}
		return serviceFailure("backend-error");
	}

	const reservations = normalizeArray(reservationsResult.data);
	const activeReservationIds = new Set(reservations.map((row) => row.id));

	const blockers: AvailabilityBlocker[] = reservationItems
		.filter((item) => activeReservationIds.has(item.reservation_id))
		.map((item) => ({
			source: "reservation-item",
			id: item.id,
			reservationId: item.reservation_id,
		}));

	return serviceSuccess(blockers);
}

async function findStayBlockers(
	from: ReservationAvailabilityDeps["from"],
	propertyId: string,
	request: AvailabilityRequest,
): Promise<ServiceResult<AvailabilityBlocker[]>> {
	const query = scopeOperationalQuery(
		from("stays").select(
			"id, status, actual_check_in_at, expected_check_out_date",
		),
		{ propertyId },
	)
		.eq("room_id", request.roomId)
		.eq("status", STAY_BLOCKING_STATUS);

	const result = await executeServiceQuery<StayRow | StayRow[]>(query as never);

	if (!result.ok) {
		if (result.error.code === "not-found") {
			return serviceSuccess([]);
		}
		return serviceFailure("backend-error");
	}

	const blockers: AvailabilityBlocker[] = normalizeArray(result.data)
		.filter((stay) =>
			rangesOverlap(
				request.checkInDate,
				request.checkOutDate,
				stay.actual_check_in_at.slice(0, 10),
				stay.expected_check_out_date,
			),
		)
		.map((stay) => ({ source: "stay", id: stay.id }));

	return serviceSuccess(blockers);
}

async function findMaintenanceBlockers(
	from: ReservationAvailabilityDeps["from"],
	propertyId: string,
	request: AvailabilityRequest,
): Promise<ServiceResult<AvailabilityBlocker[]>> {
	const query = scopeOperationalQuery(
		from("maintenance_tickets").select(
			"id, status, blocks_availability, created_at",
		),
		{ propertyId },
	)
		.eq("room_id", request.roomId)
		.eq("blocks_availability", true)
		.in("status", MAINTENANCE_BLOCKING_STATUSES);

	const result = await executeServiceQuery<MaintenanceRow | MaintenanceRow[]>(
		query as never,
	);

	if (!result.ok) {
		if (result.error.code === "not-found") {
			return serviceSuccess([]);
		}
		return serviceFailure("backend-error");
	}

	const blockers: AvailabilityBlocker[] = normalizeArray(result.data)
		.filter((row) => row.created_at.slice(0, 10) < request.checkOutDate)
		.map((row) => ({ source: "maintenance-ticket", id: row.id }));

	return serviceSuccess(blockers);
}

function normalizeArray<T>(value: T | T[] | null | undefined): T[] {
	if (!value) {
		return [];
	}

	return Array.isArray(value) ? value : [value];
}

function resolveFrom(
	deps?: ReservationAvailabilityDeps,
): ReservationAvailabilityDeps["from"] {
	if (deps?.from) {
		return deps.from;
	}

	const client = createInsForgeClient();
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			ReservationAvailabilityDeps["from"]
		>;
}
