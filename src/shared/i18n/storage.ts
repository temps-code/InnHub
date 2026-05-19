import type { Locale } from "./locales";
import { isSupportedLocale } from "./locales";

export const LOCALE_STORAGE_KEY = "innhub.locale";

function getDefaultStorage(): Storage | undefined {
	try {
		return globalThis.localStorage;
	} catch {
		return undefined;
	}
}

export function getStoredLocale(storage?: Storage): Locale | null {
	try {
		const storedLocale = (storage ?? getDefaultStorage())?.getItem(
			LOCALE_STORAGE_KEY,
		);

		return isSupportedLocale(storedLocale) ? storedLocale : null;
	} catch {
		return null;
	}
}

export function setStoredLocale(locale: Locale, storage?: Storage): void {
	try {
		(storage ?? getDefaultStorage())?.setItem(LOCALE_STORAGE_KEY, locale);
	} catch {
		// Ignore unavailable storage; locale changes should still work in memory.
	}
}
