import { z } from "zod";

export type RoomState = "available" | "occupied" | "cleaning" | "maintenance" | "inactive";

export type Room = {
	readonly id: string;
	readonly property_id: string;
	readonly room_type_id: string;
	readonly identifier: string;
	readonly floor: string | null;
	readonly state: RoomState;
	readonly description: string | null;
	readonly created_at: string;
	readonly updated_at: string;
	readonly deleted_at: string | null;
};

export const roomFormSchema = z.object({
	identifier: z.string().trim().min(1, "Identifier is required"),
	room_type_id: z.string().trim().min(1, "Room type is required"),
	floor: z.string().optional(),
	state: z.enum(["available", "occupied", "cleaning", "maintenance", "inactive"]).default("available"),
	description: z.string().transform((val) => (val === "" ? null : val)).nullable().optional(),
});

export type RoomFormData = z.infer<typeof roomFormSchema>;

export type RoomFilters = {
	readonly status?: RoomState;
	readonly room_type_id?: string;
	readonly search?: string;
};

export const ROOM_STATE_TONE_MAP: Record<RoomState, string> = {
	available: "success",
	occupied: "info",
	cleaning: "warning",
	maintenance: "danger",
	inactive: "neutral",
};
