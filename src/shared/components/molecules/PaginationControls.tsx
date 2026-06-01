import { Button } from "../atoms/Button";

export interface PaginationControlsProps {
	className?: string;
	currentPage: number;
	nextAriaLabel?: string;
	nextLabel?: string;
	onPageChange: (page: number) => void;
	pageSize: number;
	pageSummaryFormatter?: (args: {
		readonly currentPage: number;
		readonly pageCount: number;
	}) => string;
	previousAriaLabel?: string;
	previousLabel?: string;
	rangeSummaryFormatter?: (args: {
		readonly currentPage: number;
		readonly pageSize: number;
		readonly totalItems: number;
	}) => string;
	totalItems: number;
}

function calculatePageCount(totalItems: number, pageSize: number): number {
	if (totalItems <= 0) return 1;
	return Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
}

function formatRange(
	currentPage: number,
	pageSize: number,
	totalItems: number,
): string {
	if (totalItems === 0) {
		return "Showing 0 of 0";
	}

	const start = (currentPage - 1) * pageSize + 1;
	const end = Math.min(totalItems, currentPage * pageSize);
	return `Showing ${start}-${end} of ${totalItems}`;
}

export function PaginationControls({
	className,
	currentPage,
	nextAriaLabel = "Next page",
	nextLabel = "Next",
	onPageChange,
	pageSize,
	pageSummaryFormatter,
	previousAriaLabel = "Previous page",
	previousLabel = "Previous",
	rangeSummaryFormatter,
	totalItems,
}: PaginationControlsProps) {
	const pageCount = calculatePageCount(totalItems, pageSize);
	const previousDisabled = currentPage <= 1;
	const nextDisabled = currentPage >= pageCount;

	return (
		<div className={className}>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="m-0 text-sm text-[var(--color-muted)]">
					{rangeSummaryFormatter
						? rangeSummaryFormatter({ currentPage, pageSize, totalItems })
						: formatRange(currentPage, pageSize, totalItems)}
				</p>
				<div className="flex items-center gap-3">
					<p className="m-0 text-sm text-[var(--color-muted)]">
						{pageSummaryFormatter
							? pageSummaryFormatter({ currentPage, pageCount })
							: `Page ${currentPage} of ${pageCount}`}
					</p>
					<Button
						aria-label={previousAriaLabel}
						disabled={previousDisabled}
						onClick={() => onPageChange(currentPage - 1)}
						size="sm"
						variant="outline"
					>
						{previousLabel}
					</Button>
					<Button
						aria-label={nextAriaLabel}
						disabled={nextDisabled}
						onClick={() => onPageChange(currentPage + 1)}
						size="sm"
						variant="outline"
					>
						{nextLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
