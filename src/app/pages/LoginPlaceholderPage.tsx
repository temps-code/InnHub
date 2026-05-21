import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function LoginPlaceholderPage() {
	const { t } = useTranslation();

	return (
		<main
			className="mx-auto grid min-h-screen w-[min(720px,calc(100%_-_32px))] place-items-center py-12"
			aria-labelledby="login-title"
		>
			<section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)]">
				<p className="m-0 text-sm font-bold tracking-[0.14em] text-[var(--color-primary)] uppercase">
					{t("public.login.eyebrow")}
				</p>
				<h1
					id="login-title"
					className="mt-3 mb-3 text-3xl font-bold text-[var(--color-heading)]"
				>
					{t("public.login.title")}
				</h1>
				<p className="m-0 text-[var(--color-muted)]">
					{t("public.login.description")}
				</p>
				<Link
					className="mt-6 inline-flex rounded-full bg-[var(--color-primary)] px-5 py-3 font-bold text-white"
					to="/app/dashboard"
				>
					{t("public.login.previewLink")}
				</Link>
			</section>
		</main>
	);
}
