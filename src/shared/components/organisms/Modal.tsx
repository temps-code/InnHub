import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
	readonly children?: ReactNode;
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly title: string;
}

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
	useEffect(() => {
		if (!isOpen) return;

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			data-testid="modal-overlay"
			onClick={onClose}
		>
			<div
				className="mx-4 w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-panel)]"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<h2 className="m-0 text-xl font-bold text-[var(--color-heading)]">
					{title}
				</h2>
				<div className="mt-4">{children}</div>
			</div>
		</div>,
		document.body,
	);
}
