import { canAccess } from "../../app/routes/routeMetadata";
import { createInsForgeClient } from "../../shared/services/insforgeClient";
import {
	assertSameProperty,
	scopeOperationalQuery,
} from "../../shared/services/propertyScope";
import {
	executeServiceQuery,
	serviceFailure,
	serviceSuccess,
	type ServiceResult,
} from "../../shared/services/serviceResult";
import { withServiceContext } from "../../shared/services/serviceContext";
import type { AppSession } from "../auth/types";
import type { Room, RoomState } from "../rooms";
import type {
	CheckInReservationItemCommand,
	CheckInReservationItemResult,
	Reservation,
	ReservationItem,
	Stay,
} from "./types";

export interface CheckInServiceDeps {
	readonly from: (table: string) => {
		readonly select: (
			columns: string,
			options?: unknown,
		) => CheckInServiceQuery;
		readonly insert: (data: unknown) => CheckInServiceQuery;
		readonly update: (data: unknown) => CheckInServiceQuery;
	};
}

export interface CheckInServiceQuery {
	readonly eq: (column: string, value: unknown) => this;
	readonly is: (column: string, value: unknown) => this;
	readonly neq: (column: string, value: unknown) => this;
	readonly in: (column: string, values: unknown[]) => this;
	readonly select: (columns?: string, options?: unknown) => this;
	readonly then: <TResult>(
		onfulfilled?: (value: {
			readonly data: unknown;
			readonly error: unknown;
			readonly count?: number | null;
		}) => TResult | PromiseLike<TResult>,
		onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
	) => Promise<TResult>;
}

export async function checkInReservationItem(
	session: AppSession | null,
	command: CheckInReservationItemCommand,
	deps?: CheckInServiceDeps,
): Promise<ServiceResult<CheckInReservationItemResult>> {
	const from = resolveFrom(deps);

	return withServiceContext(session, async (ctx) => {
		if (!session?.profile || !canAccess("receptionist", session.profile.role)) {
			return serviceFailure("validation-error", "permission-denied");
		}
		if (!command.reservationItemId.trim()) {
			return serviceFailure("validation-error", "reservation-item-id-required");
		}

		const actualCheckIn = normalizeActualCheckInAt(command.actualCheckInAt);
		if (!actualCheckIn.ok) {
			return actualCheckIn;
		}
		const { actualCheckInAt, actualCheckInDate } = actualCheckIn.data;

		const reservationItem = normalizeSingle(
			await executeServiceQuery<ReservationItem | ReservationItem[]>(
				scopeOperationalQuery(
					from("reservation_items").select("*").is("deleted_at", null),
					ctx.propertyScope,
				).eq("id", command.reservationItemId) as never,
			),
		);
		if (!reservationItem.ok) {
			return reservationItem;
		}
		if (
			!assertSameProperty(reservationItem.data.property_id, ctx.propertyScope)
				.ok
		) {
			return serviceFailure("property-scope-error");
		}

		const reservation = normalizeSingle(
			await executeServiceQuery<Reservation | Reservation[]>(
				scopeOperationalQuery(
					from("reservations").select("*").is("deleted_at", null),
					ctx.propertyScope,
				).eq("id", reservationItem.data.reservation_id) as never,
			),
		);
		if (!reservation.ok) {
			return reservation;
		}
		if (
			!assertSameProperty(reservation.data.property_id, ctx.propertyScope).ok
		) {
			return serviceFailure("property-scope-error");
		}
		if (
			!isReservationCheckInEligible(reservation.data.status) &&
			reservation.data.status !== "checked_in"
		) {
			return serviceFailure(
				"validation-error",
				"reservation-not-check-in-eligible",
			);
		}
		if (
			!isReservationItemCheckInEligible(reservationItem.data.status) &&
			reservationItem.data.status !== "checked_in"
		) {
			return serviceFailure(
				"validation-error",
				"reservation-item-not-check-in-eligible",
			);
		}
		if (
			!isCheckInWithinPlannedWindow(
				actualCheckInDate,
				reservation.data.planned_check_in_date,
				reservation.data.planned_check_out_date,
			)
		) {
			return serviceFailure(
				"validation-error",
				"check-in-outside-planned-window",
			);
		}
		const targetRoomId = command.roomId ?? reservationItem.data.room_id;
		if (!targetRoomId) {
			return serviceFailure("validation-error", "assigned-room-required");
		}
		if (command.roomId && command.roomId !== reservationItem.data.room_id) {
			return serviceFailure("validation-error", "room-assignment-mismatch");
		}

		const room = normalizeSingle(
			await executeServiceQuery<Room | Room[]>(
				scopeOperationalQuery(
					from("rooms").select("*").is("deleted_at", null),
					ctx.propertyScope,
				).eq("id", targetRoomId) as never,
			),
		);
		if (!room.ok) {
			return room;
		}
		if (!assertSameProperty(room.data.property_id, ctx.propertyScope).ok) {
			return serviceFailure("property-scope-error");
		}
		if (room.data.room_type_id !== reservationItem.data.room_type_id) {
			return serviceFailure("validation-error", "room-type-mismatch");
		}

		const existingStayResult = await executeServiceQuery<Stay | Stay[]>(
			scopeOperationalQuery(from("stays").select("*"), ctx.propertyScope).eq(
				"reservation_item_id",
				reservationItem.data.id,
			) as never,
		);
		if (
			!existingStayResult.ok &&
			existingStayResult.error.code !== "not-found"
		) {
			return existingStayResult;
		}
		const existingStays = existingStayResult.ok
			? normalizeArray(existingStayResult.data)
			: [];
		if (existingStays.length > 1) {
			return serviceFailure(
				"validation-error",
				"conflicting-stay-for-reservation-item",
			);
		}
		const existingStay = existingStays[0];
		if (existingStay) {
			if (
				isRetrySafeExistingCheckIn({
					reservation: reservation.data,
					reservationItem: reservationItem.data,
					room: room.data,
					stay: existingStay,
					targetRoomId,
				})
			) {
				return serviceSuccess({
					reservation: reservation.data,
					reservationItem: reservationItem.data,
					stay: existingStay,
					room: room.data,
				});
			}
			return serviceFailure(
				"validation-error",
				"conflicting-stay-for-reservation-item",
			);
		}

		if (!isReservationCheckInEligible(reservation.data.status)) {
			return serviceFailure(
				"validation-error",
				"reservation-not-check-in-eligible",
			);
		}
		if (!isReservationItemCheckInEligible(reservationItem.data.status)) {
			return serviceFailure(
				"validation-error",
				"reservation-item-not-check-in-eligible",
			);
		}
		if (!isRoomAssignableForCheckIn(room.data.state)) {
			return serviceFailure(
				"validation-error",
				"room-not-assignable-for-check-in",
			);
		}

		const siblingsResult = await executeServiceQuery<
			ReservationItem | ReservationItem[]
		>(
			scopeOperationalQuery(
				from("reservation_items").select("*").is("deleted_at", null),
				ctx.propertyScope,
			).eq("reservation_id", reservation.data.id) as never,
		);
		if (!siblingsResult.ok) {
			return siblingsResult;
		}
		const siblings = normalizeArray(siblingsResult.data);

		const insertedStay = normalizeSingle(
			await executeServiceQuery<Stay | Stay[]>(
				from("stays")
					.insert({
						property_id: ctx.propertyScope.propertyId,
						reservation_item_id: reservationItem.data.id,
						primary_guest_id: reservation.data.primary_guest_id,
						room_id: targetRoomId,
						actual_check_in_at: actualCheckInAt,
						expected_check_out_date: reservation.data.planned_check_out_date,
						status: "active",
						guest_count: reservationItem.data.guest_count,
						notes: reservationItem.data.notes ?? reservation.data.notes,
					})
					.select() as never,
			),
		);
		if (!insertedStay.ok) {
			return insertedStay;
		}
		const stay = insertedStay.data;

		const updatedItem = normalizeSingle(
			await executeServiceQuery<ReservationItem | ReservationItem[]>(
				scopeOperationalQuery(
					from("reservation_items").update({ status: "checked_in" }).select(),
					ctx.propertyScope,
				).eq("id", reservationItem.data.id) as never,
			),
		);
		if (!updatedItem.ok) {
			return updatedItem;
		}

		const updatedReservation = normalizeSingle(
			await executeServiceQuery<Reservation | Reservation[]>(
				scopeOperationalQuery(
					from("reservations")
						.update({
							status: deriveReservationStatusAfterItemCheckIn(
								siblings,
								reservationItem.data.id,
							),
						})
						.select(),
					ctx.propertyScope,
				).eq("id", reservation.data.id) as never,
			),
		);
		if (!updatedReservation.ok) {
			return updatedReservation;
		}

		const updatedRoom = normalizeSingle(
			await executeServiceQuery<Room | Room[]>(
				scopeOperationalQuery(
					from("rooms").update({ state: "occupied" }).select(),
					ctx.propertyScope,
				).eq("id", room.data.id) as never,
			),
		);
		if (!updatedRoom.ok) {
			return updatedRoom;
		}

		return serviceSuccess({
			reservation: updatedReservation.data,
			reservationItem: updatedItem.data,
			stay,
			room: updatedRoom.data,
		});
	});
}

function normalizeActualCheckInAt(input: string | undefined): ServiceResult<{
	readonly actualCheckInAt: string;
	readonly actualCheckInDate: string;
}> {
	const candidate = input ?? new Date().toISOString();
	const parsed = new Date(candidate);
	if (!Number.isFinite(parsed.getTime())) {
		return serviceFailure("validation-error", "invalid-actual-check-in-at");
	}
	const actualCheckInAt = parsed.toISOString();
	return serviceSuccess({
		actualCheckInAt,
		actualCheckInDate: actualCheckInAt.slice(0, 10),
	});
}

function isReservationCheckInEligible(status: Reservation["status"]): boolean {
	return status === "confirmed" || status === "partially_checked_in";
}

function isReservationItemCheckInEligible(
	status: ReservationItem["status"],
): boolean {
	return status === "confirmed";
}

function isRoomAssignableForCheckIn(state: RoomState): boolean {
	return state === "available";
}

function isCheckInWithinPlannedWindow(
	actualDate: string,
	plannedCheckInDate: string,
	plannedCheckOutDate: string,
): boolean {
	return actualDate >= plannedCheckInDate && actualDate < plannedCheckOutDate;
}

type RetrySafeExistingCheckInInput = {
	readonly reservation: Reservation;
	readonly reservationItem: ReservationItem;
	readonly room: Room;
	readonly stay: Stay;
	readonly targetRoomId: string;
};

function isRetrySafeExistingCheckIn({
	reservation,
	reservationItem,
	room,
	stay,
	targetRoomId,
}: RetrySafeExistingCheckInInput): boolean {
	return (
		(reservation.status === "checked_in" ||
			reservation.status === "partially_checked_in") &&
		reservationItem.status === "checked_in" &&
		room.state === "occupied" &&
		stay.deleted_at == null &&
		stay.status === "active" &&
		stay.property_id === reservation.property_id &&
		stay.property_id === reservationItem.property_id &&
		stay.reservation_item_id === reservationItem.id &&
		stay.room_id === targetRoomId &&
		stay.room_id === room.id
	);
}

function deriveReservationStatusAfterItemCheckIn(
	siblings: readonly ReservationItem[],
	checkedItemId: string,
): Reservation["status"] {
	const eligibleItems = siblings.filter(
		(item) => item.status !== "cancelled" && item.status !== "no_show",
	);
	const allEligibleCheckedIn = eligibleItems.every(
		(item) => item.id === checkedItemId || item.status === "checked_in",
	);

	return allEligibleCheckedIn ? "checked_in" : "partially_checked_in";
}

function normalizeArray<T>(data: T | T[] | null | undefined): T[] {
	if (data == null) {
		return [];
	}
	return Array.isArray(data) ? data : [data];
}

function normalizeSingle<T>(result: ServiceResult<T | T[]>): ServiceResult<T> {
	if (!result.ok) {
		return result;
	}
	const rows = normalizeArray(result.data);
	if (rows.length === 0) {
		return serviceFailure("not-found");
	}
	return serviceSuccess(rows[0] as T);
}

function resolveFrom(deps?: CheckInServiceDeps): CheckInServiceDeps["from"] {
	if (deps) {
		return deps.from;
	}
	const client = createInsForgeClient();
	if (!client) {
		return (() => {
			throw new Error("InsForge client unavailable");
		}) as never;
	}
	return (table: string) =>
		client.database.from(table) as never as ReturnType<
			CheckInServiceDeps["from"]
		>;
}
