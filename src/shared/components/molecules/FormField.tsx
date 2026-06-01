import type { ReactNode } from "react";

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
