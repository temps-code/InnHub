import { afterEach, describe, expect, it } from "vitest";

import {
	LOCALE_STORAGE_KEY,
	getStoredLocale,
	setStoredLocale,
} from "../storage";

function memoryStorage(initial: Record<string, string> = {}): Storage {
	const data = new Map(Object.entries(initial));
	return {
		get length() {
			return data.size;
		},
		clear: () => data.clear(),
		getItem: (key) => data.get(key) ?? null,
		key: (index) => Array.from(data.keys())[index] ?? null,
		removeItem: (key) => data.delete(key),
		setItem: (key, value) => data.set(key, value),
	};
}

function throwingStorage(): Storage {
	const fail = () => {
		throw new Error("storage unavailable");
	};
	return {
		get length(): number {
			return fail();
		},
		clear: fail,
		getItem: fail,
		key: fail,
		removeItem: fail,
		setItem: fail,
	};
}

describe("locale storage", () => {
	afterEach(() => {
		Reflect.deleteProperty(globalThis, "localStorage");
	});

	it("uses the InnHub locale storage key", () => {
		expect(LOCALE_STORAGE_KEY).toBe("innhub.locale");
	});

	it.each([
		[undefined, null],
		["en", "en"],
		["es", "es"],
		["pt", null],
	])("reads persisted locale %s as %s", (stored, expected) => {
		const storage = memoryStorage(
			stored ? { [LOCALE_STORAGE_KEY]: stored } : undefined,
		);
		expect(getStoredLocale(storage)).toBe(expected);
	});

	it("returns null when storage reads fail", () => {
		expect(getStoredLocale(throwingStorage())).toBeNull();
	});

	it("returns null when global localStorage access fails", () => {
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			get: () => {
				throw new Error("localStorage unavailable");
			},
		});

		expect(getStoredLocale()).toBeNull();
	});

	it("writes valid locales and ignores write failures", () => {
		const storage = memoryStorage();
		setStoredLocale("es", storage);

		expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe("es");
		expect(() => setStoredLocale("en", throwingStorage())).not.toThrow();
	});

	it("ignores write failures when global localStorage access fails", () => {
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			get: () => {
				throw new Error("localStorage unavailable");
			},
		});

		expect(() => setStoredLocale("en")).not.toThrow();
	});
});
