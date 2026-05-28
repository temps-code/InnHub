import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthSession } from "../auth";
import { Button } from "../../shared/components/atoms/Button";
import { PageSection } from "../../shared/components/organisms/PageSection";
import { joinClasses } from "../../shared/utils/classNames";
import type { Property, PropertyFormData } from "./types";
import { propertyFormSchema } from "./types";
import { useCurrentProperty } from "./useCurrentProperty";

// ── Field descriptor for rendering both read and edit modes ────────

type FieldDef = {
	readonly key: string;
	readonly i18nKey: string;
	readonly readOnly: boolean;
};

const READ_ONLY_FIELDS: readonly FieldDef[] = [
	{ key: "id", i18nKey: "properties.fields.id", readOnly: true },
	{ key: "slug", i18nKey: "properties.fields.slug", readOnly: true },
];

const WRITABLE_FIELDS: readonly FieldDef[] = [
	{ key: "name", i18nKey: "properties.fields.name", readOnly: false },
	{
		key: "business_type",
		i18nKey: "properties.fields.business_type",
		readOnly: false,
	},
	{ key: "timezone", i18nKey: "properties.fields.timezone", readOnly: false },
	{ key: "currency", i18nKey: "properties.fields.currency", readOnly: false },
	{ key: "address", i18nKey: "properties.fields.address", readOnly: false },
	{ key: "phone", i18nKey: "properties.fields.phone", readOnly: false },
	{ key: "email", i18nKey: "properties.fields.email", readOnly: false },
];

const TIMESTAMP_FIELDS: readonly FieldDef[] = [
	{
		key: "created_at",
		i18nKey: "properties.fields.created_at",
		readOnly: true,
	},
	{
		key: "updated_at",
		i18nKey: "properties.fields.updated_at",
		readOnly: true,
	},
];

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

export function PropertyProfilePage({
	titleKey,
}: {
	readonly titleKey?: string;
} = {}) {
	const { t } = useTranslation();
	const { state: authState } = useAuthSession();
	const session =
		authState.status === "authenticated" ? authState.session : null;
	const { state, update } = useCurrentProperty(session);
	const [isEditing, setIsEditing] = useState(false);

	// Snapshot the property when entering edit mode so the form survives
	// hook error transitions (a failed update sets hook state → "error").
	const [editSnapshot, setEditSnapshot] = useState<Property | null>(null);
	const [updateError, setUpdateError] = useState<string | null>(null);

	// ── Loading ──────────────────────────────────────────────────────

	if (state.status === "loading") {
		return (
			<PageSection variant="quiet">
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("properties.profile.loading")}
				</p>
			</PageSection>
		);
	}

	// ── Error (only shown when NOT editing) ──────────────────────────

	if (state.status === "error" && !isEditing) {
		if (state.error.code === "not-found") {
			return (
				<PageSection
					description={t("properties.profile.notFound")}
					eyebrow={t("properties.profile.eyebrow")}
					title={t("properties.profile.notFound")}
				/>
			);
		}

		return (
			<PageSection
				description={t("properties.profile.loadError")}
				eyebrow={t("properties.profile.eyebrow")}
				title={t("properties.profile.loadError")}
			/>
		);
	}

	// ── Edit mode (uses snapshot when hook is in error state) ────────

	if (isEditing) {
		// Prefer the snapshot if available, otherwise try hook data.
		const property =
			editSnapshot ?? (state.status === "loaded" ? state.property : null);

		if (!property) {
			return (
				<PageSection variant="quiet">
					<p className="m-0 text-[var(--color-muted)]" role="status">
						{t("properties.profile.loading")}
					</p>
				</PageSection>
			);
		}

		// When the hook transitions to "error" during editing, surface the
		// update error message inline instead of replacing the whole view.
		const effectiveError =
			state.status === "error"
				? t("properties.profile.updateError")
				: updateError;

		return (
			<EditForm
				cancelLabel={t("properties.profile.cancelButton")}
				property={property}
				saveLabel={t("properties.profile.saveButton")}
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
						await update(data);
						setIsEditing(false);
						setEditSnapshot(null);
					} catch {
						setUpdateError(t("properties.profile.updateError"));
					}
				}}
			/>
		);
	}

	// ── Read mode ────────────────────────────────────────────────────

	// Guard: should have loaded data at this point.
	if (state.status !== "loaded") {
		return (
			<PageSection variant="quiet">
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("properties.profile.loading")}
				</p>
			</PageSection>
		);
	}

	const { property } = state;

	return (
		<PageSection
			actions={
				<Button
					onClick={() => {
						setEditSnapshot(property);
						setIsEditing(true);
					}}
					variant="secondary"
				>
					{t("properties.profile.editButton")}
				</Button>
			}
			eyebrow={t("properties.profile.eyebrow")}
			title={titleKey ? t(titleKey) : undefined}
		>
			<div className="flex flex-col gap-4">
				{[...READ_ONLY_FIELDS, ...WRITABLE_FIELDS, ...TIMESTAMP_FIELDS].map(
					(field) => (
						<ReadOnlyField
							key={field.key}
							label={t(field.i18nKey)}
							value={String(property[field.key as keyof typeof property] ?? "")}
						/>
					),
				)}
			</div>
		</PageSection>
	);
}

// ── Edit form sub-component ────────────────────────────────────────

function EditForm({
	cancelLabel,
	property,
	saveLabel,
	t,
	updateError,
	onCancel,
	onSubmit,
}: {
	readonly cancelLabel: string;
	readonly property: Property | PropertyFormData;
	readonly saveLabel: string;
	readonly t: (key: string) => string;
	readonly updateError: string | null;
	readonly onCancel: () => void;
	readonly onSubmit: (data: PropertyFormData) => Promise<void>;
}) {
	const {
		formState: { errors, isSubmitting },
		handleSubmit,
		register,
	} = useForm<PropertyFormData>({
		defaultValues: {
			name: property.name,
			business_type: property.business_type,
			timezone: property.timezone,
			currency: property.currency,
			address: property.address,
			phone: property.phone,
			email: property.email,
		},
		resolver: zodResolver(propertyFormSchema),
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
			eyebrow={t("properties.profile.eyebrow")}
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
					{[...READ_ONLY_FIELDS, ...TIMESTAMP_FIELDS].map((field) => (
						<ReadOnlyField
							key={field.key}
							label={t(field.i18nKey)}
							value={String(property[field.key as keyof typeof property] ?? "")}
						/>
					))}
				</div>

				<hr className="border-[var(--color-border)]" />

				{/* Writable fields as form inputs */}
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					{WRITABLE_FIELDS.map((field) => (
						<FormField
							key={field.key}
							error={errors[field.key as keyof PropertyFormData]?.message}
							label={t(field.i18nKey)}
							{...register(field.key as keyof PropertyFormData)}
						/>
					))}
				</div>
			</div>
		</PageSection>
	);
}
