import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";

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

	return (
		<header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 md:px-8">
			<div className="flex items-center gap-3">
				<Button
					aria-label="Open navigation menu"
					className="md:hidden h-10 w-10 p-0 flex items-center justify-center"
					onClick={onToggleSidebar}
					variant="ghost"
					size="sm"
				>
					<Menu size={20} />
				</Button>
				<div>
					<p className="m-0 text-xs font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">
						{t("shell.topbar.eyebrow")}
					</p>
					<p className="m-0 text-xl font-bold text-[var(--color-heading)]">
						{activeRoute
							? t(activeRoute.titleKey)
							: t("shell.topbar.fallbackTitle")}
					</p>
					<p className="m-0 text-sm text-[var(--color-muted)]">
						{t("shell.topbar.workspaceLabel")}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				{profileLabel ? (
					<span className="text-sm font-medium text-[var(--color-muted)]">
						{profileLabel}
					</span>
				) : null}
				<button
					className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-bold text-[var(--color-heading)]"
					onClick={() => void logout()}
					type="button"
				>
					{t("auth.logout")}
				</button>
				<PreferenceBar />
			</div>
		</header>
	);
}
