import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
	DEFAULT_DEMO_PROPERTY_ID,
	getAllDemoProperties,
	getDemoAccountsForProperty,
	type DemoPropertyId,
} from "../services/demoCredentials";
import type { LoginCredentials } from "../types";

export type DemoAccountSelectorProps = {
	readonly onSelect: (credentials: LoginCredentials) => void;
};

const ROLE_I18N_KEY: Record<string, string> = {
	administrator: "auth.roles.administrator",
	manager: "auth.roles.manager",
	receptionist: "auth.roles.receptionist",
	housekeeping: "auth.roles.housekeeping",
	maintenance: "auth.roles.maintenance",
};

const ROLE_DESC_KEY: Record<string, string> = {
	administrator: "auth.roles.administrator_desc",
	manager: "auth.roles.manager_desc",
	receptionist: "auth.roles.receptionist_desc",
	housekeeping: "auth.roles.housekeeping_desc",
	maintenance: "auth.roles.maintenance_desc",
};

export function DemoAccountSelector({ onSelect }: DemoAccountSelectorProps) {
	const { t } = useTranslation();
	const [selectedPropertyId, setSelectedPropertyId] = useState<DemoPropertyId>(
		DEFAULT_DEMO_PROPERTY_ID,
	);
	const properties = getAllDemoProperties();
	const accounts = getDemoAccountsForProperty(selectedPropertyId);

	return (
		<div className="grid gap-5">
			<section className="grid gap-2" aria-labelledby="demo-property-label">
				<div
					className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]"
					id="demo-property-label"
				>
					{t("auth.demoSelector.propertyLabel")}
				</div>
				<div className="grid gap-2 sm:grid-cols-2">
					{properties.map((property) => {
						const isSelected = property.id === selectedPropertyId;
						return (
							<button
								aria-pressed={isSelected}
								className={[
									"rounded-xl border px-4 py-3 text-left font-semibold transition",
									isSelected
										? "border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-heading)]"
										: "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted)] hover:border-[var(--color-primary)]",
								].join(" ")}
								key={property.id}
								onClick={() => setSelectedPropertyId(property.id)}
								type="button"
							>
								{t(property.nameKey)}
							</button>
						);
					})}
				</div>
			</section>

			<section className="grid gap-3" aria-labelledby="demo-role-label">
				<div
					className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]"
					id="demo-role-label"
				>
					{t("auth.demoSelector.roleLabel")}
				</div>
				{accounts.map((account) => (
					<button
						className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
						key={`${account.propertyId}-${account.role}`}
						onClick={() =>
							onSelect({ email: account.email, password: account.password })
						}
						type="button"
					>
						<div>
							<div className="font-bold text-[var(--color-heading)]">
								{t(ROLE_I18N_KEY[account.role] ?? account.role)}
							</div>
							<div className="mt-0.5 text-sm text-[var(--color-muted)]">
								{t(ROLE_DESC_KEY[account.role] ?? "")}
							</div>
						</div>
						<div className="ml-4 text-xs text-[var(--color-muted)]">
							{account.email}
						</div>
					</button>
				))}
			</section>
		</div>
	);
}
