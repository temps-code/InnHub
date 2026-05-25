import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export interface UseThemeResult {
	theme: Theme;
	toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "innhub.theme";

function isTheme(value: unknown): value is Theme {
	return value === "light" || value === "dark";
}

function resolveInitialTheme(): Theme {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (isTheme(stored)) {
			return stored;
		}
	} catch {
		// Ignore storage access errors on server or locked environments
	}

	try {
		if (
			typeof window !== "undefined" &&
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		) {
			return "dark";
		}
	} catch {
		// Ignore matchMedia errors
	}

	return "light";
}

export function useTheme(): UseThemeResult {
	const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

	useEffect(() => {
		try {
			document.documentElement.setAttribute("data-theme", theme);
		} catch {
			// Fail-safe for non-browser/server render
		}
	}, [theme]);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, newTheme);
		} catch {
			// Fail-safe for disabled storage
		}
	};

	return {
		theme,
		toggleTheme,
	};
}
