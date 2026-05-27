import { z } from "zod";

export type ProfileData = {
	readonly fullName: string | null;
	readonly email: string;
	readonly role: string;
	readonly propertyName: string | null;
};

export const profileFormSchema = z.object({
	fullName: z.string().min(1, "Name is required").max(100),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
