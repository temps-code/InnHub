import { en } from "./en";
import { es } from "./es";

type WidenStrings<T> = {
	readonly [Key in keyof T]: T[Key] extends string
		? string
		: T[Key] extends Record<string, unknown>
			? WidenStrings<T[Key]>
			: T[Key];
};

export type AppTranslationResource = WidenStrings<typeof en>;

export const resources = {
	en: { app: en },
	es: { app: es },
} as const;
