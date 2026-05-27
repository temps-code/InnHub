import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthSession } from "../auth";
import { Button } from "../../shared/components/atoms/Button";
import { PageSection } from "../../shared/components/organisms/PageSection";
import { useCurrentProfile } from "./useCurrentProfile";
import type { ProfileData, ProfileFormData } from "./types";
import { profileFormSchema } from "./types";

// ── Helpers ────────────────────────────────────────────────────────

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}

/** Render a single read-only field row. */
function ReadOnlyField({
	label,
	value,
}: {
	readonly label: string;
	readonly value: string;
}) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-2 text-sm">
			<span className="font-medium text-[var(--color-muted)]">{label}</span>
			<span className="text-[var(--color-heading)]">{value}</span>
		</div>
	);
}

/** Render a form input with label and error message. */
function FormField({
	error,
	label,
	...inputProps
}: {
	readonly error?: string;
	readonly label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div className="flex flex-col gap-1">
			<label
				className="text-sm font-medium text-[var(--color-muted)]"
				htmlFor={inputProps.id ?? inputProps.name}
			>
				{label}
			</label>
			<input
				className={joinClasses(
					"rounded-xl border px-4 py-2.5 text-sm text-[var(--color-heading)] outline-none transition",
					"focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
					error
						? "border-red-500"
						: "border-[var(--color-border)] bg-[var(--color-surface)]",
				)}
				id={inputProps.id ?? inputProps.name}
				{...inputProps}
			/>
			{error ? (
				<span className="text-xs text-red-500" role="alert">
					{error}
				</span>
			) : null}
		</div>
	);
}

// ── Main component ─────────────────────────────────────────────────

export function UserProfilePage({
	titleKey,
}: {
	readonly titleKey?: string;
} = {}) {
	const { t } = useTranslation();
	const { state: authState } = useAuthSession();
	const session =
		authState.status === "authenticated" ? authState.session : null;
	const { state, update } = useCurrentProfile(session);
	const [isEditing, setIsEditing] = useState(false);

	// Snapshot the profile when entering edit mode so the form survives
	// hook error transitions (a failed update sets hook state → "error").
	const [editSnapshot, setEditSnapshot] = useState<ProfileData | null>(null);
	const [updateError, setUpdateError] = useState<string | null>(null);

	// Check if user can edit (admin only)
	const canEdit =
		session?.profile.role === "administrator" ||
		(state.status === "loaded" && state.profile.role === "administrator");

	// ── Loading ──────────────────────────────────────────────────────

	if (state.status === "loading") {
		return (
			<PageSection variant="quiet">
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("profile.loading")}
				</p>
			</PageSection>
		);
	}

	// ── Error (only when NOT editing) ─────────────────────────────────

	if (state.status === "error" && !isEditing) {
		return (
			<PageSection
				description={t("profile.loadError")}
				eyebrow={t("profile.title")}
				title={t("profile.loadError")}
			/>
		);
	}

	// ── Edit mode ─────────────────────────────────────────────────────

	if (isEditing) {
		const profile =
			editSnapshot ?? (state.status === "loaded" ? state.profile : null);

		if (!profile) {
			return (
				<PageSection variant="quiet">
					<p className="m-0 text-[var(--color-muted)]" role="status">
						{t("profile.loading")}
					</p>
				</PageSection>
			);
		}

		const effectiveError =
			state.status === "error"
				? t("profile.updateError")
				: updateError;

		return (
			<EditForm
				cancelLabel={t("profile.cancel")}
				profile={profile}
				saveLabel={t("profile.save")}
				t={t}
				updateError={effectiveError}
				onCancel={() => {
					setIsEditing(false);
					setEditSnapshot(null);
					setUpdateError(null);
				}}
				onSubmit={async (data) => {
					setUpdateError(null);
					try {
						await update(data.fullName);
						setIsEditing(false);
						setEditSnapshot(null);
					} catch {
						setUpdateError(t("profile.updateError"));
					}
				}}
			/>
		);
	}

	// ── Read mode ─────────────────────────────────────────────────────

	if (state.status !== "loaded") {
		return (
			<PageSection variant="quiet">
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("profile.loading")}
				</p>
			</PageSection>
		);
	}

	const { profile } = state;

	return (
		<PageSection
			actions={
				canEdit ? (
					<Button
						onClick={() => {
							setEditSnapshot(profile);
							setIsEditing(true);
						}}
						variant="secondary"
					>
						{t("profile.edit")}
					</Button>
				) : undefined
			}
			eyebrow={t("profile.title")}
			title={titleKey ? t(titleKey) : undefined}
		>
			<div className="flex flex-col gap-4">
				<ReadOnlyField
					label={t("profile.fields.fullName")}
					value={profile.fullName ?? ""}
				/>
				<ReadOnlyField
					label={t("profile.fields.email")}
					value={profile.email}
				/>
				<ReadOnlyField
					label={t("profile.fields.role")}
					value={profile.role}
				/>
				<ReadOnlyField
					label={t("profile.fields.property")}
					value={profile.propertyName ?? ""}
				/>
			</div>
		</PageSection>
	);
}

// ── Edit form sub-component ────────────────────────────────────────

function EditForm({
	cancelLabel,
	profile,
	saveLabel,
	t,
	updateError,
	onCancel,
	onSubmit,
}: {
	readonly cancelLabel: string;
	readonly profile: ProfileData | ProfileFormData;
	readonly saveLabel: string;
	readonly t: (key: string) => string;
	readonly updateError: string | null;
	readonly onCancel: () => void;
	readonly onSubmit: (data: ProfileFormData) => Promise<void>;
}) {
	const {
		formState: { errors, isSubmitting },
		handleSubmit,
		register,
	} = useForm<ProfileFormData>({
		defaultValues: {
			fullName: ("fullName" in profile ? profile.fullName : "") ?? "",
		},
		resolver: zodResolver(profileFormSchema),
	});

	return (
		<PageSection
			actions={
				<div className="flex gap-3">
					<Button
						disabled={isSubmitting}
						onClick={onCancel}
						type="button"
						variant="ghost"
					>
						{cancelLabel}
					</Button>
					<Button
						isLoading={isSubmitting}
						onClick={handleSubmit(onSubmit)}
						type="button"
					>
						{saveLabel}
					</Button>
				</div>
			}
			eyebrow={t("profile.title")}
		>
			{updateError ? (
				<div
					className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
					role="alert"
				>
					{updateError}
				</div>
			) : null}

			<div className="flex flex-col gap-6">
				{/* Read-only fields displayed as text */}
				<div className="flex flex-col gap-2">
					<ReadOnlyField
						label={t("profile.fields.email")}
						value={"email" in profile ? profile.email : ""}
					/>
					<ReadOnlyField
						label={t("profile.fields.role")}
						value={"role" in profile ? profile.role : ""}
					/>
					<ReadOnlyField
						label={t("profile.fields.property")}
						value={
							"propertyName" in profile
								? (profile.propertyName ?? "")
								: ""
						}
					/>
				</div>

				<hr className="border-[var(--color-border)]" />

				{/* Editable field */}
				<div className="max-w-sm">
					<FormField
						error={errors.fullName?.message}
						label={t("profile.fields.fullName")}
						{...register("fullName")}
					/>
				</div>
			</div>
		</PageSection>
	);
}
