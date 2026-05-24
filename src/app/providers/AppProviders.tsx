import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { AuthSessionProvider } from "../../features/auth";
import { i18n } from "../../shared/i18n/config";

type AppProvidersProps = {
	children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<I18nextProvider i18n={i18n}>
			<AuthSessionProvider>{children}</AuthSessionProvider>
		</I18nextProvider>
	);
}
