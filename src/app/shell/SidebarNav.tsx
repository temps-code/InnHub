import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { ProtectedRouteMeta } from "../routes/routeMetadata";

type SidebarNavProps = {
	items: readonly ProtectedRouteMeta[];
};

export function SidebarNav({ items }: SidebarNavProps) {
	const { t } = useTranslation();

	return (
		<nav aria-label={t("shell.sidebar.ariaLabel")}>
			<ul className="m-0 grid list-none gap-2 p-0">
				{items.map((item) => (
					<li key={item.id}>
						<NavLink className={({ isActive }) => ["flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold no-underline", isActive ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "text-[var(--color-muted)] hover:bg-[var(--color-primary-soft)]"].join(" ")} to={item.href}>
							{item.icon ? (
								<item.icon aria-hidden="true" size={20} />
							) : null}
							{t(item.labelKey)}
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	);
}
