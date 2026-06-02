import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	CalendarCheck,
	Clock3,
	LogIn,
	LogOut,
	Plus,
	RotateCcw,
	Search,
	Trash2,
	TriangleAlert,
	Users,
	XCircle,
} from "lucide-react";

import { canAccess } from "../../app/routes/routeMetadata";
import { Button } from "../../shared/components/atoms/Button";
import { Alert } from "../../shared/components/atoms/Alert";
import { FormField } from "../../shared/components/molecules/FormField";
import { MetricCard } from "../../shared/components/molecules/MetricCard";
import { PaginationControls } from "../../shared/components/molecules/PaginationControls";
import {
	inputClasses,
	inputDefaultClasses,
	inputErrorClasses,
} from "../../shared/components/molecules/formFieldClasses";
import { ConfirmDialog } from "../../shared/components/organisms/ConfirmDialog";
import { Modal } from "../../shared/components/organisms/Modal";
import { PageSection } from "../../shared/components/organisms/PageSection";
import { StrictConfirmDialog } from "../../shared/components/organisms/StrictConfirmDialog";
import { joinClasses } from "../../shared/utils/classNames";
import { useAuthSession } from "../auth";
import {
	create as createGuest,
	list as listGuests,
} from "../guests/guestService";
import type { Guest, GuestFormData } from "../guests/types";
import { list as listRooms } from "../rooms/roomService";
import type { Room } from "../rooms/types";
import { list as listRoomTypes } from "../room-types/roomTypeService";
import type { RoomType } from "../room-types/types";
import { ReservationStatusBadge } from "./components/ReservationStatusBadge";
import type {
	ReservationCreateData,
	ReservationItemInput,
	ReservationStatus,
} from "./types";
import { useReservations } from "./useReservations";

type ModalMode =
	| { readonly type: "closed" }
	| { readonly type: "create" }
	| { readonly type: "edit"; readonly reservationId: string };

const createInitialItem = (): ReservationItemInput => ({
	room_type_id: "",
	room_id: null,
	guest_count: 1,
});

const initialFormData: ReservationCreateData = {
	primary_guest_id: "",
	planned_check_in_date: "",
	planned_check_out_date: "",
	reservation_items: [createInitialItem()],
	room_type_id: "",
	room_id: null,
	guest_count: 1,
	status: "pending",
	notes: null,
};

export function ReservationsPage() {
	const { t } = useTranslation();
	const { state: authState } = useAuthSession();
	const session =
		authState.status === "authenticated" ? authState.session : null;
	const {
		state,
		params,
		setSearch,
		setStatus,
		setPage,
		setCheckInFrom,
		setCheckInTo,
		setCheckOutFrom,
		setCheckOutTo,
		setRoomId,
		setGuestId,
		toggleTrash,
		create,
		update,
		cancel,
		remove,
		restore,
		purge,
		showTrash,
	} = useReservations(session);

	const userRole = session?.profile.role ?? "any";
	const canCreate = canAccess("receptionist", userRole);
	const canCancel = canAccess("receptionist", userRole);
	const canTrash = canAccess("manager", userRole);
	const canPurge = canAccess("administrator", userRole);

	const [modalMode, setModalMode] = useState<ModalMode>({ type: "closed" });
	const [formData, setFormData] =
		useState<ReservationCreateData>(initialFormData);
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
	const [cancelError, setCancelError] = useState<string | null>(null);
	const [isCancelling, setIsCancelling] = useState(false);
	const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
	const [restoreError, setRestoreError] = useState<string | null>(null);
	const [isRestoring, setIsRestoring] = useState(false);
	const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
	const [removeError, setRemoveError] = useState<string | null>(null);
	const [isRemoving, setIsRemoving] = useState(false);
	const [purgeConfirm, setPurgeConfirm] = useState<string | null>(null);
	const [purgeError, setPurgeError] = useState<string | null>(null);
	const [isPurging, setIsPurging] = useState(false);
	const [guests, setGuests] = useState<Guest[]>([]);
	const [guestSearch, setGuestSearch] = useState("");
	const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [selectorError, setSelectorError] = useState<string | null>(null);
	const [showGuestQuickCreate, setShowGuestQuickCreate] = useState(false);
	const [quickCreateGuest, setQuickCreateGuest] = useState<GuestFormData>({
		first_name: "",
		last_name: "",
		document_type: "",
		document_number: "",
		email: null,
		phone: null,
		notes: null,
	});
	const [quickCreateError, setQuickCreateError] = useState<string | null>(null);
	const [isCreatingGuest, setIsCreatingGuest] = useState(false);

	const reservations = useMemo(
		() => (state.status === "loaded" ? state.result.reservations : []),
		[state],
	);
	const hasFilters = useMemo(
		() =>
			Boolean(
				(params.search ?? "").trim() ||
					(params.status && params.status !== "all") ||
					(params.checkInFrom ?? "").trim() ||
					(params.checkInTo ?? "").trim() ||
					(params.checkOutFrom ?? "").trim() ||
					(params.checkOutTo ?? "").trim() ||
					(params.room_id ?? "").trim() ||
					(params.guest_id ?? "").trim(),
			),
		[
			params.search,
			params.status,
			params.checkInFrom,
			params.checkInTo,
			params.checkOutFrom,
			params.checkOutTo,
			params.room_id,
			params.guest_id,
		],
	);

	const summaryMetrics = useMemo(() => {
		const today = new Date().toISOString().slice(0, 10);
		const visibleCount = reservations.length;
		const pendingCount = reservations.filter(
			(reservation) => reservation.status === "pending",
		).length;
		const arrivalsToday = reservations.filter(
			(reservation) => reservation.planned_check_in_date === today,
		).length;
		const departuresToday = reservations.filter(
			(reservation) => reservation.planned_check_out_date === today,
		).length;
		return {
			visibleCount,
			pendingCount,
			arrivalsToday,
			departuresToday,
		};
	}, [reservations]);

	const guestFilterOptions = useMemo(
		() =>
			guests.map((guest) => ({
				id: guest.id,
				label: `${guest.first_name} ${guest.last_name}`.trim() || guest.id,
			})),
		[guests],
	);

	const roomFilterOptions = useMemo(
		() =>
			rooms.map((room) => {
				const roomTypeName =
					roomTypes.find((roomType) => roomType.id === room.room_type_id)
						?.name ?? "";
				return {
					id: room.id,
					label: roomTypeName
						? `${room.identifier} · ${roomTypeName}`
						: room.identifier,
				};
			}),
		[rooms, roomTypes],
	);

	useEffect(() => {
		if (!session) {
			return;
		}

		let cancelled = false;
		async function loadSelectorData() {
			setSelectorError(null);
			const [guestResult, roomTypeResult, roomResult] = await Promise.all([
				listGuests(session, {
					search: modalMode.type === "closed" ? "" : guestSearch,
					page: 1,
					pageSize: 100,
				}),
				listRoomTypes(session),
				listRooms(session),
			]);

			if (cancelled) return;

			if (!guestResult.ok || !roomTypeResult.ok || !roomResult.ok) {
				if (modalMode.type !== "closed") {
					setSelectorError(t("reservations.form.selectorLoadError"));
				}
				return;
			}

			setGuests(guestResult.data.guests);
			setRoomTypes(roomTypeResult.data);
			setRooms(roomResult.data);
		}

		loadSelectorData();
		return () => {
			cancelled = true;
		};
	}, [modalMode.type, session, guestSearch, t]);

	if (state.status === "loading") {
		return (
			<PageSection title={t("reservations.list.title")} variant="quiet">
				<p className="m-0 text-[var(--color-muted)]" role="status">
					{t("reservations.list.loading")}
				</p>
			</PageSection>
		);
	}

	if (state.status === "error") {
		return (
			<PageSection
				title={t("reservations.list.title")}
				description={t("reservations.list.error")}
			/>
		);
	}

	async function handleSubmitReservation() {
		if (isSubmitting) return;
		setFormError(null);
		const reservationItems = formData.reservation_items ?? [];
		if (reservationItems.length === 0) {
			setFormError(t("reservations.form.itemsRequired"));
			return;
		}
		setIsSubmitting(true);
		try {
			if (modalMode.type === "edit") {
				await update(modalMode.reservationId, formData);
			} else {
				await create(formData);
			}
			setModalMode({ type: "closed" });
			setFormData(initialFormData);
			setGuestSearch("");
			setShowGuestQuickCreate(false);
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (
				err.code === "validation-error" &&
				err.message?.includes("duplicate-assigned-room")
			) {
				setFormError(t("reservations.form.duplicateAssignedRoom"));
			} else if (err.code === "validation-error") {
				setFormError(t("reservations.form.validationError"));
			} else {
				setFormError(t("reservations.form.genericError"));
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleQuickCreateGuest() {
		if (!session || isCreatingGuest) return;
		setIsCreatingGuest(true);
		setQuickCreateError(null);
		const result = await createGuest(session, quickCreateGuest);
		if (!result.ok) {
			setQuickCreateError(t("reservations.form.quickCreateGuestError"));
			setIsCreatingGuest(false);
			return;
		}

		setGuests((prev) => [
			result.data,
			...prev.filter((g) => g.id !== result.data.id),
		]);
		setFormData((prev) => ({ ...prev, primary_guest_id: result.data.id }));
		setShowGuestQuickCreate(false);
		setQuickCreateGuest({
			first_name: "",
			last_name: "",
			document_type: "",
			document_number: "",
			email: null,
			phone: null,
			notes: null,
		});
		setIsCreatingGuest(false);
	}

	async function handleCancelConfirm() {
		if (!cancelConfirm || isCancelling) return;
		setIsCancelling(true);
		setCancelError(null);
		try {
			await cancel(cancelConfirm);
			setCancelConfirm(null);
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === "validation-error") {
				setCancelError(t("reservations.cancel.validationError"));
			} else {
				setCancelError(t("reservations.cancel.genericError"));
			}
		} finally {
			setIsCancelling(false);
		}
	}

	async function handleRestoreConfirm() {
		if (!restoreConfirm || isRestoring) return;
		setIsRestoring(true);
		setRestoreError(null);
		try {
			await restore(restoreConfirm);
			setRestoreConfirm(null);
		} catch {
			setRestoreError(t("reservations.archive.restoreGenericError"));
		} finally {
			setIsRestoring(false);
		}
	}

	async function handleRemoveConfirm() {
		if (!removeConfirm || isRemoving) return;
		setIsRemoving(true);
		setRemoveError(null);
		try {
			await remove(removeConfirm);
			setRemoveConfirm(null);
		} catch {
			setRemoveError(t("reservations.archive.removeGenericError"));
		} finally {
			setIsRemoving(false);
		}
	}

	function parsePurgeCounts(errorMessage?: string) {
		const invoiceMatch = errorMessage?.match(/invoiceCount=(\d+)/);
		const paymentMatch = errorMessage?.match(/paymentCount=(\d+)/);
		return {
			invoiceCount: invoiceMatch ? Number(invoiceMatch[1]) : 0,
			paymentCount: paymentMatch ? Number(paymentMatch[1]) : 0,
		};
	}

	function isEditableStatus(status: ReservationStatus): boolean {
		return status === "pending" || status === "confirmed";
	}

	function isCancellableStatus(status: ReservationStatus): boolean {
		return status === "pending" || status === "confirmed";
	}

	function isArchivableStatus(status: ReservationStatus): boolean {
		return status !== "checked_in" && status !== "partially_checked_in";
	}

	function withPrimaryRowSnapshot(
		items: ReservationItemInput[],
	): Pick<ReservationCreateData, "room_type_id" | "room_id" | "guest_count"> {
		const first = items[0] ?? createInitialItem();
		return {
			room_type_id: first.room_type_id,
			room_id: first.room_id,
			guest_count: first.guest_count,
		};
	}

	function updateItemRow(
		index: number,
		updater: (item: ReservationItemInput) => ReservationItemInput,
	) {
		setFormData((prev) => {
			const currentItems = prev.reservation_items ?? [createInitialItem()];
			const nextItems = currentItems.map((item, rowIndex) =>
				rowIndex === index ? updater(item) : item,
			);
			return {
				...prev,
				reservation_items: nextItems,
				...withPrimaryRowSnapshot(nextItems),
			};
		});
	}

	async function handlePurgeConfirm() {
		if (!purgeConfirm || isPurging) return;
		setIsPurging(true);
		setPurgeError(null);
		try {
			await purge(purgeConfirm);
			setPurgeConfirm(null);
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === "foreign-key-conflict") {
				const counts = parsePurgeCounts(err.message);
				setPurgeError(
					t("reservations.archive.purgeForeignKeyConflict", {
						invoiceCount: counts.invoiceCount,
						paymentCount: counts.paymentCount,
					}),
				);
			} else {
				setPurgeError(t("reservations.archive.purgeGenericError"));
			}
		} finally {
			setIsPurging(false);
		}
	}

	return (
		<PageSection
			title={t("reservations.list.title")}
			description={t("reservations.list.subtitle")}
			actions={
				<div className="flex items-center gap-2">
					{canTrash ? (
						<Button variant="outline" onClick={toggleTrash}>
							<Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
							{showTrash
								? t("reservations.archive.toggleActive")
								: t("reservations.archive.toggle")}
						</Button>
					) : null}
					{canCreate && !showTrash ? (
						<Button onClick={() => setModalMode({ type: "create" })}>
							<Plus aria-hidden="true" className="mr-2 h-4 w-4" />
							{t("reservations.create.title")}
						</Button>
					) : null}
				</div>
			}
		>
			<div className="mb-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)]/80 p-4 shadow-sm sm:p-5">
				<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
					<div>
						<h3 className="m-0 text-lg font-semibold text-[var(--color-heading)]">
							{t("reservations.sections.overview")}
						</h3>
						<p className="mt-1 mb-0 text-sm text-[var(--color-muted)]">
							{t("reservations.metrics.todayBasedOnVisible")}
						</p>
					</div>
				</div>
				<div
					className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
					data-testid="reservations-kpi-cards"
					aria-label={t("reservations.metrics.aria")}
				>
					<MetricCard
						icon={<Users aria-hidden="true" className="h-4 w-4" />}
						label={t("reservations.metrics.visible")}
						value={summaryMetrics.visibleCount}
						helperText={
							showTrash
								? t("reservations.metrics.visibleArchivedHelper")
								: t("reservations.metrics.visibleActiveHelper")
						}
					/>
					<MetricCard
						icon={<Clock3 aria-hidden="true" className="h-4 w-4" />}
						label={t("reservations.metrics.pending")}
						value={summaryMetrics.pendingCount}
						helperText={t("reservations.metrics.pendingHelper")}
					/>
					<MetricCard
						icon={<LogIn aria-hidden="true" className="h-4 w-4" />}
						label={t("reservations.metrics.arrivalsToday")}
						value={summaryMetrics.arrivalsToday}
						helperText={t("reservations.metrics.todayBasedOnVisible")}
					/>
					<MetricCard
						icon={<LogOut aria-hidden="true" className="h-4 w-4" />}
						label={t("reservations.metrics.departuresToday")}
						value={summaryMetrics.departuresToday}
						helperText={t("reservations.metrics.todayBasedOnVisible")}
					/>
				</div>
			</div>

			<div className="mb-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)]/80 p-4 shadow-sm sm:p-5">
				<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
					<div>
						<h3 className="m-0 text-lg font-semibold text-[var(--color-heading)]">
							{t("reservations.sections.filters")}
						</h3>
						<p className="mt-1 mb-0 text-sm text-[var(--color-muted)]">
							{t("reservations.sections.filtersHelper")}
						</p>
					</div>
				</div>
				<div
					className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-4"
					data-testid="reservations-toolbar"
				>
					<label className="min-w-0 space-y-2">
						<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
							{t("reservations.filters.searchFieldLabel")}
						</span>
						<span className="relative block">
							<Search
								aria-hidden="true"
								className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
							/>
							<input
								aria-label={t("reservations.filters.searchLabel")}
								className={joinClasses(
									inputClasses,
									inputDefaultClasses,
									"h-12 w-full min-w-0 pl-10",
								)}
								placeholder={t("reservations.filters.searchPlaceholder")}
								value={params.search ?? ""}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</span>
					</label>
					{!showTrash ? (
						<>
							<label className="min-w-0 space-y-2">
								<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
									{t("reservations.filters.statusLabel")}
								</span>
								<select
									aria-label={t("reservations.filters.statusLabel")}
									className={joinClasses(
										inputClasses,
										inputDefaultClasses,
										"h-12 w-full min-w-0",
									)}
									value={params.status ?? "all"}
									onChange={(event) =>
										setStatus(event.target.value as ReservationStatus | "all")
									}
								>
									<option value="all">
										{t("reservations.filters.statusAll")}
									</option>
									<option value="pending">
										{t("reservations.status.pending")}
									</option>
									<option value="confirmed">
										{t("reservations.status.confirmed")}
									</option>
									<option value="partially_checked_in">
										{t("reservations.status.checkedIn")}
									</option>
									<option value="checked_in">
										{t("reservations.status.checkedIn")}
									</option>
									<option value="cancelled">
										{t("reservations.status.cancelled")}
									</option>
									<option value="no_show">
										{t("reservations.status.noShow")}
									</option>
								</select>
							</label>
							<label className="min-w-0 space-y-2">
								<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
									{t("reservations.filters.roomLabel")}
								</span>
								<select
									aria-label={t("reservations.filters.roomLabel")}
									className={joinClasses(
										inputClasses,
										inputDefaultClasses,
										"h-12 w-full min-w-0",
									)}
									value={params.room_id ?? ""}
									onChange={(event) => setRoomId(event.target.value)}
								>
									<option value="">{t("reservations.filters.roomAll")}</option>
									{roomFilterOptions.map((room) => (
										<option key={room.id} value={room.id}>
											{room.label}
										</option>
									))}
								</select>
							</label>
							<label className="min-w-0 space-y-2">
								<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
									{t("reservations.filters.guestLabel")}
								</span>
								<select
									aria-label={t("reservations.filters.guestLabel")}
									className={joinClasses(
										inputClasses,
										inputDefaultClasses,
										"h-12 w-full min-w-0",
									)}
									value={params.guest_id ?? ""}
									onChange={(event) => setGuestId(event.target.value)}
								>
									<option value="">{t("reservations.filters.guestAll")}</option>
									{guestFilterOptions.map((guest) => (
										<option key={guest.id} value={guest.id}>
											{guest.label}
										</option>
									))}
								</select>
							</label>
							<label className="min-w-0 space-y-2">
								<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
									{t("reservations.filters.checkInFrom")}
								</span>
								<input
									type="date"
									aria-label={t("reservations.filters.checkInFrom")}
									className={joinClasses(
										inputClasses,
										inputDefaultClasses,
										"h-12 w-full min-w-0",
									)}
									value={params.checkInFrom ?? ""}
									onChange={(event) => setCheckInFrom(event.target.value)}
								/>
							</label>
							<label className="min-w-0 space-y-2">
								<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
									{t("reservations.filters.checkInTo")}
								</span>
								<input
									type="date"
									aria-label={t("reservations.filters.checkInTo")}
									className={joinClasses(
										inputClasses,
										inputDefaultClasses,
										"h-12 w-full min-w-0",
									)}
									value={params.checkInTo ?? ""}
									onChange={(event) => setCheckInTo(event.target.value)}
								/>
							</label>
							<label className="min-w-0 space-y-2">
								<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
									{t("reservations.filters.checkOutFrom")}
								</span>
								<input
									type="date"
									aria-label={t("reservations.filters.checkOutFrom")}
									className={joinClasses(
										inputClasses,
										inputDefaultClasses,
										"h-12 w-full min-w-0",
									)}
									value={params.checkOutFrom ?? ""}
									onChange={(event) => setCheckOutFrom(event.target.value)}
								/>
							</label>
							<label className="min-w-0 space-y-2">
								<span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
									{t("reservations.filters.checkOutTo")}
								</span>
								<input
									type="date"
									aria-label={t("reservations.filters.checkOutTo")}
									className={joinClasses(
										inputClasses,
										inputDefaultClasses,
										"h-12 w-full min-w-0",
									)}
									value={params.checkOutTo ?? ""}
									onChange={(event) => setCheckOutTo(event.target.value)}
								/>
							</label>
						</>
					) : null}
				</div>
			</div>

			<div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)]/80 p-4 shadow-sm sm:p-5">
				<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
					<div>
						<h3 className="m-0 text-lg font-semibold text-[var(--color-heading)]">
							{t("reservations.sections.list")}
						</h3>
						<p className="mt-1 mb-0 text-sm text-[var(--color-muted)]">
							{t("reservations.sections.listCount", {
								count: reservations.length,
							})}
						</p>
					</div>
				</div>

				{reservations.length === 0 ? (
					<p className="m-0 text-sm text-[var(--color-muted)]">
						{hasFilters
							? t("reservations.list.noResults")
							: showTrash
								? t("reservations.archive.empty")
								: t("reservations.list.empty")}
					</p>
				) : (
					<div
						className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
						data-testid="reservations-table-viewport"
					>
						<table
							aria-label={t("reservations.list.tableAria")}
							className="w-full min-w-[760px] border-collapse text-left"
						>
							<thead>
								<tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-muted)]">
									<th className="px-3 py-2 font-medium">
										{t("reservations.table.id")}
									</th>
									<th className="px-3 py-2 font-medium">
										{t("reservations.table.guest")}
									</th>
									<th className="px-3 py-2 font-medium">
										{t("reservations.table.checkIn")}
									</th>
									<th className="px-3 py-2 font-medium">
										{t("reservations.table.checkOut")}
									</th>
									<th className="px-3 py-2 font-medium">
										{t("reservations.table.roomSummary")}
									</th>
									<th className="px-3 py-2 font-medium">
										{t("reservations.table.status")}
									</th>
									<th className="px-3 py-2 font-medium text-right">
										{t("reservations.table.actions")}
									</th>
								</tr>
							</thead>
							<tbody>
								{reservations.map((reservation) => {
									const reservationLabel =
										reservation.reference ?? reservation.id;
									return (
										<tr
											key={reservation.id}
											className="border-b border-[var(--color-border)]/60 align-middle"
										>
											<td className="px-3 py-3">
												<div className="inline-flex items-center gap-2 font-semibold text-[var(--color-heading)]">
													<CalendarCheck
														aria-hidden="true"
														className="h-4 w-4 text-[var(--color-primary)]"
													/>
													<span>{reservation.reference ?? reservation.id}</span>
												</div>
											</td>
											<td className="px-3 py-3 text-sm text-[var(--color-muted)]">
												{reservation.primary_guest_name ??
													t("reservations.table.unknownGuest")}
											</td>
											<td className="px-3 py-3 text-sm text-[var(--color-muted)]">
												{reservation.planned_check_in_date}
											</td>
											<td className="px-3 py-3 text-sm text-[var(--color-muted)]">
												{reservation.planned_check_out_date}
											</td>
											<td className="px-3 py-3 text-sm text-[var(--color-muted)]">
												{reservation.item_summary ??
													reservation.room_type_name ??
													reservation.room_identifier ??
													t("reservations.table.noRoomSummary")}
											</td>
											<td className="px-3 py-3">
												<ReservationStatusBadge status={reservation.status} />
											</td>
											<td className="px-3 py-3 text-right">
												<div className="inline-flex items-center justify-end gap-2">
													{showTrash ? (
														<>
															<Button
																size="sm"
																variant="outline"
																onClick={() =>
																	setRestoreConfirm(reservation.id)
																}
															>
																<RotateCcw
																	aria-hidden="true"
																	className="mr-2 h-4 w-4"
																/>
																{t("reservations.archive.restore")}
															</Button>
															{canPurge ? (
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() =>
																		setPurgeConfirm(reservation.id)
																	}
																	aria-label={t(
																		"reservations.archive.purgeAria",
																		{
																			id: reservationLabel,
																		},
																	)}
																>
																	<TriangleAlert
																		aria-hidden="true"
																		className="h-4 w-4"
																	/>
																</Button>
															) : null}
														</>
													) : (
														<>
															{isEditableStatus(reservation.status) ? (
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => {
																		const initialItems =
																			reservation.reservation_items &&
																			reservation.reservation_items.length > 0
																				? reservation.reservation_items.map(
																						(item) => ({
																							room_type_id: item.room_type_id,
																							room_id: item.room_id,
																							guest_count: item.guest_count,
																						}),
																					)
																				: [
																						{
																							room_type_id:
																								reservation.room_type_id ?? "",
																							room_id:
																								reservation.room_id ?? null,
																							guest_count:
																								reservation.guest_count ?? 1,
																						},
																					];
																		setFormData({
																			primary_guest_id:
																				reservation.primary_guest_id,
																			planned_check_in_date:
																				reservation.planned_check_in_date,
																			planned_check_out_date:
																				reservation.planned_check_out_date,
																			reservation_items: initialItems,
																			...withPrimaryRowSnapshot(initialItems),
																			status: reservation.status,
																			notes: reservation.notes,
																		});
																		setModalMode({
																			type: "edit",
																			reservationId: reservation.id,
																		});
																	}}
																	aria-label={t(
																		"reservations.actions.editAria",
																		{
																			id: reservationLabel,
																		},
																	)}
																>
																	{t("reservations.actions.edit")}
																</Button>
															) : null}
															{canCancel &&
															isCancellableStatus(reservation.status) ? (
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() =>
																		setCancelConfirm(reservation.id)
																	}
																	aria-label={t(
																		"reservations.actions.cancelAria",
																		{
																			id: reservationLabel,
																		},
																	)}
																>
																	<XCircle
																		aria-hidden="true"
																		className="h-4 w-4"
																	/>
																</Button>
															) : null}
															{canTrash &&
															isArchivableStatus(reservation.status) ? (
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() =>
																		setRemoveConfirm(reservation.id)
																	}
																	aria-label={t(
																		"reservations.archive.removeAria",
																		{
																			id: reservationLabel,
																		},
																	)}
																>
																	<Trash2
																		aria-hidden="true"
																		className="h-4 w-4"
																	/>
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
				)}
			</div>

			<PaginationControls
				className="mt-4"
				currentPage={state.result.page}
				pageSize={state.result.pageSize}
				totalItems={state.result.total}
				onPageChange={setPage}
				nextLabel={t("reservations.pagination.next")}
				previousLabel={t("reservations.pagination.previous")}
				nextAriaLabel={t("reservations.pagination.nextAria")}
				previousAriaLabel={t("reservations.pagination.previousAria")}
			/>

			<Modal
				isOpen={modalMode.type !== "closed"}
				onClose={() => setModalMode({ type: "closed" })}
				title={
					modalMode.type === "edit"
						? t("reservations.edit.title")
						: t("reservations.create.title")
				}
			>
				{formError ? <Alert>{formError}</Alert> : null}
				<div className="grid gap-4">
					{selectorError ? <Alert>{selectorError}</Alert> : null}
					<FormField
						htmlFor="reservation-guest-search"
						label={t("reservations.form.guestSearch")}
					>
						<input
							id="reservation-guest-search"
							className={joinClasses(inputClasses, inputDefaultClasses)}
							value={guestSearch}
							onChange={(event) => setGuestSearch(event.target.value)}
							placeholder={t("reservations.form.guestSearchPlaceholder")}
						/>
					</FormField>
					<FormField
						htmlFor="reservation-primary-guest"
						label={t("reservations.form.primaryGuest")}
					>
						<select
							id="reservation-primary-guest"
							className={joinClasses(
								inputClasses,
								inputDefaultClasses,
								formError && inputErrorClasses,
							)}
							value={formData.primary_guest_id}
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									primary_guest_id: event.target.value,
								}))
							}
						>
							<option value="">
								{t("reservations.form.selectGuestPlaceholder")}
							</option>
							{guests.map((guest) => (
								<option
									key={guest.id}
									value={guest.id}
								>{`${guest.first_name} ${guest.last_name}`}</option>
							))}
						</select>
					</FormField>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							onClick={() => setShowGuestQuickCreate((prev) => !prev)}
						>
							{showGuestQuickCreate
								? t("reservations.form.quickCreateGuestCancel")
								: t("reservations.form.quickCreateGuestOpen")}
						</Button>
					</div>
					{showGuestQuickCreate ? (
						<div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--color-border)] p-3 sm:grid-cols-2">
							{quickCreateError ? <Alert>{quickCreateError}</Alert> : null}
							<FormField
								htmlFor="quick-first-name"
								label={t("reservations.form.quickGuestFirstName")}
							>
								<input
									id="quick-first-name"
									className={joinClasses(inputClasses, inputDefaultClasses)}
									value={quickCreateGuest.first_name}
									onChange={(event) =>
										setQuickCreateGuest((prev) => ({
											...prev,
											first_name: event.target.value,
										}))
									}
								/>
							</FormField>
							<FormField
								htmlFor="quick-last-name"
								label={t("reservations.form.quickGuestLastName")}
							>
								<input
									id="quick-last-name"
									className={joinClasses(inputClasses, inputDefaultClasses)}
									value={quickCreateGuest.last_name}
									onChange={(event) =>
										setQuickCreateGuest((prev) => ({
											...prev,
											last_name: event.target.value,
										}))
									}
								/>
							</FormField>
							<FormField
								htmlFor="quick-doc-type"
								label={t("reservations.form.quickGuestDocumentType")}
							>
								<input
									id="quick-doc-type"
									className={joinClasses(inputClasses, inputDefaultClasses)}
									value={quickCreateGuest.document_type ?? ""}
									onChange={(event) =>
										setQuickCreateGuest((prev) => ({
											...prev,
											document_type: event.target.value,
										}))
									}
								/>
							</FormField>
							<FormField
								htmlFor="quick-doc-number"
								label={t("reservations.form.quickGuestDocumentNumber")}
							>
								<input
									id="quick-doc-number"
									className={joinClasses(inputClasses, inputDefaultClasses)}
									value={quickCreateGuest.document_number ?? ""}
									onChange={(event) =>
										setQuickCreateGuest((prev) => ({
											...prev,
											document_number: event.target.value,
										}))
									}
								/>
							</FormField>
							<div className="sm:col-span-2 flex justify-end">
								<Button
									isLoading={isCreatingGuest}
									onClick={handleQuickCreateGuest}
								>
									{t("reservations.form.quickCreateGuestSubmit")}
								</Button>
							</div>
						</div>
					) : null}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormField
							htmlFor="reservation-check-in"
							label={t("reservations.form.checkIn")}
						>
							<input
								type="date"
								id="reservation-check-in"
								className={joinClasses(
									inputClasses,
									inputDefaultClasses,
									formError && inputErrorClasses,
								)}
								value={formData.planned_check_in_date}
								onChange={(event) =>
									setFormData((prev) => ({
										...prev,
										planned_check_in_date: event.target.value,
									}))
								}
							/>
						</FormField>
						<FormField
							htmlFor="reservation-check-out"
							label={t("reservations.form.checkOut")}
						>
							<input
								type="date"
								id="reservation-check-out"
								className={joinClasses(
									inputClasses,
									inputDefaultClasses,
									formError && inputErrorClasses,
								)}
								value={formData.planned_check_out_date}
								onChange={(event) =>
									setFormData((prev) => ({
										...prev,
										planned_check_out_date: event.target.value,
									}))
								}
							/>
						</FormField>
					</div>
					<div className="grid gap-3 rounded-xl border border-[var(--color-border)] p-3">
						<div className="flex items-center justify-between gap-2">
							<h4 className="m-0 text-sm font-semibold text-[var(--color-text)]">
								{t("reservations.form.itemsTitle")}
							</h4>
							<Button
								size="sm"
								variant="outline"
								onClick={() =>
									setFormData((prev) => {
										const nextItems = [
											...(prev.reservation_items ?? [createInitialItem()]),
											createInitialItem(),
										];
										return {
											...prev,
											reservation_items: nextItems,
											...withPrimaryRowSnapshot(nextItems),
										};
									})
								}
							>
								{t("reservations.form.addItem")}
							</Button>
						</div>
						{(formData.reservation_items ?? [createInitialItem()]).map(
							(item, index) => {
								const selectedRoomIdsInOtherRows = new Set(
									(formData.reservation_items ?? [])
										.filter((_, rowIndex) => rowIndex !== index)
										.map((row) => row.room_id)
										.filter((roomId): roomId is string => Boolean(roomId)),
								);
								const availableRooms = rooms.filter(
									(room) =>
										(!item.room_type_id ||
											room.room_type_id === item.room_type_id) &&
										(!selectedRoomIdsInOtherRows.has(room.id) ||
											item.room_id === room.id),
								);
								return (
									<div
										key={`reservation-item-${index}`}
										className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3"
									>
										<div className="flex items-center justify-between">
											<p className="m-0 text-xs text-[var(--color-muted)]">
												{t("reservations.form.itemLabel", { index: index + 1 })}
											</p>
											{(formData.reservation_items?.length ?? 1) > 1 ? (
												<Button
													size="sm"
													variant="ghost"
													onClick={() =>
														setFormData((prev) => {
															const currentItems = prev.reservation_items ?? [
																createInitialItem(),
															];
															const nextItems = currentItems.filter(
																(_, rowIndex) => rowIndex !== index,
															);
															const safeItems =
																nextItems.length > 0
																	? nextItems
																	: [createInitialItem()];
															return {
																...prev,
																reservation_items: safeItems,
																...withPrimaryRowSnapshot(safeItems),
															};
														})
													}
												>
													{t("reservations.form.removeItem")}
												</Button>
											) : null}
										</div>
										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<FormField
												htmlFor={`reservation-room-type-${index}`}
												label={t("reservations.form.roomType")}
											>
												<select
													id={`reservation-room-type-${index}`}
													className={joinClasses(
														inputClasses,
														inputDefaultClasses,
														formError && inputErrorClasses,
													)}
													value={item.room_type_id}
													onChange={(event) =>
														updateItemRow(index, (currentItem) => {
															const nextRoomType = event.target.value;
															const roomStillValid = currentItem.room_id
																? rooms.some(
																		(room) =>
																			room.id === currentItem.room_id &&
																			room.room_type_id === nextRoomType,
																	)
																: true;
															return {
																...currentItem,
																room_type_id: nextRoomType,
																room_id: roomStillValid
																	? currentItem.room_id
																	: null,
															};
														})
													}
												>
													<option value="">
														{t("reservations.form.selectRoomTypePlaceholder")}
													</option>
													{roomTypes.map((roomType) => (
														<option key={roomType.id} value={roomType.id}>
															{roomType.name}
														</option>
													))}
												</select>
											</FormField>
											<FormField
												htmlFor={`reservation-room-id-${index}`}
												label={t("reservations.form.roomId")}
											>
												<select
													id={`reservation-room-id-${index}`}
													className={joinClasses(
														inputClasses,
														inputDefaultClasses,
														formError && inputErrorClasses,
													)}
													value={item.room_id ?? ""}
													onChange={(event) =>
														updateItemRow(index, (currentItem) => ({
															...currentItem,
															room_id: event.target.value.trim()
																? event.target.value
																: null,
														}))
													}
												>
													<option value="">
														{t("reservations.form.noRoomAssigned")}
													</option>
													{availableRooms.map((room) => (
														<option
															key={room.id}
															value={room.id}
														>{`${room.identifier} · ${room.state}`}</option>
													))}
												</select>
											</FormField>
										</div>
										<FormField
											htmlFor={`reservation-guest-count-${index}`}
											label={t("reservations.form.guestCount")}
										>
											<input
												type="number"
												min={1}
												id={`reservation-guest-count-${index}`}
												className={joinClasses(
													inputClasses,
													inputDefaultClasses,
													formError && inputErrorClasses,
												)}
												value={item.guest_count}
												onChange={(event) =>
													updateItemRow(index, (currentItem) => ({
														...currentItem,
														guest_count: Number(event.target.value) || 1,
													}))
												}
											/>
										</FormField>
									</div>
								);
							},
						)}
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="ghost"
							onClick={() => setModalMode({ type: "closed" })}
						>
							{t("reservations.form.cancel")}
						</Button>
						<Button isLoading={isSubmitting} onClick={handleSubmitReservation}>
							{modalMode.type === "edit"
								? t("reservations.edit.submit")
								: t("reservations.create.submit")}
						</Button>
					</div>
				</div>
			</Modal>

			<ConfirmDialog
				isOpen={cancelConfirm !== null}
				title={t("reservations.cancel.title")}
				message={t("reservations.cancel.message")}
				confirmLabel={t("reservations.cancel.confirm")}
				cancelLabel={t("reservations.cancel.dismiss")}
				error={cancelError}
				isProcessing={isCancelling}
				onCancel={() => {
					setCancelConfirm(null);
					setCancelError(null);
				}}
				onConfirm={handleCancelConfirm}
				variant="danger"
			/>

			<ConfirmDialog
				isOpen={removeConfirm !== null}
				title={t("reservations.archive.removeConfirmTitle")}
				message={t("reservations.archive.removeConfirmMessage")}
				confirmLabel={t("reservations.archive.remove")}
				cancelLabel={t("reservations.cancel.dismiss")}
				error={removeError}
				isProcessing={isRemoving}
				onCancel={() => {
					setRemoveConfirm(null);
					setRemoveError(null);
				}}
				onConfirm={handleRemoveConfirm}
				variant="danger"
			/>

			<ConfirmDialog
				isOpen={restoreConfirm !== null}
				title={t("reservations.archive.restoreConfirmTitle")}
				message={t("reservations.archive.restoreConfirmMessage")}
				confirmLabel={t("reservations.archive.restore")}
				cancelLabel={t("reservations.cancel.dismiss")}
				error={restoreError}
				isProcessing={isRestoring}
				onCancel={() => {
					setRestoreConfirm(null);
					setRestoreError(null);
				}}
				onConfirm={handleRestoreConfirm}
				variant="primary"
			/>

			<StrictConfirmDialog
				isOpen={purgeConfirm !== null}
				title={t("reservations.archive.purgeConfirmTitle")}
				message={t("reservations.archive.purgeConfirmMessage")}
				confirmLabel={t("reservations.archive.purge")}
				cancelLabel={t("reservations.cancel.dismiss")}
				confirmPhrase={t("reservations.archive.strictPhrase")}
				inputLabel={t("reservations.archive.strictConfirmLabel")}
				phrasePrompt={t("reservations.archive.strictConfirmPrompt", {
					phrase: t("reservations.archive.strictPhrase"),
				})}
				error={purgeError}
				isProcessing={isPurging}
				onCancel={() => {
					setPurgeConfirm(null);
					setPurgeError(null);
				}}
				onConfirm={handlePurgeConfirm}
			/>
		</PageSection>
	);
}
