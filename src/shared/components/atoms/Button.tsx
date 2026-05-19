import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children?: ReactNode;
	fullWidth?: boolean;
	isLoading?: boolean;
	size?: ButtonSize;
	variant?: ButtonVariant;
}

const baseClasses =
	"inline-flex items-center justify-center rounded-full font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"bg-[var(--color-primary)] text-white shadow-sm hover:brightness-95 focus-visible:outline-[var(--color-primary)]",
	secondary:
		"border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-heading)] hover:border-[var(--color-primary)] focus-visible:outline-[var(--color-primary)]",
	ghost:
		"bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] focus-visible:outline-[var(--color-primary)]",
	danger:
		"bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "min-h-9 px-3 text-sm",
	md: "min-h-11 px-5 text-base",
	lg: "min-h-12 px-6 text-lg",
};

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export function Button({
	children,
	className,
	disabled,
	fullWidth = false,
	isLoading = false,
	size = "md",
	type = "button",
	variant = "primary",
	...props
}: ButtonProps) {
	const isUnavailable = disabled || isLoading;

	return (
		<button
			aria-busy={isLoading || undefined}
			className={joinClasses(
				baseClasses,
				variantClasses[variant],
				sizeClasses[size],
				fullWidth && "w-full",
				className,
			)}
			disabled={isUnavailable}
			type={type}
			{...props}
		>
			{children}
		</button>
	);
}
