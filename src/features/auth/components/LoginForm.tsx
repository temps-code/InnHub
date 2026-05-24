import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuthSession } from "../hooks/useAuthSession";

type LoginFormProps = {
	readonly onAuthenticated: () => void;
};

export function LoginForm({ onAuthenticated }: LoginFormProps) {
	const { t } = useTranslation();
	const { login } = useAuthSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (!email.trim() || !password) {
			setError(t("auth.login.requiredError"));
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await login({ email: email.trim(), password });

			if (!result.ok) {
				setError(t("auth.login.genericError"));
				return;
			}

			onAuthenticated();
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
			<div className="grid gap-2">
				<label
					className="text-sm font-bold text-[var(--color-heading)]"
					htmlFor="login-email"
				>
					{t("auth.login.emailLabel")}
				</label>
				<input
					className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-heading)]"
					autoComplete="email"
					id="login-email"
					onChange={(event) => setEmail(event.target.value)}
					type="email"
					value={email}
				/>
			</div>
			<div className="grid gap-2">
				<label
					className="text-sm font-bold text-[var(--color-heading)]"
					htmlFor="login-password"
				>
					{t("auth.login.passwordLabel")}
				</label>
				<input
					className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-heading)]"
					autoComplete="current-password"
					id="login-password"
					onChange={(event) => setPassword(event.target.value)}
					type="password"
					value={password}
				/>
			</div>
			{error ? (
				<p
					className="m-0 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
					role="alert"
				>
					{error}
				</p>
			) : null}
			<button
				className="inline-flex justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
				disabled={isSubmitting}
				type="submit"
			>
				{isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
			</button>
		</form>
	);
}
