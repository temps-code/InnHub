import type { ReactNode } from "react";

import { joinClasses } from "../../utils/classNames";

type StatusBadgeTone =
	| "neutral"
	| "success"
	| "warning"
	| "danger"
	| "info"
	| "accent";
type StatusBadgeSize = "sm" | "md";

export interface StatusBadgeProps {
	className?: string;
	label: ReactNode;
	size?: StatusBadgeSize;
	tone?: StatusBadgeTone;
}

const baseClasses =
	"inline-flex w-fit items-center rounded-full border font-bold tracking-[0.04em]";

const toneClasses: Record<StatusBadgeTone, string> = {
	neutral:
		"border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]",
	success: "border-emerald-200 bg-emerald-50 text-emerald-700",
	warning: "border-amber-200 bg-amber-50 text-amber-700",
	danger: "border-red-200 bg-red-50 text-red-700",
	info: "border-sky-200 bg-sky-50 text-sky-700",
	accent:
		"border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
};

const sizeClasses: Record<StatusBadgeSize, string> = {
	sm: "px-2 py-0.5 text-xs",
	md: "px-3 py-1 text-sm",
};

export function StatusBadge({
	className,
	label,
	size = "md",
	tone = "neutral",
}: StatusBadgeProps) {
	return (
		<span className={joinClasses(baseClasses, toneClasses[tone], sizeClasses[size], className)}>
			{label}
		</span>
	);
}
