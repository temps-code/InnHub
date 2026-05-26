import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

import type { ProtectedRouteMeta } from "../routes/routeMetadata";
import type { GroupedRouteItem } from "../routes/routeMetadata";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { Button } from "../../shared/components/atoms/Button";

type AppShellProps = {
	activeRoute?: ProtectedRouteMeta;
	children: ReactNode;
	items: readonly GroupedRouteItem[];
};

export function AppShell({ activeRoute, children, items }: AppShellProps) {
	const { t } = useTranslation();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const workspaceLabel = activeRoute
		? t("shell.workspace.ariaLabel", { title: t(activeRoute.titleKey) })
		: undefined;

	return (
		<div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] md:grid md:grid-cols-[240px_1fr]">
			{/* Backdrop Overlay */}
			{isSidebarOpen && (
				<div
					data-testid="sidebar-backdrop"
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col h-full transform transition-transform duration-300 ease-in-out md:static md:w-auto md:translate-x-0 ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="mb-8 flex items-center justify-between gap-3 font-bold text-[var(--color-heading)] px-5 pt-5">
					<div className="flex items-center gap-3">
						<img
							className="h-9 w-9 rounded-xl"
							src="/innhub-app-icon.svg"
							alt=""
							aria-hidden="true"
						/>
						<span>InnHub</span>
					</div>
					{/* Close button in mobile drawer header */}
					<Button
						aria-label="Close navigation menu"
						className="md:hidden h-8 w-8 p-0 flex items-center justify-center"
						onClick={() => setIsSidebarOpen(false)}
						variant="ghost"
						size="sm"
					>
						<X size={16} />
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto min-h-0 px-5">
					<SidebarNav items={items} onClose={() => setIsSidebarOpen(false)} />
				</div>
			</aside>

			<div className="min-w-0">
				<TopBar
					activeRoute={activeRoute}
					onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
				/>
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
