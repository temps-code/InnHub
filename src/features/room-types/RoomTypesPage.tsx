import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthSession } from "../auth";
import { Button } from "../../shared/components/atoms/Button";
import { Modal } from "../../shared/components/organisms/Modal";
import { PageSection } from "../../shared/components/organisms/PageSection";
import { canAccess } from "../../app/routes/routeMetadata";
import type { RoomType, RoomTypeFormData } from "./types";
import { roomTypeFormSchema } from "./types";
import { useRoomTypes } from "./useRoomTypes";

// ── Modal mode ──────────────────────────────────────────────────────

type ModalMode =
	| { readonly type: "closed" }
	| { readonly type: "create" }
	| { readonly type: "edit"; readonly roomType: RoomType };

// ── Helpers ────────────────────────────────────────────────────────

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}

// ── Main component ─────────────────────────────────────────────────

export function RoomTypesPage() {
	const { t } = useTranslation();
	const { state: authState } = useAuthSession();
	const session =
		authState.status === "authenticated" ? authState.session : null;
	const { state, create, update } = useRoomTypes(session);
	const [modalMode, setModalMode] = useState<ModalMode>({ type: "closed" });

	const userRole = session?.profile.role ?? "any";
	const canEdit = canAccess("manager", userRole);

	// ── Modal form handler (shared by create and edit) ────────────────

	function handleModalSuccess() {
		setModalMode({ type: "closed" });
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

	if (state.status === "loaded" && state.roomTypes.length === 0) {
		return (
			<PageSection
				actions={
					canEdit ? (
						<Button onClick={() => setModalMode({ type: "create" })}>
							{t("roomTypes.create.title")}
						</Button>
					) : undefined
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
				canEdit ? (
					<Button onClick={() => setModalMode({ type: "create" })}>
						{t("roomTypes.create.title")}
					</Button>
				) : undefined
			}
			title={t("roomTypes.list.title")}
		>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
							<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.name")}</th>
							<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.capacity")}</th>
							<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.base_price")}</th>
							<th className="pb-3 pr-4 font-medium">{t("roomTypes.fields.description")}</th>
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
							</tr>
						))}
					</tbody>
				</table>
			</div>

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
			if (err.message === "permission-denied") {
				setSubmitError(t("roomTypes.list.error") || "Permission denied.");
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
					<div className="flex flex-col gap-1">
						<label
							className="text-sm font-medium text-[var(--color-muted)]"
							htmlFor="room-type-name"
						>
							{t("roomTypes.fields.name")}
						</label>
						<input
							className={joinClasses(
								"rounded-xl border px-4 py-2.5 text-sm text-[var(--color-heading)] outline-none transition",
								"focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
								errors.name
									? "border-red-500"
									: "border-[var(--color-border)] bg-[var(--color-surface)]",
							)}
							id="room-type-name"
							{...register("name")}
						/>
						{errors.name ? (
							<span className="text-xs text-red-500" role="alert">
								{errors.name.message}
							</span>
						) : null}
					</div>

					<div className="flex flex-col gap-1">
						<label
							className="text-sm font-medium text-[var(--color-muted)]"
							htmlFor="room-type-description"
						>
							{t("roomTypes.fields.description")}
						</label>
						<input
							className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
							id="room-type-description"
							{...register("description")}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label
							className="text-sm font-medium text-[var(--color-muted)]"
							htmlFor="room-type-capacity"
						>
							{t("roomTypes.fields.capacity")}
						</label>
						<input
							className={joinClasses(
								"rounded-xl border px-4 py-2.5 text-sm text-[var(--color-heading)] outline-none transition",
								"focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
								errors.capacity
									? "border-red-500"
									: "border-[var(--color-border)] bg-[var(--color-surface)]",
							)}
							id="room-type-capacity"
							type="number"
							{...register("capacity")}
						/>
						{errors.capacity ? (
							<span className="text-xs text-red-500" role="alert">
								{errors.capacity.message}
							</span>
						) : null}
					</div>

					<div className="flex flex-col gap-1">
						<label
							className="text-sm font-medium text-[var(--color-muted)]"
							htmlFor="room-type-base-price"
						>
							{t("roomTypes.fields.base_price")}
						</label>
						<input
							className={joinClasses(
								"rounded-xl border px-4 py-2.5 text-sm text-[var(--color-heading)] outline-none transition",
								"focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
								errors.base_price
									? "border-red-500"
									: "border-[var(--color-border)] bg-[var(--color-surface)]",
							)}
							id="room-type-base-price"
							type="number"
							step="any"
							{...register("base_price")}
						/>
						{errors.base_price ? (
							<span className="text-xs text-red-500" role="alert">
								{errors.base_price.message}
							</span>
						) : null}
					</div>
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
