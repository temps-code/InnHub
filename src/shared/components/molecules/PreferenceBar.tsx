import { LanguageToggle } from "../atoms/LanguageToggle";
import { ThemeToggle } from "../atoms/ThemeToggle";

export function PreferenceBar() {
	return (
		<div className="flex items-center gap-2">
			<ThemeToggle />
			<LanguageToggle />
		</div>
	);
}
