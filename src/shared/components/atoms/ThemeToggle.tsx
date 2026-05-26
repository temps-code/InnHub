import { Moon, Sun } from "lucide-react";
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
				<Moon data-testid="moon-icon" size={20} aria-hidden="true" />
			) : (
				<Sun data-testid="sun-icon" size={20} aria-hidden="true" />
			)}
		</Button>
	);
}
