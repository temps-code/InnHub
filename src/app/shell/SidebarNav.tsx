import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { GroupedRouteItem } from "../routes/routeMetadata";
import type { ProtectedRouteMeta } from "../routes/routeMetadata";

type SidebarNavProps = {
	items: readonly GroupedRouteItem[];
};

export function SidebarNav({ items }: SidebarNavProps) {
	const { t } = useTranslation();

	if (items.length === 0) {
		return null;
	}

	return (
		<nav aria-label={t("shell.sidebar.ariaLabel")}>
			{items.map((group) => (
				<section key={group.group}>
					<h2 className="m-0 mb-2 text-xs font-bold tracking-[0.14em] text-[var(--color-muted)] uppercase">
						{t(group.labelKey)}
					</h2>
					<ul className="m-0 grid list-none gap-2 p-0">
						{group.items.map(
							(item: ProtectedRouteMeta) => (
								<li key={item.id}>
									<NavLink
										className={({ isActive }) =>
											[
												"flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold no-underline",
												isActive
													? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
													: "text-[var(--color-muted)] hover:bg-[var(--color-primary-soft)]",
											].join(" ")
										}
										to={item.href}
									>
										{item.icon ? (
											<item.icon
												aria-hidden="true"
												size={20}
											/>
										) : null}
										{t(item.labelKey)}
									</NavLink>
								</li>
							),
						)}
					</ul>
				</section>
			))}
		</nav>
	);
}
