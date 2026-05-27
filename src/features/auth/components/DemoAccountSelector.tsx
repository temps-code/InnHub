import { useTranslation } from "react-i18next";

import { getAllDemoAccounts } from "../services/demoCredentials";
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

export function DemoAccountSelector({
	onSelect,
}: DemoAccountSelectorProps) {
	const { t } = useTranslation();
	const accounts = getAllDemoAccounts();

	return (
		<div className="grid gap-3">
			{accounts.map((account) => (
				<button
					className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
					key={account.role}
					onClick={() => onSelect({ email: account.email, password: account.password })}
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
		</div>
	);
}
