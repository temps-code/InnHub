import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
	const { t } = useTranslation();

	return (
		<main
			className="mx-auto grid min-h-screen w-[min(720px,calc(100%_-_32px))] place-items-center py-12"
			aria-labelledby="not-found-title"
		>
			<section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-panel)]">
				<h1
					id="not-found-title"
					className="m-0 text-3xl font-bold text-[var(--color-heading)]"
				>
					{t("public.notFound.title")}
				</h1>
				<p className="mt-3 mb-6 text-[var(--color-muted)]">
					{t("public.notFound.description")}
				</p>
				<div className="flex justify-center gap-3">
					<Link className="font-bold text-[var(--color-primary)]" to="/">
						{t("public.notFound.homeLink")}
					</Link>
					<Link
						className="font-bold text-[var(--color-primary)]"
						to="/app/dashboard"
					>
						{t("public.notFound.previewLink")}
					</Link>
				</div>
			</section>
		</main>
	);
}
