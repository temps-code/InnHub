import { joinClasses } from "../../utils/classNames";

type InitialsAvatarTone = "neutral" | "primary" | "accent";
type InitialsAvatarSize = "sm" | "md" | "lg";

export interface InitialsAvatarProps {
	ariaLabel: string;
	className?: string;
	initials?: string | null;
	name?: string | null;
	size?: InitialsAvatarSize;
	tone?: InitialsAvatarTone;
}

const toneClasses: Record<InitialsAvatarTone, string> = {
	neutral: "bg-[var(--color-border)] text-[var(--color-heading)]",
	primary: "bg-[var(--color-primary)] text-white",
	accent: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
};

const sizeClasses: Record<InitialsAvatarSize, string> = {
	sm: "h-8 w-8 text-xs",
	md: "h-10 w-10 text-sm",
	lg: "h-12 w-12 text-base",
};

function deriveInitials(name?: string | null): string {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/).filter(Boolean);

	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
	return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function InitialsAvatar({
	ariaLabel,
	className,
	initials,
	name,
	size = "md",
	tone = "primary",
}: InitialsAvatarProps) {
	const content = initials?.trim()
		? initials.trim().toUpperCase()
		: deriveInitials(name);

	return (
		<span
			aria-label={ariaLabel}
			className={joinClasses(
				"inline-flex shrink-0 items-center justify-center rounded-full font-bold",
				sizeClasses[size],
				toneClasses[tone],
				className,
			)}
		>
			{content}
		</span>
	);
}
