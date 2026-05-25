import { useTranslation } from "react-i18next";
import { useLocale } from "../../hooks/useLocale";
import { Button } from "./Button";

export function LanguageToggle() {
	const { t } = useTranslation();
	const { locale, toggleLocale } = useLocale();

	const isEn = locale === "en";
	const ariaLabel = isEn
		? t("preferences.locale.toggleEs")
		: t("preferences.locale.toggleEn");

	return (
		<Button
			aria-label={ariaLabel}
			onClick={toggleLocale}
			variant="ghost"
			size="sm"
			className="h-10 px-2 flex items-center justify-center text-sm font-bold text-[var(--color-heading)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2"
		>
			{locale.toUpperCase()}
		</Button>
	);
}
