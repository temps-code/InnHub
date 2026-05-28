import type { ReactNode } from "react";

import { joinClasses } from "../../utils/classNames";

export interface ModuleCardProps {
	action?: ReactNode;
	className?: string;
	description?: ReactNode;
	eyebrow?: ReactNode;
	icon?: ReactNode;
	title: ReactNode;
}

export function ModuleCard({
	action,
	className,
	description,
	eyebrow,
	icon,
	title,
}: ModuleCardProps) {
	return (
		<article
			className={joinClasses(
				"rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-[var(--color-heading)] transition hover:border-[var(--color-primary)]",
				className,
			)}
		>
			<div className="flex items-start gap-3">
				{icon ? (
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
						{icon}
					</div>
				) : null}
				<div className="min-w-0 flex-1">
					{eyebrow ? (
						<p className="m-0 text-xs font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">
							{eyebrow}
						</p>
					) : null}
					<h3 className="m-0 text-base font-bold">{title}</h3>
					{description ? (
						<p className="mt-2 mb-0 text-sm text-[var(--color-muted)]">
							{description}
						</p>
					) : null}
				</div>
			</div>
			{action ? <div className="mt-4">{action}</div> : null}
		</article>
	);
}
