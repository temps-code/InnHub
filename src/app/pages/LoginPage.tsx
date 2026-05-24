import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { LoginForm } from "../../features/auth/components/LoginForm";

type LoginLocationState = {
	readonly from?: { readonly pathname?: string };
};

function getRedirectPath(state: unknown): string {
	const locationState = state as LoginLocationState | null;
	const fromPath = locationState?.from?.pathname;

	return fromPath?.startsWith("/app/") ? fromPath : "/app/dashboard";
}

export function LoginPage() {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();
	const redirectPath = getRedirectPath(location.state);

	return (
		<main
			className="mx-auto grid min-h-screen w-[min(720px,calc(100%_-_32px))] place-items-center py-12"
			aria-labelledby="login-title"
		>
			<section className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)]">
				<p className="m-0 text-sm font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">
					{t("auth.login.eyebrow")}
				</p>
				<h1
					id="login-title"
					className="mt-3 mb-3 text-3xl font-bold text-[var(--color-heading)]"
				>
					{t("auth.login.title")}
				</h1>
				<p className="m-0 text-[var(--color-muted)]">
					{t("auth.login.description")}
				</p>
				<LoginForm
					onAuthenticated={() => navigate(redirectPath, { replace: true })}
				/>
			</section>
		</main>
	);
}
