import type { ReactNode } from "react";

import { joinClasses } from "../../utils/classNames";

// ── Types ────────────────────────────────────────────────────────────

type AlertVariant = "error" | "success" | "warning";

export interface AlertProps {
	readonly children: ReactNode;
	readonly className?: string;
	readonly variant?: AlertVariant;
	readonly role?: string;
}

// ── Variant styles ───────────────────────────────────────────────────

const variantClasses: Record<AlertVariant, string> = {
	error: "bg-red-50 text-red-700",
	success: "bg-green-50 text-green-700",
	warning: "bg-yellow-50 text-yellow-700",
};

// ── Component ────────────────────────────────────────────────────────

export function Alert({
	children,
	className,
	variant = "error",
	role = "alert",
}: AlertProps) {
	return (
		<div
			className={joinClasses(
				"mb-4 rounded-xl px-4 py-3 text-sm",
				variantClasses[variant],
				className,
			)}
			role={role}
		>
			{children}
		</div>
	);
}
