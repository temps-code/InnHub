import { z } from "zod";

export type Property = {
	readonly id: string;
	readonly slug: string;
	readonly name: string;
	readonly business_type: string | null;
	readonly timezone: string;
	readonly currency: string;
	readonly address: string | null;
	readonly phone: string | null;
	readonly email: string | null;
	readonly created_at: string;
	readonly updated_at: string;
};

export type PropertyFormData = {
	readonly name: string;
	readonly business_type: string | null;
	readonly timezone: string;
	readonly currency: string;
	readonly address: string | null;
	readonly phone: string | null;
	readonly email: string | null;
};

export const propertyFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	timezone: z.string().min(1, "Timezone is required"),
	currency: z.string().length(3, "Currency must be a 3-letter code"),
	email: z.string().email().nullable().or(z.literal("")),
	address: z.string().nullable(),
	phone: z.string().nullable(),
	business_type: z.string().nullable(),
});
