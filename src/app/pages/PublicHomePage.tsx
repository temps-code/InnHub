import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ModuleCard, PageSection, PreferenceBar } from "../../shared/components";

const foundationModuleKeys = [
	"properties",
	"rooms",
	"guests",
	"reservations",
	"operations",
	"billing",
	"reports",
] as const;

export function PublicHomePage() {
	const { t } = useTranslation();

	return (
		<main
			className="relative mx-auto w-[min(1120px,calc(100%_-_32px))] py-16 max-[760px]:w-[min(1120px,calc(100%_-_24px))] max-[760px]:py-8"
			aria-labelledby="app-title"
		>
			<div className="absolute top-4 right-0 max-[760px]:top-2">
				<PreferenceBar />
			</div>
			<section className="grid max-w-3xl gap-5 py-[72px] max-[760px]:py-12">
				<img
					className="h-[72px] w-[72px] rounded-[20px] shadow-[0_18px_48px_rgb(124_58_237_/_18%)]"
					src="/innhub-app-icon.svg"
					alt=""
					aria-hidden="true"
				/>
				<p className="m-0 text-[0.85rem] font-bold tracking-[0.16em] text-[var(--color-primary)] uppercase">
					{t("hero.eyebrow")}
				</p>
				<h1
					id="app-title"
					className="m-0 text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.9] font-bold tracking-[-0.08em] text-[var(--color-heading)]"
				>
					{t("hero.title")}
				</h1>
				<p className="m-0 max-w-2xl text-[clamp(1.1rem,2vw,1.35rem)] text-[var(--color-muted)]">
					{t("hero.description")}
				</p>
				<div className="flex flex-wrap gap-3">
					<Link
						className="inline-flex rounded-full bg-[var(--color-primary)] px-5 py-3 font-bold text-white"
						to="/login"
					>
						{t("public.home.loginLink")}
					</Link>
					<Link
						className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-bold text-[var(--color-heading)]"
						to="/app/dashboard"
					>
						{t("public.home.previewLink")}
					</Link>
				</div>
			</section>

			<PageSection
				className="max-[760px]:p-6"
				description={t("foundation.description")}
				eyebrow={t("foundation.eyebrow")}
				title={t("foundation.title")}
				titleId="foundation-title"
			>
				<ul
					className="m-0 grid list-none gap-3 p-0"
					aria-label={t("modules.ariaLabel")}
				>
					{foundationModuleKeys.map((moduleKey) => (
						<li key={moduleKey}>
							<ModuleCard title={t(`modules.items.${moduleKey}`)} />
						</li>
					))}
				</ul>
			</PageSection>
		</main>
	);
}
