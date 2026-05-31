import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Building2, ChevronDown, X } from "lucide-react";

import type { ProtectedRouteMeta } from "../routes/routeMetadata";
import type { GroupedRouteItem } from "../routes/routeMetadata";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { Button } from "../../shared/components/atoms/Button";

type AppShellProps = {
	activeRoute?: ProtectedRouteMeta;
	children: ReactNode;
	items: readonly GroupedRouteItem[];
	pinnedItem?: ProtectedRouteMeta;
};

export function AppShell({
	activeRoute,
	children,
	items,
	pinnedItem,
}: AppShellProps) {
	const { t } = useTranslation();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const workspaceLabel = activeRoute
		? t("shell.workspace.ariaLabel", { title: t(activeRoute.titleKey) })
		: undefined;

	return (
		<div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] md:grid md:grid-cols-[280px_1fr]">
			{/* Backdrop Overlay */}
			{isSidebarOpen && (
				<div
					data-testid="sidebar-backdrop"
					className="fixed inset-0 z-40 bg-[rgb(15_23_42_/_52%)] backdrop-blur-[1px] md:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-panel)] flex h-full flex-col transform transition-transform duration-300 ease-in-out md:static md:w-[280px] md:translate-x-0 ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="mb-6 flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 pb-4 pt-5 font-bold text-[var(--color-heading)]">
					<div className="flex items-center gap-3">
						<img
							className="h-10 w-10 rounded-xl"
							src="/innhub-app-icon.svg"
							alt=""
							aria-hidden="true"
						/>
						<span className="text-xl tracking-tight">InnHub</span>
					</div>
					{/* Close button in mobile drawer header */}
					<Button
						aria-label="Close navigation menu"
						className="h-8 w-8 p-0 md:hidden"
						onClick={() => setIsSidebarOpen(false)}
						variant="ghost"
						size="sm"
					>
						<X size={16} />
					</Button>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
					<SidebarNav
						items={items}
						onClose={() => setIsSidebarOpen(false)}
						pinnedItem={pinnedItem}
					/>
				</div>
				<div
					aria-label={t("shell.sidebar.property.ariaLabel")}
					className="mx-4 mb-4 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3"
				>
					<div className="flex items-center gap-2.5">
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
							<Building2 aria-hidden="true" size={16} />
						</span>
						<div>
							<p className="m-0 text-sm font-semibold text-[var(--color-heading)]">
								{t("shell.sidebar.property.name")}
							</p>
							<p className="m-0 text-xs text-[var(--color-muted)]">
								{t("shell.sidebar.property.location")}
							</p>
						</div>
					</div>
					<ChevronDown
						aria-hidden="true"
						className="text-[var(--color-muted)]"
						size={16}
					/>
				</div>
			</aside>

			<div className="min-w-0">
				<TopBar
					activeRoute={activeRoute}
					onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
				/>
				<main
					id="app-workspace"
					className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-5 md:px-8 md:py-7"
					aria-label={workspaceLabel}
				>
					{children}
				</main>
			</div>
		</div>
	);
}
