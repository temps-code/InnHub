import { z } from "zod";

export type Guest = {
	readonly id: string;
	readonly property_id: string;
	readonly first_name: string;
	readonly last_name: string;
	readonly document_type: string | null;
	readonly document_number: string | null;
	readonly email: string | null;
	readonly phone: string | null;
	readonly notes: string | null;
	readonly created_at: string;
	readonly updated_at: string;
	readonly deleted_at: string | null;
};

export type GuestActivityFilter =
	| "all"
	| "withOpenReservations"
	| "withoutOpenReservations";

export type GuestListParams = {
	readonly search?: string;
	readonly activity?: GuestActivityFilter;
	readonly page?: number;
	readonly pageSize?: number;
};

export type GuestListResult = {
	readonly guests: Guest[];
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

const requiredTrimmedString = (message: string) =>
	z
		.string()
		.transform((value) => value.trim())
		.refine((value) => value.length > 0, message);

export const guestFormSchema = z.object({
	first_name: z.string().trim().min(1, "First name is required"),
	last_name: z.string().trim().min(1, "Last name is required"),
	document_type: requiredTrimmedString("Document type is required"),
	document_number: requiredTrimmedString("Document number is required"),
	email: nullableTrimmedString.refine(
		(value) => value === null || z.string().email().safeParse(value).success,
		"Email is invalid",
	),
	phone: nullableTrimmedString,
	notes: nullableTrimmedString,
	property_id: z.string().trim().optional(),
});

export type GuestFormData = z.infer<typeof guestFormSchema>;
