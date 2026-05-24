import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuthSession } from "../../features/auth";
import { protectedRoutes, findProtectedRoute } from "../routes/routeMetadata";
import { AppShell } from "../shell/AppShell";

function CenteredAuthState({ children }: { readonly children: ReactNode }) {
	return (
		<main className="mx-auto grid min-h-screen w-[min(720px,calc(100%_-_32px))] place-items-center py-12">
			<section className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)]">
				{children}
			</section>
		</main>
	);
}

export function ProtectedLayout() {
	const { t } = useTranslation();
	const { state } = useAuthSession();
	const location = useLocation();
	const activeRoute = findProtectedRoute(location.pathname);

	if (state.status === "loading") {
		return (
			<CenteredAuthState>
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("auth.states.loading")}
				</p>
			</CenteredAuthState>
		);
	}

	if (state.status === "unauthenticated") {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	if (state.status === "invalid") {
		return (
			<CenteredAuthState>
				<p className="m-0 text-sm font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">
					{t("auth.states.invalidEyebrow")}
				</p>
				<h1 className="mt-3 mb-3 text-3xl font-bold text-[var(--color-heading)]">
					{t("auth.states.invalidTitle")}
				</h1>
				<p className="m-0 text-[var(--color-muted)]">
					{t("auth.states.invalidDescription")}
				</p>
			</CenteredAuthState>
		);
	}

	return (
		<AppShell activeRoute={activeRoute} items={protectedRoutes}>
			<Outlet />
		</AppShell>
	);
}
