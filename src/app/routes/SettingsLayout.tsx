import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SettingsLayout() {
	const { t } = useTranslation();

	return (
		<>
			<nav aria-label={t("settings.subNavAriaLabel")}>
				<ul className="m-0 mb-6 flex list-none gap-4 border-b border-[var(--color-border)] p-0 pb-2">
					<li>
						<NavLink
							className={({ isActive }) =>
								[
									"text-sm font-bold no-underline",
									isActive
										? "text-[var(--color-primary)]"
										: "text-[var(--color-muted)] hover:text-[var(--color-heading)]",
								].join(" ")
							}
							to="/app/settings/property"
						>
							{t("routes.protected.propertyProfile.label")}
						</NavLink>
					</li>
					<li>
						<NavLink
							className={({ isActive }) =>
								[
									"text-sm font-bold no-underline",
									isActive
										? "text-[var(--color-primary)]"
										: "text-[var(--color-muted)] hover:text-[var(--color-heading)]",
								].join(" ")
							}
							to="/app/settings/users"
						>
							{t("routes.protected.users.label")}
						</NavLink>
					</li>
					<li>
						<NavLink
							className={({ isActive }) =>
								[
									"text-sm font-bold no-underline",
									isActive
										? "text-[var(--color-primary)]"
										: "text-[var(--color-muted)] hover:text-[var(--color-heading)]",
								].join(" ")
							}
							to="/app/settings/profile"
						>
							{t("routes.protected.profile.label")}
						</NavLink>
					</li>
				</ul>
			</nav>
			<Outlet />
		</>
	);
}
