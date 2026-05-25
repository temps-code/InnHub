import { useTranslation } from "react-i18next";

import type { Locale } from "../i18n/locales";
import { setStoredLocale } from "../i18n/storage";

export interface UseLocaleResult {
	locale: Locale;
	toggleLocale: () => Promise<void>;
}

export function useLocale(): UseLocaleResult {
	const { i18n } = useTranslation();

	// Fallback to "en" if language is not set or not supported
	const locale = (i18n.language as Locale) || "en";

	const toggleLocale = async () => {
		const newLocale: Locale = locale === "en" ? "es" : "en";
		await i18n.changeLanguage(newLocale);
		setStoredLocale(newLocale);
	};

	return {
		locale,
		toggleLocale,
	};
}
