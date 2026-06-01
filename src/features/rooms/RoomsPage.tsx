import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthSession } from "../auth";
import { Button } from "../../shared/components/atoms/Button";
import { StatusBadge } from "../../shared/components/atoms/StatusBadge";
import { PageSection } from "../../shared/components/organisms/PageSection";
import { ConfirmDialog } from "../../shared/components/organisms/ConfirmDialog";
import { Modal } from "../../shared/components/organisms/Modal";
import { FormField } from "../../shared/components/molecules/FormField";
import { inputClasses, inputDefaultClasses, inputErrorClasses } from "../../shared/components/molecules/formFieldClasses";
import { joinClasses } from "../../shared/utils/classNames";
import { canAccess } from "../../app/routes/routeMetadata";
import type { Room, RoomFormData, RoomState } from "./types";
import { roomFormSchema, ROOM_STATE_TONE_MAP } from "./types";
import { useRooms } from "./useRooms";

// ── Modal mode ──────────────────────────────────────────────────────

type ModalMode =
	| { readonly type: "closed" }
	| { readonly type: "create" }
	| { readonly type: "edit"; readonly room: Room };

// ── Main component ─────────────────────────────────────────────────

export function RoomsPage() {
	const { t } = useTranslation();
	const { state: authState } = useAuthSession();
	const session =
		authState.status === "authenticated" ? authState.session : null;
	const { state, roomTypes, showArchived, create, update, remove, toggleArchived, restore, purge } = useRooms(session);
	const [modalMode, setModalMode] = useState<ModalMode>({ type: "closed" });
	const [deleteConfirm, setDeleteConfirm] = useState<Room | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [restoreConfirm, setRestoreConfirm] = useState<Room | null>(null);
	const [restoreError, setRestoreError] = useState<string | null>(null);
	const [isRestoring, setIsRestoring] = useState(false);

	const [purgeConfirm, setPurgeConfirm] = useState<Room | null>(null);
	const [purgeError, setPurgeError] = useState<string | null>(null);
	const [isPurging, setIsPurging] = useState(false);

	// ── Filters ───────────────────────────────────────────────────────
	const [statusFilter, setStatusFilter] = useState<RoomState | "">("");
	const [roomTypeFilter, setRoomTypeFilter] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState("");

	const userRole = session?.profile.role ?? "any";
	const canCreate = canAccess("manager", userRole);
	const canEdit = canAccess("receptionist", userRole);

	// ── Filtered rooms ────────────────────────────────────────────────
	const filteredRooms = useMemo(() => {
		if (state.status !== "loaded") return [];
		let rooms = state.rooms;

		if (statusFilter) {
			rooms = rooms.filter((r) => r.state === statusFilter);
		}

		if (roomTypeFilter) {
			rooms = rooms.filter((r) => r.room_type_id === roomTypeFilter);
		}

		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			rooms = rooms.filter(
				(r) =>
					r.identifier.toLowerCase().includes(term) ||
					(r.description?.toLowerCase().includes(term) ?? false),
			);
		}

		return rooms;
	}, [state, statusFilter, roomTypeFilter, searchTerm]);

	// ── Room type lookup ──────────────────────────────────────────────
	const roomTypeMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const rt of roomTypes) {
			map.set(rt.id, rt.name);
		}
		return map;
	}, [roomTypes]);

	// ── Modal form handler ────────────────────────────────────────────

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
				setDeleteError(t("rooms.deletePermissionError"));
			} else if (err.code === "validation-error" && err.message?.includes("active reservations")) {
				setDeleteError(t("rooms.reservationConflict"));
			} else {
				setDeleteError(t("rooms.deleteGenericError"));
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
				setRestoreError(t("rooms.permissionError"));
			} else if (err.code === "validation-error" && err.message?.includes("already exists")) {
				setRestoreError(t("rooms.archive.restoreDuplicateIdentifier"));
			} else {
				setRestoreError(t("rooms.archive.restoreGenericError"));
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
				setPurgeError(t("rooms.permissionError"));
			} else if (err.code === "foreign-key-conflict") {
				setPurgeError(t("rooms.archive.purgeForeignKeyConflict"));
			} else {
				setPurgeError(t("rooms.archive.purgeGenericError"));
			}
		} finally {
			setIsPurging(false);
		}
	}

	// ── Loading ──────────────────────────────────────────────────────

	if (state.status === "loading") {
		return (
			<PageSection
				title={t("rooms.list.title")}
				variant="quiet"
			>
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("rooms.list.loading")}
				</p>
			</PageSection>
		);
	}

	// ── Error ────────────────────────────────────────────────────────

	if (state.status === "error") {
		return (
			<PageSection
				description={t("rooms.list.error")}
				title={t("rooms.list.title")}
			/>
		);
	}

	// ── Empty ────────────────────────────────────────────────────────

	if (state.status === "loaded" && state.rooms.length === 0 && !showArchived) {
		return (
			<PageSection
				actions={
					<div className="flex items-center gap-2">
						{canCreate ? (
							<Button onClick={() => setModalMode({ type: "create" })}>
								{t("rooms.create.title")}
							</Button>
						) : null}
						{canCreate ? (
							<Button onClick={toggleArchived} size="sm" variant="ghost">
								{t("rooms.archive.toggle")}
							</Button>
						) : null}
					</div>
				}
				title={t("rooms.list.title")}
			>
				<p className="m-0 text-[var(--color-muted)]">
					{t("rooms.list.empty")}
				</p>

				{/* Modal for create */}
				{modalMode.type === "create" ? (
					<RoomFormModal
						mode={modalMode}
						onSuccess={handleModalSuccess}
						onClose={() => setModalMode({ type: "closed" })}
						roomTypes={roomTypes}
						create={create}
					/>
				) : null}
			</PageSection>
		);
	}

	// ── Loaded with data ────────────────────────────────────────────

	return (
		<PageSection
			actions={
				<div className="flex items-center gap-2">
					{canCreate ? (
						<Button onClick={() => setModalMode({ type: "create" })}>
							{t("rooms.create.title")}
						</Button>
					) : null}
					{canCreate ? (
						<Button onClick={toggleArchived} size="sm" variant="ghost">
							{showArchived ? t("rooms.archive.toggleActive") : t("rooms.archive.toggle")}
						</Button>
					) : null}
				</div>
			}
			title={showArchived ? t("rooms.archive.title") : t("rooms.list.title")}
		>
			{filteredRooms.length === 0 ? (
				<p className="m-0 text-[var(--color-muted)]">
					{showArchived
						? t("rooms.archive.empty")
						: t("rooms.list.empty")}
				</p>
			) : showArchived ? (
				/* ── Archived table ────────────────────────────────── */
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
								<th className="pb-3 pr-4 font-medium">{t("rooms.fields.identifier")}</th>
								<th className="pb-3 pr-4 font-medium">{t("rooms.fields.room_type")}</th>
								<th className="pb-3 pr-4 font-medium">{t("rooms.fields.floor")}</th>
								<th className="pb-3 pr-4 font-medium">{t("rooms.fields.deletedAt")}</th>
								{canCreate ? <th className="pb-3 w-24" /> : null}
								{canCreate ? <th className="pb-3 w-24" /> : null}
							</tr>
						</thead>
						<tbody>
							{filteredRooms.map((room) => (
								<tr
									key={room.id}
									className="border-b border-[var(--color-border)] last:border-b-0"
								>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{room.identifier}
									</td>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{roomTypeMap.get(room.room_type_id) ?? "—"}
									</td>
									<td className="py-3 pr-4 text-[var(--color-heading)]">
										{room.floor ?? "—"}
									</td>
									<td className="py-3 pr-4 text-[var(--color-muted)]">
										{room.deleted_at
											? new Date(room.deleted_at).toLocaleDateString()
											: "—"}
									</td>
									{canCreate ? (
										<td className="py-3">
											<Button
												onClick={() => setRestoreConfirm(room)}
												size="sm"
												variant="ghost"
											>
												{t("rooms.archive.restore")}
											</Button>
										</td>
									) : null}
									{canCreate ? (
										<td className="py-3">
											<Button
												onClick={() => setPurgeConfirm(room)}
												size="sm"
												variant="danger"
											>
												{t("rooms.archive.purge")}
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
				<>
					{/* ── Filter Bar ───────────────────────────────────────── */}
					<div className="mb-6 flex flex-wrap items-center gap-3">
						<select
							aria-label="Status filter"
							className={joinClasses(inputClasses, inputDefaultClasses)}
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as RoomState | "")}
						>
							<option value="">{t("rooms.filters.allStatuses")}</option>
							<option value="available">{t("rooms.states.available")}</option>
							<option value="occupied">{t("rooms.states.occupied")}</option>
							<option value="cleaning">{t("rooms.states.cleaning")}</option>
							<option value="maintenance">{t("rooms.states.maintenance")}</option>
							<option value="inactive">{t("rooms.states.inactive")}</option>
						</select>

						<select
							aria-label="Room type filter"
							className={joinClasses(inputClasses, inputDefaultClasses)}
							value={roomTypeFilter}
							onChange={(e) => setRoomTypeFilter(e.target.value)}
						>
							<option value="">{t("rooms.filters.allTypes")}</option>
							{roomTypes.map((rt) => (
								<option key={rt.id} value={rt.id}>
									{rt.name}
								</option>
							))}
						</select>

						<input
							aria-label={t("rooms.filters.searchPlaceholder")}
							className={joinClasses(inputClasses, inputDefaultClasses)}
							placeholder={t("rooms.filters.searchPlaceholder")}
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* ── Table ─────────────────────────────────────────────── */}
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
									<th className="pb-3 pr-4 font-medium">{t("rooms.fields.identifier")}</th>
									<th className="pb-3 pr-4 font-medium">{t("rooms.fields.room_type")}</th>
									<th className="pb-3 pr-4 font-medium">{t("rooms.fields.floor")}</th>
									<th className="pb-3 pr-4 font-medium">{t("rooms.fields.state")}</th>
									<th className="pb-3 pr-4 font-medium">{t("rooms.fields.description")}</th>
								{canEdit ? <th className="pb-3 w-24" /> : null}
								{canCreate ? <th className="pb-3 w-24" /> : null}
								</tr>
							</thead>
							<tbody>
								{filteredRooms.map((room) => (
									<tr
										key={room.id}
										className="border-b border-[var(--color-border)] last:border-b-0"
									>
										<td className="py-3 pr-4 text-[var(--color-heading)]">
											{room.identifier}
										</td>
										<td className="py-3 pr-4 text-[var(--color-heading)]">
											{roomTypeMap.get(room.room_type_id) ?? "—"}
										</td>
										<td className="py-3 pr-4 text-[var(--color-heading)]">
											{room.floor ?? "—"}
										</td>
										<td className="py-3 pr-4">
											<StatusBadge
												label={t(`rooms.states.${room.state}`)}
												size="sm"
												tone={ROOM_STATE_TONE_MAP[room.state] as "success" | "info" | "warning" | "danger" | "neutral"}
											/>
										</td>
										<td className="py-3 pr-4 text-[var(--color-muted)]">
											{room.description || "—"}
										</td>
										{canEdit ? (
											<td className="py-3">
												<Button
													onClick={() =>
														setModalMode({ type: "edit", room })
													}
													size="sm"
													variant="ghost"
												>
													{t("properties.profile.editButton")}
												</Button>
											</td>
										) : null}
									{canCreate ? (
										<td className="py-3">
											<Button
												onClick={() => setDeleteConfirm(room)}
												size="sm"
												variant="ghost"
											>
												{t("rooms.delete")}
											</Button>
										</td>
									) : null}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			{/* Modal for create or edit */}
			{modalMode.type === "create" ? (
				<RoomFormModal
					mode={modalMode}
					onSuccess={handleModalSuccess}
					onClose={() => setModalMode({ type: "closed" })}
					roomTypes={roomTypes}
					create={create}
				/>
			) : null}
			{modalMode.type === "edit" ? (
				<RoomFormModal
					mode={modalMode}
					onSuccess={handleModalSuccess}
					onClose={() => setModalMode({ type: "closed" })}
					roomTypes={roomTypes}
					create={create}
					update={update}
				/>
			) : null}

			{/* Delete confirmation dialog */}
			<ConfirmDialog
				cancelLabel={t("rooms.deleteConfirmCancel")}
				confirmLabel={t("rooms.deleteConfirmAccept")}
				error={deleteError}
				isOpen={deleteConfirm !== null}
				isProcessing={isDeleting}
				message={t("rooms.deleteConfirmMessage")}
				onCancel={handleDeleteClose}
				onConfirm={handleDeleteConfirm}
				title={t("rooms.deleteConfirmTitle")}
			/>

			{/* Restore confirmation dialog */}
			<ConfirmDialog
				cancelLabel={t("rooms.deleteConfirmCancel")}
				confirmLabel={t("rooms.archive.restore")}
				error={restoreError}
				isOpen={restoreConfirm !== null}
				isProcessing={isRestoring}
				message={t("rooms.archive.restoreConfirmMessage")}
				onCancel={handleRestoreClose}
				onConfirm={handleRestoreConfirm}
				title={t("rooms.archive.restoreConfirmTitle")}
				variant="primary"
			/>

			{/* Purge confirmation dialog */}
			<ConfirmDialog
				cancelLabel={t("rooms.deleteConfirmCancel")}
				confirmLabel={t("rooms.archive.purge")}
				error={purgeError}
				isOpen={purgeConfirm !== null}
				isProcessing={isPurging}
				message={t("rooms.archive.purgeConfirmMessage")}
				onCancel={handlePurgeClose}
				onConfirm={handlePurgeConfirm}
				title={t("rooms.archive.purgeConfirmTitle")}
				variant="danger"
			/>
		</PageSection>
	);
}

// ── Modal form sub-component ───────────────────────────────────────

function RoomFormModal({
	mode,
	onSuccess,
	onClose,
	roomTypes,
	create,
	update,
}: {
	readonly mode: ModalMode & { type: "create" | "edit" };
	readonly onSuccess: () => void;
	readonly onClose: () => void;
	readonly roomTypes: Array<{ readonly id: string; readonly name: string }>;
	readonly create: (data: RoomFormData) => Promise<void>;
	readonly update?: (id: string, data: RoomFormData) => Promise<void>;
}) {
	const { t } = useTranslation();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const isEditing = mode.type === "edit";
	const defaultValues: RoomFormData = isEditing
		? {
				identifier: mode.room.identifier,
				room_type_id: mode.room.room_type_id,
				floor: mode.room.floor ?? undefined,
				state: mode.room.state,
				description: mode.room.description ?? undefined,
			}
		: {
				identifier: "",
				room_type_id: "",
				floor: undefined,
				state: "available",
				description: undefined,
			};

	const {
		formState: { errors, isSubmitting },
		handleSubmit,
		register,
		reset,
	} = useForm<RoomFormData>({
		defaultValues,
		resolver: zodResolver(roomFormSchema) as Resolver<RoomFormData>,
	});

	async function onSubmit(data: RoomFormData) {
		setSubmitError(null);
		try {
			if (mode.type === "edit" && update) {
				await update(mode.room.id, data);
			} else {
				await create(data);
			}
			reset();
			onSuccess();
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === "validation-error" && err.message === "permission-denied") {
				setSubmitError(t("rooms.permissionError"));
			} else if (err.code === "23505" || (err.code === "validation-error" && err.message?.includes("identifier"))) {
				setSubmitError(t("rooms.duplicateIdentifier"));
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
					? t("rooms.edit.title")
					: t("rooms.create.title")
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
						error={errors.identifier?.message}
						htmlFor="room-identifier"
						label={t("rooms.fields.identifier")}
					>
						<input
							className={joinClasses(
								inputClasses,
								errors.identifier ? inputErrorClasses : inputDefaultClasses,
							)}
							id="room-identifier"
							{...register("identifier")}
						/>
					</FormField>

					<FormField
						error={errors.room_type_id?.message}
						htmlFor="room-type-id"
						label={t("rooms.fields.room_type")}
					>
						<select
							className={joinClasses(
								inputClasses,
								errors.room_type_id ? inputErrorClasses : inputDefaultClasses,
							)}
							id="room-type-id"
							{...register("room_type_id")}
						>
							<option value="">—</option>
							{roomTypes.map((rt) => (
								<option key={rt.id} value={rt.id}>
									{rt.name}
								</option>
							))}
						</select>
					</FormField>

					<FormField
						error={errors.floor?.message}
						htmlFor="room-floor"
						label={t("rooms.fields.floor")}
					>
						<input
							className={joinClasses(
								inputClasses,
								errors.floor ? inputErrorClasses : inputDefaultClasses,
							)}
							id="room-floor"
							type="number"
							{...register("floor")}
						/>
					</FormField>

					<FormField
						error={errors.state?.message}
						htmlFor="room-state"
						label={t("rooms.fields.state")}
					>
						<select
							className={joinClasses(
								inputClasses,
								errors.state ? inputErrorClasses : inputDefaultClasses,
							)}
							id="room-state"
							{...register("state")}
						>
							<option value="available">{t("rooms.states.available")}</option>
							<option value="occupied">{t("rooms.states.occupied")}</option>
							<option value="cleaning">{t("rooms.states.cleaning")}</option>
							<option value="maintenance">{t("rooms.states.maintenance")}</option>
							<option value="inactive">{t("rooms.states.inactive")}</option>
						</select>
					</FormField>

					<FormField
						error={errors.description?.message}
						htmlFor="room-description"
						label={t("rooms.fields.description")}
					>
						<input
							className={joinClasses(inputClasses, inputDefaultClasses)}
							id="room-description"
							{...register("description")}
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
							? t("rooms.edit.submit")
							: t("rooms.create.submit")}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
