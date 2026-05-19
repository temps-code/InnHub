import { useTranslation } from "react-i18next";

const foundationModuleKeys = [
	"properties",
	"rooms",
	"guests",
	"reservations",
	"operations",
	"billing",
	"reports",
] as const;

export function App() {
	const { t } = useTranslation();

	return (
		<main
			className="mx-auto w-[min(1120px,calc(100%_-_32px))] py-16 max-[760px]:w-[min(1120px,calc(100%_-_24px))] max-[760px]:py-8"
			aria-labelledby="app-title"
		>
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
			</section>

			<section
				className="grid grid-cols-[minmax(0,1fr)_minmax(280px,420px)] items-start gap-12 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)] max-[760px]:grid-cols-1 max-[760px]:gap-8 max-[760px]:p-6"
				aria-labelledby="foundation-title"
			>
				<div>
					<p className="m-0 text-[0.85rem] font-bold tracking-[0.16em] text-[var(--color-primary)] uppercase">
						{t("foundation.eyebrow")}
					</p>
					<h2
						id="foundation-title"
						className="mt-2 mb-4 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.04em] text-[var(--color-heading)]"
					>
						{t("foundation.title")}
					</h2>
					<p className="m-0 text-[var(--color-muted)]">
						{t("foundation.description")}
					</p>
				</div>

				<ul
					className="m-0 grid list-none gap-3 p-0"
					aria-label={t("modules.ariaLabel")}
				>
					{foundationModuleKeys.map((moduleKey) => (
						<li
							className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3.5 font-bold text-[var(--color-heading)]"
							key={moduleKey}
						>
							{t(`modules.items.${moduleKey}`)}
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
