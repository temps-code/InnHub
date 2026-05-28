import { useTranslation } from "react-i18next";

import { Alert } from "../atoms/Alert";
import { Button } from "../atoms/Button";
import { Modal } from "./Modal";

// ── Types ────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
	readonly cancelLabel?: string;
	readonly confirmLabel?: string;
	readonly error?: string | null;
	readonly isOpen: boolean;
	readonly isProcessing?: boolean;
	readonly message: string;
	readonly onCancel: () => void;
	readonly onConfirm: () => void;
	readonly title: string;
	readonly variant?: "danger" | "primary";
}

// ── Component ────────────────────────────────────────────────────────

export function ConfirmDialog({
	cancelLabel,
	confirmLabel,
	error,
	isOpen,
	isProcessing = false,
	message,
	onCancel,
	onConfirm,
	title,
	variant = "danger",
}: ConfirmDialogProps) {
	const { t } = useTranslation();

	return (
		<Modal isOpen={isOpen} onClose={onCancel} title={title}>
			{error ? <Alert>{error}</Alert> : null}
			<p className="mb-6 text-sm text-[var(--color-muted)]">{message}</p>
			<div className="flex justify-end gap-3">
				<Button
					disabled={isProcessing}
					onClick={onCancel}
					type="button"
					variant="ghost"
				>
					{cancelLabel ?? t("properties.profile.cancelButton")}
				</Button>
				<Button
					isLoading={isProcessing}
					onClick={onConfirm}
					type="button"
					variant={variant}
				>
					{confirmLabel ?? t("roomTypes.deleteConfirmAccept")}
				</Button>
			</div>
		</Modal>
	);
}
