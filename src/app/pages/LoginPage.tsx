import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BedDouble, CalendarDays, DollarSign, Users } from "lucide-react";

import { LoginForm } from "../../features/auth/components/LoginForm";
import { PreferenceBar } from "../../shared/components";

type LoginLocationState = {
	readonly from?: { readonly pathname?: string };
};

const showcaseModules = [
	{ key: "rooms", icon: BedDouble },
	{ key: "reservations", icon: CalendarDays },
	{ key: "guests", icon: Users },
	{ key: "billing", icon: DollarSign },
] as const;

const showcaseStats = [
	{ key: "occupancy", value: "72%", delta: "+8%" },
	{ key: "reservations", value: "18", delta: "+3" },
	{ key: "housekeeping", value: "24", delta: "+6" },
	{ key: "outOfOrder", value: "2", delta: "-1" },
] as const;

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
			className="relative min-h-screen overflow-hidden bg-[var(--color-background)] px-4 py-8"
			aria-labelledby="login-title"
		>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--color-primary)_18%,transparent)_0%,transparent_44%)]" />
			<div className="relative mx-auto grid w-full max-w-[1380px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
				<section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)]/92 p-6 shadow-[var(--shadow-panel)] backdrop-blur md:p-8 lg:p-10">
					<div className="mb-8 flex items-center gap-4">
						<img
							className="h-12 w-12 rounded-xl"
							src="/innhub-app-icon.svg"
							alt=""
							aria-hidden="true"
						/>
						<p className="m-0 text-5xl font-bold tracking-tight text-[var(--color-heading)] max-sm:text-4xl">
							InnHub
						</p>
					</div>
					<h2 className="m-0 text-[clamp(2rem,4vw,4rem)] leading-[0.98] font-bold tracking-[-0.04em] text-[var(--color-heading)]">
						{t("auth.loginShowcase.headlinePrimary")} <br />
						<span className="text-[var(--color-primary)]">
							{t("auth.loginShowcase.headlineAccent")}
						</span>
					</h2>
					<p className="mt-5 mb-0 max-w-2xl text-lg text-[var(--color-muted)]">
						{t("auth.loginShowcase.description")}
					</p>

					<div className="mt-8 border-t border-[var(--color-border)] pt-6">
						<p className="m-0 text-xs font-bold tracking-[0.2em] text-[var(--color-primary)] uppercase">
							{t("auth.loginShowcase.coreModules")}
						</p>
						<ul
							className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4"
							aria-label={t("auth.loginShowcase.coreModules")}
						>
							{showcaseModules.map((module) => {
								const Icon = module.icon;
								return (
									<li
										key={module.key}
										className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
									>
										<Icon
											aria-hidden="true"
											className="mb-3 rounded-lg bg-[var(--color-primary-soft)] p-2 text-[var(--color-primary)]"
											size={32}
										/>
										<p className="m-0 text-lg font-semibold text-[var(--color-heading)]">
											{t(`auth.loginShowcase.modules.${module.key}`)}
										</p>
									</li>
								);
							})}
						</ul>
					</div>

					<section
						className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
						aria-labelledby="operations-overview-title"
					>
						<div className="mb-4 flex items-center justify-between">
							<h3
								id="operations-overview-title"
								className="m-0 text-lg font-semibold text-[var(--color-heading)]"
							>
								{t("auth.loginShowcase.operationsOverview")}
							</h3>
							<span className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted)]">
								{t("auth.loginShowcase.today")}
							</span>
						</div>
						<ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-4">
							{showcaseStats.map((stat) => (
								<li
									key={stat.key}
									className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3"
								>
									<p className="m-0 text-sm text-[var(--color-muted)]">
										{t(`auth.loginShowcase.stats.${stat.key}`)}
									</p>
									<p className="my-1 text-3xl font-semibold text-[var(--color-heading)]">
										{stat.value}
									</p>
									<p className="m-0 text-sm text-[var(--color-primary)]">
										{stat.delta} {t("auth.loginShowcase.deltaLabel")}
									</p>
								</li>
							))}
						</ul>
					</section>
				</section>

				<section className="relative rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-[var(--shadow-panel)] backdrop-blur md:p-8 lg:p-9">
					<div className="absolute top-4 right-4 z-20">
						<PreferenceBar />
					</div>
					<div className="mb-6 space-y-3 pr-20">
						<p className="m-0 text-xs font-bold tracking-[0.18em] text-[var(--color-primary)] uppercase">
							{t("auth.login.eyebrow")}
						</p>
						<h1
							id="login-title"
							className="m-0 text-4xl leading-tight font-bold text-[var(--color-heading)] max-[640px]:text-[2rem]"
						>
							{t("auth.login.title")}
						</h1>
						<p className="m-0 text-sm leading-6 text-[var(--color-muted)]">
							{t("auth.login.description")}
						</p>
					</div>
					<LoginForm
						onAuthenticated={() => navigate(redirectPath, { replace: true })}
					/>
				</section>
			</div>
		</main>
	);
}
