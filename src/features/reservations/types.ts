import { z } from "zod";

export type ReservationStatus =
	| "pending"
	| "confirmed"
	| "partially_checked_in"
	| "checked_in"
	| "cancelled"
	| "no_show";

export type Reservation = {
	readonly id: string;
	readonly reference?: string;
	readonly property_id: string;
	readonly primary_guest_id: string;
	readonly primary_guest_name?: string | null;
	readonly planned_check_in_date: string;
	readonly planned_check_out_date: string;
	readonly status: ReservationStatus;
	readonly notes: string | null;
	readonly room_type_id?: string | null;
	readonly room_type_name?: string | null;
	readonly room_id?: string | null;
	readonly room_identifier?: string | null;
	readonly item_summary?: string | null;
	readonly guest_count?: number | null;
	readonly reservation_items?: ReservationItemInput[];
	readonly created_at: string;
	readonly updated_at: string;
	readonly deleted_at: string | null;
};

export type ReservationItem = {
	readonly id: string;
	readonly property_id: string;
	readonly reservation_id: string;
	readonly room_type_id: string;
	readonly room_id: string | null;
	readonly status:
		| "pending"
		| "confirmed"
		| "checked_in"
		| "cancelled"
		| "no_show";
	readonly guest_count: number;
	readonly notes: string | null;
	readonly deleted_at?: string | null;
};

export type ReservationItemInput = {
	readonly room_type_id: string;
	readonly room_id: string | null;
	readonly guest_count: number;
};

export type ReservationListParams = {
	readonly page?: number;
	readonly pageSize?: number;
	readonly status?: ReservationStatus | "all";
	readonly search?: string;
	readonly checkInFrom?: string;
	readonly checkInTo?: string;
	readonly checkOutFrom?: string;
	readonly checkOutTo?: string;
	readonly room_id?: string;
	readonly guest_id?: string;
};

export type ReservationListResult = {
	readonly reservations: Reservation[];
	readonly page: number;
	readonly pageSize: number;
	readonly total: number;
};

const nullableTrimmedString = z
	.string()
	.optional()
	.nullable()
	.transform((value) => {
		if (value == null) {
			return null;
		}
		const trimmed = value.trim();
		return trimmed === "" ? null : trimmed;
	});

const reservationItemInputSchema = z.object({
	room_type_id: z.string().trim().min(1, "Room type is required"),
	room_id: nullableTrimmedString,
	guest_count: z.number().int().positive("Guest count must be greater than 0"),
});

export const reservationCreateSchema = z.object({
	primary_guest_id: z.string().trim().min(1, "Primary guest is required"),
	planned_check_in_date: z.string().trim().min(1, "Check-in date is required"),
	planned_check_out_date: z
		.string()
		.trim()
		.min(1, "Check-out date is required"),
	reservation_items: z.array(reservationItemInputSchema).optional(),
	room_type_id: z.string().trim().optional(),
	room_id: nullableTrimmedString.optional(),
	guest_count: z
		.number()
		.int()
		.positive("Guest count must be greater than 0")
		.optional(),
	status: z
		.enum([
			"pending",
			"confirmed",
			"partially_checked_in",
			"checked_in",
			"cancelled",
			"no_show",
		])
		.optional(),
	notes: nullableTrimmedString.optional(),
	property_id: z.string().trim().optional(),
});

export type ReservationCreateData = z.infer<typeof reservationCreateSchema>;
export type ReservationUpdateData = ReservationCreateData;

export type ReservationPurgeBlockers = {
	readonly invoiceCount: number;
	readonly paymentCount: number;
};

export type ReservationPurgeResult = {
	readonly reservation: Reservation;
	readonly blockers: ReservationPurgeBlockers;
};

export type StayStatus = "active" | "checked_out" | "cancelled";

export type Stay = {
	readonly id: string;
	readonly property_id: string;
	readonly reservation_item_id: string | null;
	readonly primary_guest_id: string;
	readonly room_id: string;
	readonly actual_check_in_at: string;
	readonly expected_check_out_date: string;
	readonly actual_check_out_at?: string | null;
	readonly status: StayStatus;
	readonly guest_count: number;
	readonly notes: string | null;
	readonly created_at: string;
	readonly updated_at: string;
	readonly deleted_at?: string | null;
};

export type CheckInReservationItemCommand = {
	readonly reservationItemId: string;
	readonly roomId?: string | null;
	readonly actualCheckInAt?: string;
};

export type CheckInReservationItemResult = {
	readonly reservation: Reservation;
	readonly reservationItem: ReservationItem;
	readonly stay: Stay;
	readonly room: import("../rooms").Room;
};
