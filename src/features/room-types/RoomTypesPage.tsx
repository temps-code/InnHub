import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthSession } from "../auth";
import { Button } from "../../shared/components/atoms/Button";
import { PageSection } from "../../shared/components/organisms/PageSection";
import { ConfirmDialog } from "../../shared/components/organisms/ConfirmDialog";
import { Modal } from "../../shared/components/organisms/Modal";
import { FormField, inputClasses, inputDefaultClasses, inputErrorClasses } from "../../shared/components/molecules/FormField";
import { joinClasses } from "../../shared/utils/classNames";
import { canAccess } from "../../app/routes/routeMetadata";
import type { RoomType, RoomTypeFormData } from "./types";
import { roomTypeFormSchema } from "./types";
import { useRoomTypes } from "./useRoomTypes";

// ── Modal mode ──────────────────────────────────────────────────────

type ModalMode =
	| { readonly type: "closed" }
	| { readonly type: "create" }
	| { readonly type: "edit"; readonly roomType: RoomType };

// ── Main component ─────────────────────────────────────────────────

export function RoomTypesPage() {
	const { t } = useTranslation();
	const { state: authState } = useAuthSession();
	const session =
		authState.status === "authenticated" ? authState.session : null;
	const { state, showArchived, create, update, remove, toggleArchived, restore, purge } = useRoomTypes(session);
	const [modalMode, setModalMode] = useState<ModalMode>({ type: "closed" });
	const [deleteConfirm, setDeleteConfirm] = useState<RoomType | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [restoreConfirm, setRestoreConfirm] = useState<RoomType | null>(null);
	const [restoreError, setRestoreError] = useState<string | null>(null);
	const [isRestoring, setIsRestoring] = useState(false);

	const [purgeConfirm, setPurgeConfirm] = useState<RoomType | null>(null);
	const [purgeError, setPurgeError] = useState<string | null>(null);
	const [isPurging, setIsPurging] = useState(false);

	const userRole = session?.profile.role ?? "any";
	const canEdit = canAccess("manager", userRole);

	// ── Modal form handler (shared by create and edit) ────────────────

	function handleModalSuccess() {
		setModalMode({ type: "closed" });
	}

	function handleDeleteClose() {
		setDeleteConfirm(null);
		setDeleteError(null);
	}

	async function handleDeleteConfirm() {
		if (!deleteConfirm || isDeleting) return;
		setDeleteError(null);
		setIsDeleting(true);
		try {
			await remove(deleteConfirm.id);
			setDeleteConfirm(null);
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === "validation-error" && err.message === "permission-denied") {
				setDeleteError(t("roomTypes.deletePermissionError"));
			} else {
				setDeleteError(t("roomTypes.deleteGenericError"));
			}
		} finally {
			setIsDeleting(false);
		}
	}

	function handleRestoreClose() {
		setRestoreConfirm(null);
		setRestoreError(null);
	}

	async function handleRestoreConfirm() {
		if (!restoreConfirm || isRestoring) return;
		setRestoreError(null);
		setIsRestoring(true);
		try {
			await restore(restoreConfirm.id);
			setRestoreConfirm(null);
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === "validation-error" && err.message === "permission-denied") {
				setRestoreError(t("roomTypes.permissionError"));
			} else if (err.code === "validation-error") {
				setRestoreError(t("roomTypes.archive.restoreDuplicateName"));
			} else {
				setRestoreError(t("roomTypes.archive.restoreGenericError"));
			}
		} finally {
			setIsRestoring(false);
		}
	}

	function handlePurgeClose() {
		setPurgeConfirm(null);
		setPurgeError(null);
	}

	async function handlePurgeConfirm() {
		if (!purgeConfirm || isPurging) return;
		setPurgeError(null);
		setIsPurging(true);
		try {
			await purge(purgeConfirm.id);
			setPurgeConfirm(null);
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === "validation-error" && err.message === "permission-denied") {
				setPurgeError(t("roomTypes.permissionError"));
			} else if (err.code === "foreign-key-conflict") {
				setPurgeError(t("roomTypes.archive.purgeForeignKeyConflict"));
			} else {
				setPurgeError(t("roomTypes.archive.purgeGenericError"));
			}
		} finally {
			setIsPurging(false);
		}
	}

	// ── Loading ──────────────────────────────────────────────────────

	if (state.status === "loading") {
		return (
			<PageSection
				title={t("roomTypes.list.title")}
				variant="quiet"
			>
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("roomTypes.list.loading")}
				</p>
			</PageSection>
		);
	}

	// ── Error ────────────────────────────────────────────────────────

	if (state.status === "error") {
		return (
			<PageSection
				description={t("roomTypes.list.error")}
				title={t("roomTypes.list.title")}
			/>
		);
	}

	// ── Empty ────────────────────────────────────────────────────────

	if (state.status === "loaded" && state.roomTypes.length === 0 && !showArchived) {
		return (
			<PageSection
				actions={
					<div className="flex items-center gap-2">
						{canEdit ? (
							<Button onClick={() => setModalMode({ type: "create" })}>
								{t("roomTypes.create.title")}
							</Button>
						) : null}
						{canEdit ? (
							<Button
								onClick={toggleArchived}
								size="sm"
								variant="ghost"
							>
								{t("roomTypes.archive.toggle")}
							</Button>
						) : null}
					</div>
				}
				title={t("roomTypes.list.title")}
			>
				<p className="m-0 text-[var(--color-muted)]">
					{t("roomTypes.list.empty")}
				</p>

				{/* Modal for create */}
				{modalMode.type === "create" ? (
					<RoomTypeFormModal
						mode={modalMode}
						onSuccess={handleModalSuccess}
						onClose={() => setModalMode({ type: "closed" })}
						create={create}
					/>
				) : null}
			</PageSection>
		);
	}

	// ── Loaded with data ────────────────────────────────────────────

	const { roomTypes } = state;

	return (
		<PageSection
			actions={
				<div className="flex items-center gap-2">
					{canEdit ? (
						<Button onClick={() => setModalMode({ type: "create" })}>
							{t("roomTypes.create.title")}
						</Button>
					) : null}
					{canEdit ? (
						<Button
							onClick={toggleArchived}
							size="sm"
							variant="ghost"
						>
							{showArchived
								? t("roomTypes.archive.toggleActive")
								: t("roomTypes.archive.toggle")}
						</Button>
					) : null}
				</div>
			}
			title={showArchived ? t("roomTypes.archive.title") : t("roomTypes.list.title")}
		>
			{roomTypes.length === 0 ? (
				<p className="m-0 text-[var(--color-muted)]">
					{showArchived
						? t("roomTypes.archive.empty")
						: t("roomTypes.list.empty")}
				</p>
			) : showArchived ? (
				/* ── Archived table ────────────────────────────────── */
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.name")}</th>
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.capacity")}</th>
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.base_price")}</th>
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.description")}</th>
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.deletedAt")}</th>
								{canEdit ? <th className="pb-3 w-24" /> : null}
								{canEdit ? <th className="pb-3 w-24" /> : null}
							</tr>
						</thead>
						<tbody>
							{roomTypes.map((roomType) => (
								<tr
									key={roomType.id}
									className="border-b border-[var(--color-border)] last:border-b-0"
								>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{roomType.name}
									</td>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{roomType.capacity}
									</td>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{roomType.base_price.toFixed(2)}
									</td>
									<td className="py-3 pr-4 text-[var(--color-muted)]">
										{roomType.description || "—"}
									</td>
									<td className="py-3 pr-4 text-[var(--color-muted)]">
										{roomType.deleted_at
											? new Date(roomType.deleted_at).toLocaleDateString()
											: "—"}
									</td>
									{canEdit ? (
										<td className="py-3">
											<Button
												onClick={() => setRestoreConfirm(roomType)}
												size="sm"
												variant="ghost"
											>
												{t("roomTypes.archive.restore")}
											</Button>
										</td>
									) : null}
									{canEdit ? (
										<td className="py-3">
											<Button
												onClick={() => setPurgeConfirm(roomType)}
												size="sm"
												variant="danger"
											>
												{t("roomTypes.archive.purge")}
											</Button>
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				/* ── Active table ────────────────────────────────── */
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.name")}</th>
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.capacity")}</th>
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.base_price")}</th>
								<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.description")}</th>
								{canEdit ? <th className="pb-3 w-24" /> : null}
								{canEdit ? <th className="pb-3 w-24" /> : null}
							</tr>
						</thead>
						<tbody>
							{roomTypes.map((roomType) => (
								<tr
									key={roomType.id}
									className="border-b border-[var(--color-border)] last:border-b-0"
								>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{roomType.name}
									</td>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{roomType.capacity}
									</td>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{roomType.base_price.toFixed(2)}
									</td>
									<td className="py-3 pr-4 text-[var(--color-muted)]">
										{roomType.description || "—"}
									</td>
									{canEdit ? (
										<td className="py-3">
											<Button
												onClick={() =>
													setModalMode({ type: "edit", roomType })
												}
												size="sm"
												variant="ghost"
											>
												{t("properties.profile.editButton")}
											</Button>
										</td>
									) : null}
									{canEdit ? (
										<td className="py-3">
											<Button
												onClick={() => setDeleteConfirm(roomType)}
												size="sm"
												variant="ghost"
											>
												{t("roomTypes.delete")}
											</Button>
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Modal for create or edit */}
			{modalMode.type === "create" ? (
				<RoomTypeFormModal
					mode={modalMode}
					onSuccess={handleModalSuccess}
					onClose={() => setModalMode({ type: "closed" })}
					create={create}
				/>
			) : null}
			{modalMode.type === "edit" ? (
				<RoomTypeFormModal
					mode={modalMode}
					onSuccess={handleModalSuccess}
					onClose={() => setModalMode({ type: "closed" })}
					create={create}
					update={update}
				/>
			) : null}

			{/* Delete confirmation dialog */}
			<ConfirmDialog
				cancelLabel={t("roomTypes.deleteConfirmCancel")}
				confirmLabel={t("roomTypes.deleteConfirmAccept")}
				error={deleteError}
				isOpen={deleteConfirm !== null}
				isProcessing={isDeleting}
				message={t("roomTypes.deleteConfirmMessage")}
				onCancel={handleDeleteClose}
				onConfirm={handleDeleteConfirm}
				title={t("roomTypes.deleteConfirmTitle")}
			/>

			{/* Restore confirmation dialog */}
			<ConfirmDialog
				cancelLabel={t("roomTypes.deleteConfirmCancel")}
				confirmLabel={t("roomTypes.archive.restore")}
				error={restoreError}
				isOpen={restoreConfirm !== null}
				isProcessing={isRestoring}
				message={t("roomTypes.archive.restoreConfirmMessage")}
				onCancel={handleRestoreClose}
				onConfirm={handleRestoreConfirm}
				title={t("roomTypes.archive.restoreConfirmTitle")}
				variant="primary"
			/>

			{/* Purge confirmation dialog */}
			<ConfirmDialog
				cancelLabel={t("roomTypes.deleteConfirmCancel")}
				confirmLabel={t("roomTypes.archive.purge")}
				error={purgeError}
				isOpen={purgeConfirm !== null}
				isProcessing={isPurging}
				message={t("roomTypes.archive.purgeConfirmMessage")}
				onCancel={handlePurgeClose}
				onConfirm={handlePurgeConfirm}
				title={t("roomTypes.archive.purgeConfirmTitle")}
				variant="danger"
			/>
		</PageSection>
	);
}

// ── Modal form sub-component ───────────────────────────────────────

function RoomTypeFormModal({
	mode,
	onSuccess,
	onClose,
	create,
	update,
}: {
	readonly mode: ModalMode & { type: "create" | "edit" };
	readonly onSuccess: () => void;
	readonly onClose: () => void;
	readonly create: (data: RoomTypeFormData) => Promise<void>;
	readonly update?: (id: string, data: RoomTypeFormData) => Promise<void>;
}) {
	const { t } = useTranslation();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const isEditing = mode.type === "edit";
	const defaultValues: RoomTypeFormData = isEditing
		? {
				name: mode.roomType.name,
				description: mode.roomType.description || "",
				capacity: mode.roomType.capacity,
				base_price: mode.roomType.base_price,
			}
		: {
				name: "",
				description: "",
				capacity: 0,
				base_price: 0,
			};

	const {
		formState: { errors, isSubmitting },
		handleSubmit,
		register,
		reset,
	} = useForm<RoomTypeFormData>({
		defaultValues,
		resolver: zodResolver(roomTypeFormSchema) as Resolver<RoomTypeFormData>,
	});

	async function onSubmit(data: RoomTypeFormData) {
		setSubmitError(null);
		try {
			if (mode.type === "edit" && update) {
				await update(mode.roomType.id, data);
			} else {
				await create(data);
			}
			reset();
			onSuccess();
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === "validation-error" && err.message === "permission-denied") {
				setSubmitError(t("roomTypes.permissionError"));
			} else if (err.code === "validation-error") {
				setSubmitError(t("roomTypes.duplicateName"));
			} else {
				setSubmitError(t("properties.profile.updateError") || "Could not save changes. Please try again.");
			}
		}
	}

	return (
		<Modal
			isOpen
			onClose={() => {
				if (isSubmitting) return;
				reset();
				onClose();
			}}
			title={
				isEditing
					? t("roomTypes.edit.title")
					: t("roomTypes.create.title")
			}
		>
			{submitError ? (
				<div
					className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
					role="alert"
				>
					{submitError}
				</div>
			) : null}

			<form
				onSubmit={(event) => {
					void handleSubmit(onSubmit)(event);
				}}
			>
				<div className="flex flex-col gap-4">
					<FormField
						error={errors.name?.message}
						htmlFor="room-type-name"
						label={t("roomTypes.fields.name")}
					>
						<input
							className={joinClasses(
								inputClasses,
								errors.name ? inputErrorClasses : inputDefaultClasses,
							)}
							id="room-type-name"
							{...register("name")}
						/>
					</FormField>

					<FormField
						htmlFor="room-type-description"
						label={t("roomTypes.fields.description")}
					>
						<input
							className={joinClasses(inputClasses, inputDefaultClasses)}
							id="room-type-description"
							{...register("description")}
						/>
					</FormField>

					<FormField
						error={errors.capacity?.message}
						htmlFor="room-type-capacity"
						label={t("roomTypes.fields.capacity")}
					>
						<input
							className={joinClasses(
								inputClasses,
								errors.capacity ? inputErrorClasses : inputDefaultClasses,
							)}
							id="room-type-capacity"
							type="number"
							{...register("capacity")}
						/>
					</FormField>

					<FormField
						error={errors.base_price?.message}
						htmlFor="room-type-base-price"
						label={t("roomTypes.fields.base_price")}
					>
						<input
							className={joinClasses(
								inputClasses,
								errors.base_price ? inputErrorClasses : inputDefaultClasses,
							)}
							id="room-type-base-price"
							type="number"
							step="any"
							{...register("base_price")}
						/>
					</FormField>
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<Button
						disabled={isSubmitting}
						onClick={() => {
							reset();
							onClose();
						}}
						type="button"
						variant="ghost"
					>
						{t("properties.profile.cancelButton")}
					</Button>
					<Button isLoading={isSubmitting} type="submit">
						{isEditing
							? t("roomTypes.edit.submit")
							: t("roomTypes.create.submit")}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
