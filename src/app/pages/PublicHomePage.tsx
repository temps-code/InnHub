import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	BedDouble,
	CalendarDays,
	ClipboardList,
	DollarSign,
	Sparkles,
	Users,
	Wrench,
	BarChart3,
} from "lucide-react";

import { ModuleCard, PreferenceBar } from "../../shared/components";

const foundationModuleKeys = [
	"rooms",
	"reservations",
	"guests",
	"housekeeping",
	"maintenance",
	"billing",
	"reports",
] as const;

const previewNavItems = [
	"dashboard",
	"rooms",
	"reservations",
	"guests",
	"housekeeping",
	"maintenance",
	"billing",
	"reports",
] as const;

const previewStats = [
	{ key: "rooms", value: "48", subKey: "roomsSub", icon: BedDouble },
	{
		key: "reservations",
		value: "12",
		subKey: "reservationsSub",
		icon: CalendarDays,
	},
	{ key: "guests", value: "28", subKey: "guestsSub", icon: Users },
] as const;

const previewOps = [
	{
		key: "housekeeping",
		value: "8",
		subKey: "housekeepingSub",
		icon: ClipboardList,
	},
	{ key: "maintenance", value: "5", subKey: "maintenanceSub", icon: Wrench },
	{ key: "billing", value: "6", subKey: "billingSub", icon: DollarSign },
	{ key: "reports", value: "7", subKey: "reportsSub", icon: BarChart3 },
] as const;

export function PublicHomePage() {
	const { t } = useTranslation();

	return (
		<main
			className="min-h-screen bg-[var(--color-background)]"
			aria-labelledby="app-title"
		>
			<header
				className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur"
				aria-label="Public home header"
			>
				<div className="mx-auto flex w-[min(1240px,calc(100%_-_32px))] items-center justify-between py-5 max-[760px]:w-[min(1240px,calc(100%_-_24px))] max-[760px]:py-4">
					<div className="flex items-center gap-3">
						<img
							className="h-10 w-10 rounded-xl"
							src="/innhub-app-icon.svg"
							alt=""
							aria-hidden="true"
						/>
						<span className="text-5xl font-bold tracking-tight text-[var(--color-heading)] max-sm:text-4xl">
							InnHub
						</span>
					</div>
					<div className="flex items-center gap-6 max-sm:gap-3">
						<nav aria-label={t("public.home.nav.ariaLabel")}>
							<ul className="m-0 flex list-none items-center gap-6 p-0 max-sm:gap-3">
								<li>
									<a
										className="text-sm font-medium text-[var(--color-heading)] no-underline hover:text-[var(--color-primary)]"
										href="#product"
									>
										{t("public.home.nav.product")}
									</a>
								</li>
								<li>
									<a
										className="text-sm font-medium text-[var(--color-heading)] no-underline hover:text-[var(--color-primary)]"
										href="#modules"
									>
										{t("public.home.nav.modules")}
									</a>
								</li>
								<li>
									<Link
										className="text-sm font-medium text-[var(--color-heading)] no-underline hover:text-[var(--color-primary)]"
										to="/login"
									>
										{t("public.home.nav.demo")}
									</Link>
								</li>
							</ul>
						</nav>
						<PreferenceBar />
					</div>
				</div>
			</header>

			<section
				id="product"
				className="mx-auto mt-8 grid w-[min(1240px,calc(100%_-_32px))] gap-6 lg:grid-cols-[1fr_1.05fr] max-[760px]:w-[min(1240px,calc(100%_-_24px))]"
			>
				<div className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)] max-sm:p-6">
					<h1
						id="app-title"
						className="m-0 max-w-xl text-[clamp(2.2rem,5.2vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.04em] text-[var(--color-heading)]"
					>
						{t("hero.title")}
					</h1>
					<p className="mt-4 mb-0 max-w-2xl text-[clamp(1rem,1.8vw,1.25rem)] leading-8 text-[var(--color-muted)]">
						{t("hero.description")}
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white no-underline shadow-[0_16px_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
							to="/login"
						>
							{t("public.home.loginLink")}
						</Link>
						<Link
							className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-3 font-semibold text-[var(--color-heading)] no-underline transition hover:bg-[var(--color-surface-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
							to="/app/dashboard"
						>
							{t("public.home.previewLink")}
						</Link>
					</div>
				</div>

				<section
					className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-panel)]"
					aria-labelledby="dashboard-preview-title"
				>
					<div className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 lg:grid-cols-[180px_1fr]">
						<div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
							<div className="mb-3 flex items-center gap-2">
								<img
									className="h-8 w-8 rounded-lg"
									src="/innhub-app-icon.svg"
									alt=""
									aria-hidden="true"
								/>
								<p className="m-0 text-sm font-semibold text-[var(--color-heading)]">
									InnHub
								</p>
							</div>
							<ul
								className="m-0 grid list-none gap-1.5 p-0"
								aria-label={t("public.home.preview.sidebarAria")}
							>
								{previewNavItems.map((item, index) => (
									<li
										key={item}
										className="rounded-lg px-2 py-1.5 text-sm text-[var(--color-muted)]"
										style={
											index === 0
												? {
														backgroundColor: "var(--color-primary-soft)",
														color: "var(--color-primary)",
														fontWeight: 600,
													}
												: undefined
										}
									>
										{t(`public.home.preview.sidebar.${item}`)}
									</li>
								))}
							</ul>
						</div>
						<div>
							<div className="mb-4 flex items-center justify-between">
								<div>
									<h2
										id="dashboard-preview-title"
										className="m-0 text-2xl font-bold text-[var(--color-heading)]"
									>
										{t("public.home.preview.title")}
									</h2>
									<p className="mt-1 mb-0 text-sm text-[var(--color-muted)]">
										{t("public.home.preview.subtitle")}
									</p>
								</div>
								<Sparkles
									aria-hidden="true"
									className="text-[var(--color-primary)]"
									size={18}
								/>
							</div>
							<ul
								className="m-0 grid list-none gap-3 p-0 md:grid-cols-3"
								aria-label={t("public.home.preview.statsAria")}
							>
								{previewStats.map((stat) => {
									const Icon = stat.icon;
									return (
										<li
											key={stat.key}
											className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
										>
											<Icon
												aria-hidden="true"
												className="mb-2 text-[var(--color-primary)]"
												size={20}
											/>
											<p className="m-0 text-sm text-[var(--color-muted)]">
												{t(`public.home.preview.stats.${stat.key}`)}
											</p>
											<p className="my-1 text-3xl font-semibold text-[var(--color-heading)]">
												{stat.value}
											</p>
											<p className="m-0 text-sm text-[var(--color-muted)]">
												{t(`public.home.preview.stats.${stat.subKey}`)}
											</p>
										</li>
									);
								})}
							</ul>
							<ul
								className="mt-4 m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4"
								aria-label={t("public.home.preview.opsAria")}
							>
								{previewOps.map((item) => {
									const Icon = item.icon;
									return (
										<li
											key={item.key}
											className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
										>
											<Icon
												aria-hidden="true"
												className="mb-2 text-[var(--color-primary)]"
												size={20}
											/>
											<p className="m-0 text-sm text-[var(--color-muted)]">
												{t(`public.home.preview.ops.${item.key}`)}
											</p>
											<p className="my-1 text-2xl font-semibold text-[var(--color-heading)]">
												{item.value}
											</p>
											<p className="m-0 text-sm text-[var(--color-muted)]">
												{t(`public.home.preview.ops.${item.subKey}`)}
											</p>
										</li>
									);
								})}
							</ul>
						</div>
					</div>
				</section>
			</section>

			<section
				id="modules"
				className="mx-auto mt-8 mb-8 w-[min(1240px,calc(100%_-_32px))] max-[760px]:w-[min(1240px,calc(100%_-_24px))]"
			>
				<ul
					className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
					aria-label={t("modules.ariaLabel")}
				>
					{foundationModuleKeys.map((moduleKey) => (
						<li key={moduleKey}>
							<ModuleCard title={t(`modules.items.${moduleKey}`)} />
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
