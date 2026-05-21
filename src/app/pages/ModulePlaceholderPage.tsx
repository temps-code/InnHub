import { useTranslation } from "react-i18next";

import type { ProtectedRouteMeta } from "../routes/routeMetadata";

type ModulePlaceholderPageProps = {
	route: ProtectedRouteMeta;
};

export function ModulePlaceholderPage({ route }: ModulePlaceholderPageProps) {
	const { t } = useTranslation();
	const title = t(route.titleKey);

	return (
		<section
			className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-panel)]"
			aria-labelledby={`${route.id}-title`}
		>
			<p className="m-0 text-sm font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">
				{t("placeholders.eyebrow")}
			</p>
			<h1
				id={`${route.id}-title`}
				className="mt-3 mb-3 text-3xl font-bold text-[var(--color-heading)]"
			>
				{title}
			</h1>
			<p className="m-0 max-w-2xl text-[var(--color-muted)]">
				{t(route.descriptionKey)}
			</p>
			<p className="mt-5 mb-0 rounded-xl bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-medium text-[var(--color-heading)]">
				{t("placeholders.note")}
			</p>
		</section>
	);
}
