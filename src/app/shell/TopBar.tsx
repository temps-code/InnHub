import { useTranslation } from "react-i18next";
import { Bell, CalendarDays, Menu } from "lucide-react";

import { useAuthSession } from "../../features/auth";
import { PreferenceBar } from "../../shared/components";
import { Button } from "../../shared/components/atoms/Button";
import type { ProtectedRouteMeta } from "../routes/routeMetadata";

type TopBarProps = {
	activeRoute?: ProtectedRouteMeta;
	onToggleSidebar?: () => void;
};

export function TopBar({ activeRoute, onToggleSidebar }: TopBarProps) {
	const { t } = useTranslation();
	const { logout, state } = useAuthSession();
	const profileLabel =
		state.status === "authenticated"
			? (state.session.profile.fullName ?? state.session.user.email)
			: undefined;
	const avatarText = profileLabel
		? profileLabel
				.split(" ")
				.map((part) => part[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "IH";

	return (
		<header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[rgb(255_255_255_/_90%)] px-4 py-3 backdrop-blur md:flex-nowrap md:px-8 md:py-3 dark:bg-[rgb(15_23_42_/_82%)]">
			<div className="flex items-center gap-3">
				<Button
					aria-label="Open navigation menu"
					className="h-10 w-10 p-0 md:hidden"
					onClick={onToggleSidebar}
					variant="ghost"
					size="sm"
				>
					<Menu size={20} />
				</Button>
				<div className="space-y-0.5">
					<p className="m-0 text-[11px] font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">
						{t("shell.topbar.eyebrow")}
					</p>
					<p className="m-0 text-lg font-bold text-[var(--color-heading)] sm:text-xl">
						{activeRoute
							? t(activeRoute.titleKey)
							: t("shell.topbar.fallbackTitle")}
					</p>
					<p className="m-0 text-sm text-[var(--color-muted)]">
						{activeRoute
							? t(activeRoute.descriptionKey)
							: t("shell.topbar.workspaceLabel")}
					</p>
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
				<div className="hidden items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-heading)] lg:flex">
					<CalendarDays aria-hidden="true" size={15} />
					<span>{t("shell.topbar.dateLabel")}</span>
				</div>
				<span
					aria-label={t("shell.topbar.notificationsLabel")}
					className="hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-heading)] lg:inline-flex"
				>
					<Bell aria-hidden="true" size={16} />
				</span>
				<span
					aria-label={t("shell.topbar.avatarAriaLabel")}
					className="hidden h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white md:inline-flex"
				>
					{avatarText}
				</span>
				{profileLabel ? (
					<span className="hidden text-sm font-medium text-[var(--color-muted)] xl:inline">
						{profileLabel}
					</span>
				) : null}
				<Button onClick={() => void logout()} variant="outline">
					{t("auth.logout")}
				</Button>
				<PreferenceBar />
			</div>
		</header>
	);
}
