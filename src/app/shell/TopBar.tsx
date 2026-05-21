import { useTranslation } from "react-i18next";

import type { ProtectedRouteMeta } from "../routes/routeMetadata";

type TopBarProps = {
	activeRoute?: ProtectedRouteMeta;
};

export function TopBar({ activeRoute }: TopBarProps) {
	const { t } = useTranslation();

	return (
		<header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 md:px-8">
			<p className="m-0 text-xs font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">{t("shell.topbar.eyebrow")}</p>
			<p className="m-0 text-xl font-bold text-[var(--color-heading)]">{activeRoute ? t(activeRoute.titleKey) : t("shell.topbar.fallbackTitle")}</p>
			<p className="m-0 text-sm text-[var(--color-muted)]">{t("shell.topbar.workspaceLabel")}</p>
		</header>
	);
}
