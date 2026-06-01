import { joinClasses } from "../../utils/classNames";

export const inputClasses = joinClasses(
	"rounded-xl border px-4 py-2.5 text-sm text-[var(--color-heading)] outline-none transition",
	"focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
);

export const inputErrorClasses = "border-red-500";

export const inputDefaultClasses =
	"border-[var(--color-border)] bg-[var(--color-surface)]";
