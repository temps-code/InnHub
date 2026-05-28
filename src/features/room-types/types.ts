import { z } from "zod";

export type RoomType = {
	readonly id: string;
	readonly property_id: string;
	readonly name: string;
	readonly description: string | null;
	readonly capacity: number;
	readonly base_price: number;
	readonly created_at: string;
	readonly updated_at: string;
	readonly deleted_at: string | null;
};

export const roomTypeFormSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	description: z.string().transform((val) => (val === "" ? null : val)).nullable(),
	capacity: z.coerce.number().int().positive("Capacity must be > 0"),
	base_price: z.preprocess(
		(val) => (val === "" ? undefined : val),
		z.coerce.number().min(0, "Base price must be ≥ 0"),
	),
});

export type RoomTypeFormData = z.infer<typeof roomTypeFormSchema>;
