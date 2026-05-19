import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./locales";
import { resources } from "./resources";
import { getStoredLocale } from "./storage";

export function createI18nInstance(): I18nInstance {
	const instance = i18next.createInstance();

	void instance.use(initReactI18next).init({
		defaultNS: "app",
		fallbackLng: DEFAULT_LOCALE,
		interpolation: {
			escapeValue: false,
		},
		lng: getStoredLocale() ?? DEFAULT_LOCALE,
		ns: ["app"],
		resources,
		supportedLngs: [...SUPPORTED_LOCALES],
	});

	return instance;
}

export const i18n = createI18nInstance();
