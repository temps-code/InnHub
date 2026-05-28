import type { ReactNode } from "react";

import { joinClasses } from "../../utils/classNames";

type MetricCardTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface MetricCardProps {
	className?: string;
	helperText?: ReactNode;
	label: ReactNode;
	tone?: MetricCardTone;
	trend?: ReactNode;
	value: ReactNode;
}

const toneClasses: Record<MetricCardTone, string> = {
	neutral: "border-[var(--color-border)]",
	success: "border-emerald-200",
	warning: "border-amber-200",
	danger: "border-red-200",
	info: "border-sky-200",
};

export function MetricCard({
	className,
	helperText,
	label,
	tone = "neutral",
	trend,
	value,
}: MetricCardProps) {
	return (
		<article
			className={joinClasses(
				"rounded-2xl border bg-[var(--color-background)] p-4 text-[var(--color-heading)]",
				toneClasses[tone],
				className,
			)}
		>
			<p className="m-0 text-sm font-bold tracking-[0.08em] text-[var(--color-muted)] uppercase">
				{label}
			</p>
			<div className="mt-2 flex flex-wrap items-end justify-between gap-3">
				<p className="m-0 text-3xl font-bold tracking-[-0.04em]">{value}</p>
				{trend ? <div className="text-sm font-bold">{trend}</div> : null}
			</div>
			{helperText ? (
				<p className="mt-3 mb-0 text-sm text-[var(--color-muted)]">
					{helperText}
				</p>
			) : null}
		</article>
	);
}
