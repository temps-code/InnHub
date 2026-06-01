import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
	BedDouble,
	FileClock,
	Filter,
	Pencil,
	Plus,
	RotateCcw,
	Search,
	Trash2,
	Users,
	UserRoundCheck,
} from "lucide-react";

import { canAccess } from "../../app/routes/routeMetadata";
import { useAuthSession } from "../auth";
import { Button } from "../../shared/components/atoms/Button";
import { InitialsAvatar } from "../../shared/components/atoms/InitialsAvatar";
import { StatusBadge } from "../../shared/components/atoms/StatusBadge";
import { FormField } from "../../shared/components/molecules/FormField";
import {
	inputClasses,
	inputDefaultClasses,
	inputErrorClasses,
} from "../../shared/components/molecules/formFieldClasses";
import { MetricCard } from "../../shared/components/molecules/MetricCard";
import { PaginationControls } from "../../shared/components/molecules/PaginationControls";
import { ConfirmDialog } from "../../shared/components/organisms/ConfirmDialog";
import { Modal } from "../../shared/components/organisms/Modal";
import { PageSection } from "../../shared/components/organisms/PageSection";
import { StrictConfirmDialog } from "../../shared/components/organisms/StrictConfirmDialog";
import { joinClasses } from "../../shared/utils/classNames";
import { guestFormSchema, type Guest, type GuestFormData } from "./types";
import { useGuests } from "./useGuests";

type ModalMode =
	| { type: "closed" }
	| { type: "create" }
	| { type: "edit"; guest: Guest };

function fullName(guest: Guest): string {
	return `${guest.first_name} ${guest.last_name}`.trim();
}

function toBadgeTone(showTrash: boolean) {
	return showTrash ? "warning" : "success";
}

export function GuestsPage() {
	const { t } = useTranslation();
	const { state: authState } = useAuthSession();
	const session =
		authState.status === "authenticated" ? authState.session : null;
	const {
		state,
		showTrash,
		params,
		setSearch,
		setActivity,
		setPage,
		toggleTrash,
		create,
		update,
		remove,
		restore,
		purge,
	} = useGuests(session);

	const userRole = session?.profile.role ?? "any";
	const canCreate = canAccess("receptionist", userRole);
	const canSoftDelete = canAccess("manager", userRole);
	const canPurge = canAccess("administrator", userRole);

	const [modalMode, setModalMode] = useState<ModalMode>({ type: "closed" });
	const [deleteConfirm, setDeleteConfirm] = useState<Guest | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [restoreConfirm, setRestoreConfirm] = useState<Guest | null>(null);
	const [restoreError, setRestoreError] = useState<string | null>(null);
	const [isRestoring, setIsRestoring] = useState(false);
	const [purgeConfirm, setPurgeConfirm] = useState<Guest | null>(null);
	const [purgeError, setPurgeError] = useState<string | null>(null);
	const [isPurging, setIsPurging] = useState(false);

	const guests = state.status === "loaded" ? state.result.guests : [];
	const summary =
		state.status === "loaded"
			? {
					totalGuests: state.result.total,
					returningGuests: 0,
					activeStays: 0,
					pendingInvoices: 0,
				}
			: {
					totalGuests: 0,
					returningGuests: 0,
					activeStays: 0,
					pendingInvoices: 0,
				};

	async function handleDeleteConfirm() {
		if (!deleteConfirm || isDeleting) return;
		setDeleteError(null);
		setIsDeleting(true);
		try {
			await remove(deleteConfirm.id);
			setDeleteConfirm(null);
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (
				err.code === "validation-error" &&
				err.message === "permission-denied"
			) {
				setDeleteError(t("guests.deletePermissionError"));
			} else if (
				err.code === "validation-error" &&
				err.message === "guest-has-active-or-future-reservations"
			) {
				setDeleteError(t("guests.reservationConflict"));
			} else {
				setDeleteError(t("guests.deleteGenericError"));
			}
		} finally {
			setIsDeleting(false);
		}
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
			if (
				err.code === "validation-error" &&
				err.message === "permission-denied"
			) {
				setRestoreError(t("guests.permissionError"));
			} else {
				setRestoreError(t("guests.archive.restoreGenericError"));
			}
		} finally {
			setIsRestoring(false);
		}
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
			if (
				err.code === "validation-error" &&
				err.message === "permission-denied"
			) {
				setPurgeError(t("guests.permissionError"));
			} else if (err.code === "foreign-key-conflict") {
				const count = err.message?.split(":")[1] ?? "0";
				setPurgeError(t("guests.archive.purgeForeignKeyConflict", { count }));
			} else {
				setPurgeError(t("guests.archive.purgeGenericError"));
			}
		} finally {
			setIsPurging(false);
		}
	}

	if (state.status === "loading") {
		return (
			<PageSection title={t("guests.list.title")} variant="quiet">
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("guests.list.loading")}
				</p>
			</PageSection>
		);
	}

	if (state.status === "error") {
		return (
			<PageSection
				title={t("guests.list.title")}
				description={t("guests.list.error")}
			/>
		);
	}

	return (
		<div className="w-full max-w-none" data-testid="guests-content">
			<div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-panel)] md:p-8">
				<div
					className="mb-4 flex flex-wrap items-center justify-between gap-3"
					data-testid="guests-toolbar"
				>
					<div className="flex min-w-[18rem] flex-1 flex-wrap items-center gap-3">
						<div className="relative w-full min-w-[15rem] flex-1">
							<Search
								aria-hidden="true"
								className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
								data-testid="guests-search-icon"
							/>
							<input
								aria-label={t("guests.filters.searchLabel")}
								className={joinClasses(
									inputClasses,
									inputDefaultClasses,
									"w-full min-w-[15rem] flex-1 pl-10",
								)}
								onChange={(event) => setSearch(event.target.value)}
								placeholder={t("guests.filters.searchPlaceholder")}
								value={params.search ?? ""}
							/>
						</div>
						<div className="relative">
							<Filter
								aria-hidden="true"
								className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
							/>
							<select
								aria-label={t("guests.filters.activityLabel")}
								className={joinClasses(
									inputClasses,
									inputDefaultClasses,
									"w-auto min-w-[13rem] pl-10",
								)}
								onChange={(event) =>
									setActivity(
										event.target.value as
											| "all"
											| "withOpenReservations"
											| "withoutOpenReservations",
									)
								}
								value={params.activity ?? "all"}
							>
								<option value="all">{t("guests.filters.allActivity")}</option>
								<option value="withOpenReservations">
									{t("guests.filters.withOpenReservations")}
								</option>
								<option value="withoutOpenReservations">
									{t("guests.filters.withoutOpenReservations")}
								</option>
							</select>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button size="sm" variant="outline" onClick={toggleTrash}>
							<Trash2
								aria-hidden="true"
								className="mr-2 h-4 w-4"
								data-testid="guests-trash-icon"
							/>
							{showTrash
								? t("guests.archive.toggleActive")
								: t("guests.archive.toggle")}
						</Button>
						{canCreate ? (
							<Button
								size="sm"
								onClick={() => setModalMode({ type: "create" })}
							>
								<Plus
									aria-hidden="true"
									className="mr-2 h-4 w-4"
									data-testid="guests-add-icon"
								/>
								{t("guests.create.title")}
							</Button>
						) : null}
					</div>
				</div>

				<div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<MetricCard
						icon={
							<Users
								aria-hidden="true"
								className="h-4 w-4"
								data-testid="metric-icon-total-guests"
							/>
						}
						label={t("guests.metrics.totalGuests")}
						value={summary.totalGuests}
					/>
					<MetricCard
						icon={
							<UserRoundCheck
								aria-hidden="true"
								className="h-4 w-4"
								data-testid="metric-icon-returning-guests"
							/>
						}
						label={t("guests.metrics.returningGuests")}
						value={summary.returningGuests}
						tone="info"
					/>
					<MetricCard
						icon={
							<BedDouble
								aria-hidden="true"
								className="h-4 w-4"
								data-testid="metric-icon-active-stays"
							/>
						}
						label={t("guests.metrics.activeStays")}
						value={summary.activeStays}
						tone="success"
					/>
					<MetricCard
						icon={
							<FileClock
								aria-hidden="true"
								className="h-4 w-4"
								data-testid="metric-icon-pending-invoices"
							/>
						}
						label={t("guests.metrics.pendingInvoices")}
						value={summary.pendingInvoices}
						tone="warning"
					/>
				</div>

				{guests.length === 0 ? (
					<p className="m-0 text-[var(--color-muted)]">
						{showTrash
							? t("guests.archive.empty")
							: params.search?.trim() || params.activity !== "all"
								? t("guests.list.noResults")
								: t("guests.list.empty")}
					</p>
				) : (
					<div className="grid gap-6">
						<div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
							<div
								className="overflow-x-auto"
								data-testid="guests-table-viewport"
							>
								<table
									aria-label={t("guests.list.tableAriaLabel")}
									className="w-full text-sm"
								>
									<thead className="bg-[var(--color-background)] text-left text-[var(--color-muted)]">
										<tr>
											<th className="px-4 py-3">
												{t("guests.fields.fullName")}
											</th>
											<th className="px-4 py-3">
												{t("guests.fields.documentNumber")}
											</th>
											<th className="px-4 py-3">{t("guests.fields.email")}</th>
											<th className="px-4 py-3">{t("guests.fields.phone")}</th>
											{showTrash ? (
												<th className="px-4 py-3">
													{t("guests.fields.deletedAt")}
												</th>
											) : null}
											<th className="px-4 py-3">{t("guests.fields.status")}</th>
											<th className="px-4 py-3" />
										</tr>
									</thead>
									<tbody>
										{guests.map((guest) => {
											return (
												<tr
													className="border-t border-[var(--color-border)]"
													key={guest.id}
												>
													<td className="px-4 py-3">
														<div className="flex items-center gap-3 text-left">
															<InitialsAvatar
																ariaLabel={fullName(guest)}
																name={fullName(guest)}
																size="sm"
															/>
															<span>{fullName(guest)}</span>
														</div>
													</td>
													<td className="px-4 py-3">
														{guest.document_number ?? "-"}
													</td>
													<td className="px-4 py-3">{guest.email ?? "-"}</td>
													<td className="px-4 py-3">{guest.phone ?? "-"}</td>
													{showTrash ? (
														<td className="px-4 py-3">
															{guest.deleted_at?.slice(0, 10) ?? "-"}
														</td>
													) : null}
													<td className="px-4 py-3">
														<StatusBadge
															label={
																showTrash
																	? t("guests.status.archived")
																	: t("guests.status.active")
															}
															size="sm"
															tone={toBadgeTone(showTrash)}
														/>
													</td>
													<td className="px-4 py-3">
														<div className="flex justify-end gap-2">
															{showTrash ? (
																<>
																	{canSoftDelete ? (
																		<Button
																			size="sm"
																			variant="ghost"
																			onClick={() => setRestoreConfirm(guest)}
																		>
																			<RotateCcw
																				aria-hidden="true"
																				className="mr-2 h-4 w-4"
																			/>
																			{t("guests.archive.restore")}
																		</Button>
																	) : null}
																	{canPurge ? (
																		<Button
																			size="sm"
																			variant="danger"
																			onClick={() => setPurgeConfirm(guest)}
																		>
																			<Trash2
																				aria-hidden="true"
																				className="mr-2 h-4 w-4"
																			/>
																			{t("guests.archive.purge")}
																		</Button>
																	) : null}
																</>
															) : (
																<>
																	{canCreate ? (
																		<Button
																			size="sm"
																			variant="outline"
																			onClick={() =>
																				setModalMode({ type: "edit", guest })
																			}
																		>
																			<Pencil
																				aria-hidden="true"
																				className="mr-2 h-4 w-4"
																			/>
																			{t("guests.edit.title")}
																		</Button>
																	) : null}
																	{canSoftDelete ? (
																		<Button
																			size="sm"
																			variant="ghost"
																			onClick={() => setDeleteConfirm(guest)}
																		>
																			<Trash2
																				aria-hidden="true"
																				className="mr-2 h-4 w-4"
																			/>
																			{t("guests.delete")}
																		</Button>
																	) : null}
																</>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
							<div className="border-t border-[var(--color-border)] p-4">
								<PaginationControls
									currentPage={state.result.page}
									onPageChange={setPage}
									pageSize={state.result.pageSize}
									totalItems={state.result.total}
									previousLabel={t("guests.pagination.previous")}
									nextLabel={t("guests.pagination.next")}
									previousAriaLabel={t("guests.pagination.previousAria")}
									nextAriaLabel={t("guests.pagination.nextAria")}
									rangeSummaryFormatter={({
										currentPage,
										pageSize,
										totalItems,
									}) =>
										t("guests.pagination.range", {
											start:
												totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1,
											end:
												totalItems === 0
													? 0
													: Math.min(totalItems, currentPage * pageSize),
											total: totalItems,
										})
									}
									pageSummaryFormatter={({ currentPage, pageCount }) =>
										t("guests.pagination.page", {
											page: currentPage,
											pageCount,
										})
									}
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{modalMode.type !== "closed" ? (
				<GuestFormModal
					mode={modalMode}
					onClose={() => setModalMode({ type: "closed" })}
					onSuccess={() => setModalMode({ type: "closed" })}
					create={create}
					update={update}
				/>
			) : null}

			<ConfirmDialog
				isOpen={Boolean(deleteConfirm)}
				onCancel={() => {
					setDeleteConfirm(null);
					setDeleteError(null);
				}}
				onConfirm={handleDeleteConfirm}
				isProcessing={isDeleting}
				error={deleteError}
				title={t("guests.deleteConfirmTitle")}
				message={t("guests.deleteConfirmMessage")}
				confirmLabel={t("guests.deleteConfirmAccept")}
				cancelLabel={t("guests.deleteConfirmCancel")}
			/>

			<ConfirmDialog
				isOpen={Boolean(restoreConfirm)}
				onCancel={() => {
					setRestoreConfirm(null);
					setRestoreError(null);
				}}
				onConfirm={handleRestoreConfirm}
				isProcessing={isRestoring}
				error={restoreError}
				title={t("guests.archive.restoreConfirmTitle")}
				message={t("guests.archive.restoreConfirmMessage")}
				confirmLabel={t("guests.archive.restore")}
			/>

			<StrictConfirmDialog
				isOpen={Boolean(purgeConfirm)}
				onCancel={() => {
					setPurgeConfirm(null);
					setPurgeError(null);
				}}
				onConfirm={handlePurgeConfirm}
				isProcessing={isPurging}
				error={purgeError}
				title={t("guests.archive.purgeConfirmTitle")}
				message={t("guests.archive.purgeConfirmMessage")}
				confirmPhrase="DELETE"
				phrasePrompt={t("guests.archive.strictConfirmPrompt", {
					phrase: "DELETE",
				})}
				inputLabel={t("guests.archive.strictConfirmLabel")}
				confirmLabel={t("guests.archive.purgeConfirmAccept")}
				cancelLabel={t("guests.deleteConfirmCancel")}
			/>
		</div>
	);
}

interface GuestFormModalProps {
	readonly mode: Exclude<ModalMode, { type: "closed" }>;
	readonly onClose: () => void;
	readonly onSuccess: () => void;
	readonly create: (data: GuestFormData) => Promise<void>;
	readonly update: (id: string, data: GuestFormData) => Promise<void>;
}

function GuestFormModal({
	mode,
	onClose,
	onSuccess,
	create,
	update,
}: GuestFormModalProps) {
	const { t } = useTranslation();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<GuestFormData>({
		resolver: zodResolver(guestFormSchema) as Resolver<GuestFormData>,
		defaultValues:
			mode.type === "edit"
				? {
						first_name: mode.guest.first_name,
						last_name: mode.guest.last_name,
						document_type: mode.guest.document_type ?? "",
						document_number: mode.guest.document_number ?? "",
						email: mode.guest.email,
						phone: mode.guest.phone,
						notes: mode.guest.notes,
					}
				: {
						first_name: "",
						last_name: "",
						document_type: "",
						document_number: "",
						email: null,
						phone: null,
						notes: null,
					},
	});

	async function onSubmit(data: GuestFormData) {
		setSubmitError(null);
		try {
			if (mode.type === "create") {
				await create(data);
			} else {
				await update(mode.guest.id, data);
			}
			onSuccess();
		} catch {
			setSubmitError(t("guests.saveGenericError"));
		}
	}

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={
				mode.type === "create"
					? t("guests.create.title")
					: t("guests.edit.title")
			}
		>
			<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
				<FormField
					label={t("guests.fields.firstName")}
					error={errors.first_name?.message}
				>
					<input
						className={joinClasses(
							inputClasses,
							errors.first_name ? inputErrorClasses : inputDefaultClasses,
						)}
						{...register("first_name")}
					/>
				</FormField>
				<FormField
					label={t("guests.fields.lastName")}
					error={errors.last_name?.message}
				>
					<input
						className={joinClasses(
							inputClasses,
							errors.last_name ? inputErrorClasses : inputDefaultClasses,
						)}
						{...register("last_name")}
					/>
				</FormField>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label={t("guests.fields.documentType")}>
						<input
							className={joinClasses(inputClasses, inputDefaultClasses)}
							{...register("document_type")}
						/>
					</FormField>
					<FormField label={t("guests.fields.documentNumber")}>
						<input
							className={joinClasses(inputClasses, inputDefaultClasses)}
							{...register("document_number")}
						/>
					</FormField>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						label={t("guests.fields.email")}
						error={errors.email?.message}
					>
						<input
							className={joinClasses(
								inputClasses,
								errors.email ? inputErrorClasses : inputDefaultClasses,
							)}
							{...register("email")}
						/>
					</FormField>
					<FormField label={t("guests.fields.phone")}>
						<input
							className={joinClasses(inputClasses, inputDefaultClasses)}
							{...register("phone")}
						/>
					</FormField>
				</div>
				<FormField label={t("guests.fields.notes")}>
					<textarea
						className={joinClasses(
							inputClasses,
							inputDefaultClasses,
							"min-h-24",
						)}
						{...register("notes")}
					/>
				</FormField>
				{submitError ? (
					<p className="m-0 text-sm text-red-600">{submitError}</p>
				) : null}
				<div className="flex justify-end gap-3">
					<Button
						onClick={onClose}
						type="button"
						variant="ghost"
						disabled={isSubmitting}
					>
						{t("guests.deleteConfirmCancel")}
					</Button>
					<Button type="submit" isLoading={isSubmitting}>
						{mode.type === "create"
							? t("guests.create.submit")
							: t("guests.edit.submit")}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
