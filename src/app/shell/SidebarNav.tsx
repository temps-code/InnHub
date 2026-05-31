import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { GroupedRouteItem } from "../routes/routeMetadata";
import type { ProtectedRouteMeta } from "../routes/routeMetadata";

export type SidebarNavProps = {
	items: readonly GroupedRouteItem[];
	onClose?: () => void;
	pinnedItem?: ProtectedRouteMeta;
};

const navItemBaseClass =
	"flex items-center gap-2.5 rounded-2xl border border-transparent px-3.5 py-2.5 text-sm font-semibold no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]";

const navItemInactiveClass =
	"text-[var(--color-muted)] hover:border-[var(--color-border)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-heading)]";

const navItemActiveClass =
	"bg-gradient-to-r from-[#5b3df5] to-[#7c3aed] text-white shadow-[0_10px_24px_rgb(91_61_245_/_35%)]";

export function SidebarNav({ items, onClose, pinnedItem }: SidebarNavProps) {
	const { t } = useTranslation();

	if (items.length === 0 && !pinnedItem) {
		return null;
	}

	return (
		<nav aria-label={t("shell.sidebar.ariaLabel")} className="space-y-5">
			{items.map((group) => (
				<section key={group.group} className="space-y-2">
					<h2 className="m-0 text-[11px] font-bold tracking-[0.14em] text-[var(--color-muted)] uppercase">
						{t(group.labelKey)}
					</h2>
					<ul className="m-0 grid list-none gap-1.5 p-0">
						{group.items.map((item: ProtectedRouteMeta) => (
							<li key={item.id}>
								<NavLink
									className={({ isActive }) =>
										[
											navItemBaseClass,
											isActive ? navItemActiveClass : navItemInactiveClass,
										].join(" ")
									}
									to={item.href}
									onClick={onClose}
								>
									{item.icon ? (
										<item.icon aria-hidden="true" size={20} />
									) : null}
									{t(item.labelKey)}
								</NavLink>
							</li>
						))}
					</ul>
				</section>
			))}
			{pinnedItem ? (
				<>
					<hr className="my-4 border-[var(--color-border)]" />
					<NavLink
						className={({ isActive }) =>
							[
								navItemBaseClass,
								isActive ? navItemActiveClass : navItemInactiveClass,
							].join(" ")
						}
						to={pinnedItem.href}
						onClick={onClose}
					>
						{pinnedItem.icon ? (
							<pinnedItem.icon aria-hidden="true" size={20} />
						) : null}
						{t(pinnedItem.labelKey)}
					</NavLink>
				</>
			) : null}
		</nav>
	);
}
