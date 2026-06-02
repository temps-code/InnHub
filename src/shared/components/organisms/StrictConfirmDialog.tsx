import { useMemo, useState } from "react";

import { Alert } from "../atoms/Alert";
import { Button } from "../atoms/Button";
import { Modal } from "./Modal";

export interface StrictConfirmDialogProps {
	cancelLabel?: string;
	confirmLabel?: string;
	confirmPhrase: string;
	error?: string | null;
	inputLabel?: string;
	isOpen: boolean;
	isProcessing?: boolean;
	message?: string;
	onCancel: () => void;
	onConfirm: () => void;
	phrasePrompt?: string;
	title: string;
}

export function StrictConfirmDialog({
	cancelLabel = "Cancel",
	confirmLabel = "Confirm",
	confirmPhrase,
	error,
	inputLabel = "Confirmation phrase",
	isOpen,
	isProcessing = false,
	message,
	onCancel,
	onConfirm,
	phrasePrompt,
	title,
}: StrictConfirmDialogProps) {
	const [typedValue, setTypedValue] = useState("");

	const isPhraseMatched = useMemo(
		() => typedValue === confirmPhrase,
		[confirmPhrase, typedValue],
	);

	function handleCancel() {
		setTypedValue("");
		onCancel();
	}

	function handleConfirm() {
		if (!isPhraseMatched || isProcessing) return;
		setTypedValue("");
		onConfirm();
	}

	return (
		<Modal isOpen={isOpen} onClose={handleCancel} title={title}>
			{error ? <Alert>{error}</Alert> : null}
			{message ? (
				<p className="mb-4 text-sm text-[var(--color-muted)]">{message}</p>
			) : null}
			<p className="mb-2 text-sm font-semibold text-[var(--color-heading)]">
				{phrasePrompt ?? (
					<>
						Type <code>{confirmPhrase}</code> to continue.
					</>
				)}
			</p>
			<label className="mb-4 block text-sm text-[var(--color-heading)]">
				<span className="mb-2 block">{inputLabel}</span>
				<input
					className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-heading)]"
					name="strict-confirmation-phrase"
					onChange={(event) => setTypedValue(event.target.value)}
					value={typedValue}
				/>
			</label>
			<div className="flex justify-end gap-3">
				<Button disabled={isProcessing} onClick={handleCancel} variant="ghost">
					{cancelLabel}
				</Button>
				<Button
					disabled={!isPhraseMatched}
					isLoading={isProcessing}
					onClick={handleConfirm}
					variant="danger"
				>
					{confirmLabel}
				</Button>
			</div>
		</Modal>
	);
}
