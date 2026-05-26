import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { ProtectedRouteMeta } from "../routes/routeMetadata";
import type { GroupedRouteItem } from "../routes/routeMetadata";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";

type AppShellProps = {
	activeRoute?: ProtectedRouteMeta;
	children: ReactNode;
	items: readonly GroupedRouteItem[];
};

export function AppShell({ activeRoute, children, items }: AppShellProps) {
	const { t } = useTranslation();
	const workspaceLabel = activeRoute
		? t("shell.workspace.ariaLabel", { title: t(activeRoute.titleKey) })
		: undefined;

	return (
		<div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] md:grid md:grid-cols-[240px_1fr]">
			<aside className="border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5">
				<div className="mb-8 flex items-center gap-3 font-bold text-[var(--color-heading)]">
					<img
						className="h-9 w-9 rounded-xl"
						src="/innhub-app-icon.svg"
						alt=""
						aria-hidden="true"
					/>
					<span>InnHub</span>
				</div>
				<SidebarNav items={items} />
			</aside>
			<div className="min-w-0">
				<TopBar activeRoute={activeRoute} />
				<main
					id="app-workspace"
					className="p-6 md:p-8"
					aria-label={workspaceLabel}
				>
					{children}
				</main>
			</div>
		</div>
	);
}
