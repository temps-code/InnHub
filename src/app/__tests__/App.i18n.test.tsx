// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createI18nInstance, i18n } from "../../shared/i18n/config";
import { LOCALE_STORAGE_KEY } from "../../shared/i18n/storage";
import { App } from "../App";
import { AppProviders } from "../providers/AppProviders";

const englishModules = [
	"Properties",
	"Rooms",
	"Guests",
	"Reservations",
	"Operations",
	"Billing",
	"Reports",
];
const spanishModules = [
	"Propiedades",
	"Habitaciones",
	"Huéspedes",
	"Reservas",
	"Operaciones",
	"Facturación",
	"Reportes",
];

function installMemoryStorage() {
	const data = new Map<string, string>();
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		value: {
			clear: () => data.clear(),
			getItem: (key: string) => data.get(key) ?? null,
			setItem: (key: string, value: string) => data.set(key, value),
		},
	});
}

function expectModuleLabels(labels: string[]) {
	for (const label of labels) {
		expect(screen.getByText(label)).toBeTruthy();
	}
}

describe("App i18n rendering", () => {
	beforeEach(installMemoryStorage);

	afterEach(async () => {
		cleanup();
		localStorage.clear();
		await i18n.changeLanguage("en");
	});

	it("renders English shell copy by default through the app provider", () => {
		render(
			<AppProviders>
				<App />
			</AppProviders>,
		);

		expect(screen.getByText("Accommodation management MVP")).toBeTruthy();
		expect(
			screen.getByText("Ready for the first implementation slice"),
		).toBeTruthy();
		expect(
			screen.getByRole("list", { name: "Planned InnHub modules" }),
		).toBeTruthy();
		expectModuleLabels(englishModules);
	});

	it("renders Spanish shell copy when Spanish is the active language", async () => {
		await i18n.changeLanguage("es");
		render(
			<AppProviders>
				<App />
			</AppProviders>,
		);

		expect(screen.getByText("MVP de gestión de alojamientos")).toBeTruthy();
		expect(
			screen.getByText("Listo para el primer incremento de implementación"),
		).toBeTruthy();
		expect(
			screen.getByRole("list", { name: "Módulos planificados de InnHub" }),
		).toBeTruthy();
		expectModuleLabels(spanishModules);
	});

	it("renders Spanish when Spanish is the persisted locale", () => {
		localStorage.setItem(LOCALE_STORAGE_KEY, "es");
		render(
			<I18nextProvider i18n={createI18nInstance()}>
				<App />
			</I18nextProvider>,
		);

		expect(screen.getByText("MVP de gestión de alojamientos")).toBeTruthy();
		expect(screen.getByText("Facturación")).toBeTruthy();
	});

	it("falls back to English when the persisted locale is invalid", () => {
		localStorage.setItem(LOCALE_STORAGE_KEY, "pt");
		render(
			<I18nextProvider i18n={createI18nInstance()}>
				<App />
			</I18nextProvider>,
		);

		expect(screen.getByText("Accommodation management MVP")).toBeTruthy();
		expect(screen.getByText("Billing")).toBeTruthy();
	});
});
