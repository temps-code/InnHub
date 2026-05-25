import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "./Button";

export function ThemeToggle() {
	const { t } = useTranslation();
	const { theme, toggleTheme } = useTheme();

	const isLight = theme === "light";
	const ariaLabel = isLight
		? t("preferences.theme.toggleDark")
		: t("preferences.theme.toggleLight");

	return (
		<Button
			aria-label={ariaLabel}
			onClick={toggleTheme}
			variant="ghost"
			size="sm"
			className="h-10 w-10 p-0 flex items-center justify-center text-[var(--color-heading)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2"
		>
			{isLight ? (
				// Moon icon
				<svg
					data-testid="moon-icon"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
					/>
				</svg>
			) : (
				// Sun icon
				<svg
					data-testid="sun-icon"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 3v2.25m0 13.5V21M5.03 5.03l1.59 1.59m10.76 10.76l1.59 1.59M3 12h2.25m13.5 0H21M5.03 18.97l1.59-1.59m10.76-10.76l1.59-1.59M12 18.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5Z"
					/>
				</svg>
			)}
		</Button>
	);
}
