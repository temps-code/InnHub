import type { ReactNode } from "react";

import { joinClasses } from "../../utils/classNames";

// ── Types ────────────────────────────────────────────────────────────

export interface FormFieldProps {
	readonly children: ReactNode;
	readonly error?: string;
	readonly htmlFor?: string;
	readonly label: string;
}

// ── Component ────────────────────────────────────────────────────────

export function FormField({ children, error, htmlFor, label }: FormFieldProps) {
	return (
		<div className="flex flex-col gap-1">
			<label
				className="text-sm font-medium text-[var(--color-muted)]"
				htmlFor={htmlFor}
			>
				{label}
			</label>
			{children}
			{error ? (
				<span className="text-xs text-red-500" role="alert">
					{error}
				</span>
			) : null}
		</div>
	);
}

// ── Input styles (reusable for form inputs) ──────────────────────────

export const inputClasses = joinClasses(
	"rounded-xl border px-4 py-2.5 text-sm text-[var(--color-heading)] outline-none transition",
	"focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
);

export const inputErrorClasses = "border-red-500";

export const inputDefaultClasses = "border-[var(--color-border)] bg-[var(--color-surface)]";
