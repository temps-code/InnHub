import {
	CheckCircle2,
	Clock,
	LogIn,
	LogOut,
	UserX,
	XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "../../../shared/components/atoms/StatusBadge";
import type { ReservationStatus } from "../types";

type DisplayConfig = {
	readonly tone:
		| "neutral"
		| "success"
		| "warning"
		| "danger"
		| "info"
		| "accent";
	readonly icon: React.ComponentType<{
		className?: string;
		"aria-hidden"?: boolean;
	}>;
	readonly labelKey: string;
};

const STATUS_CONFIG: Record<ReservationStatus, DisplayConfig> = {
	pending: {
		tone: "warning",
		icon: Clock,
		labelKey: "reservations.status.pending",
	},
	confirmed: {
		tone: "info",
		icon: CheckCircle2,
		labelKey: "reservations.status.confirmed",
	},
	partially_checked_in: {
		tone: "accent",
		icon: LogIn,
		labelKey: "reservations.status.checkedIn",
	},
	checked_in: {
		tone: "accent",
		icon: LogIn,
		labelKey: "reservations.status.checkedIn",
	},
	cancelled: {
		tone: "danger",
		icon: XCircle,
		labelKey: "reservations.status.cancelled",
	},
	no_show: {
		tone: "danger",
		icon: UserX,
		labelKey: "reservations.status.noShow",
	},
};

export function ReservationStatusBadge({
	status,
}: {
	readonly status: string;
}) {
	const { t } = useTranslation();
	const config = STATUS_CONFIG[status as ReservationStatus] ?? {
		tone: "neutral",
		icon: LogOut,
		labelKey: "reservations.status.unknown",
	};
	const Icon = config.icon;

	return (
		<StatusBadge
			tone={config.tone}
			label={
				<span className="inline-flex items-center gap-1.5">
					<Icon aria-hidden={true} className="h-3.5 w-3.5" />
					<span>{t(config.labelKey)}</span>
				</span>
			}
		/>
	);
}
