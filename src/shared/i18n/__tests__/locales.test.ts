import { describe, expect, it } from "vitest";

import {
	DEFAULT_LOCALE,
	SUPPORTED_LOCALES,
	isSupportedLocale,
} from "../locales";

describe("locale policy", () => {
	it("supports English and Spanish locales", () => {
		expect(SUPPORTED_LOCALES).toEqual(["en", "es"]);
		expect(isSupportedLocale("en")).toBe(true);
		expect(isSupportedLocale("es")).toBe(true);
	});

	it("uses English as a supported default locale", () => {
		expect(DEFAULT_LOCALE).toBe("en");
		expect(isSupportedLocale(DEFAULT_LOCALE)).toBe(true);
	});

	it.each([
		"pt",
		"en-US",
		"",
		null,
		{ locale: "en" },
	])("rejects unsupported locale value %o", (value) => {
		expect(isSupportedLocale(value)).toBe(false);
	});
});
