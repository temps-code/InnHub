import type { ElementType, ReactNode } from "react";

type PageSectionVariant = "panel" | "quiet";
type PageSectionTitleLevel = 1 | 2 | 3;

export interface PageSectionProps {
	actions?: ReactNode;
	children?: ReactNode;
	className?: string;
	description?: ReactNode;
	eyebrow?: ReactNode;
	title?: ReactNode;
	titleId?: string;
	titleLevel?: PageSectionTitleLevel;
	variant?: PageSectionVariant;
}

const variantClasses: Record<PageSectionVariant, string> = {
	panel:
		"rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)]",
	quiet: "py-4",
};

const titleClasses: Record<PageSectionTitleLevel, string> = {
	1: "text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.9] tracking-[-0.08em]",
	2: "text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] tracking-[-0.04em]",
	3: "text-[clamp(1.35rem,3vw,2rem)] leading-[1.1] tracking-[-0.03em]",
};

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export function PageSection({
	actions,
	children,
	className,
	description,
	eyebrow,
	title,
	titleId,
	titleLevel = 2,
	variant = "panel",
}: PageSectionProps) {
	const TitleTag = `h${titleLevel}` as ElementType;
	const isLabelledRegion = Boolean(title && titleId);

	return (
		<section
			aria-labelledby={isLabelledRegion ? titleId : undefined}
			className={joinClasses(variantClasses[variant], className)}
		>
			<div className="flex flex-wrap items-start justify-between gap-6">
				<div className="max-w-3xl">
					{eyebrow ? (
						<p className="m-0 text-[0.85rem] font-bold tracking-[0.16em] text-[var(--color-primary)] uppercase">
							{eyebrow}
						</p>
					) : null}
					{title ? (
						<TitleTag
							className={joinClasses(
								"m-0 font-bold text-[var(--color-heading)]",
								Boolean(eyebrow) && "mt-2",
								titleClasses[titleLevel],
							)}
							id={titleId}
						>
							{title}
						</TitleTag>
					) : null}
					{description ? (
						<p className="mt-4 mb-0 text-[var(--color-muted)]">{description}</p>
					) : null}
				</div>
				{actions ? <div className="flex items-center gap-3">{actions}</div> : null}
			</div>
			{children ? <div className="mt-8">{children}</div> : null}
		</section>
	);
}
