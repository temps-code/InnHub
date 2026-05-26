import type { LucideProps } from "lucide-react";
import {
	BarChart3,
	Building2,
	CalendarCheck,
	DoorOpen,
	Layers,
	LayoutDashboard,
	Receipt,
	SprayCan,
	UserCheck,
	Users,
	Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

export const APP_BASE_PATH = "/app";

export type ProtectedRouteId =
	| "dashboard"
	| "properties"
	| "users"
	| "rooms"
	| "roomTypes"
	| "guests"
	| "reservations"
	| "housekeeping"
	| "maintenance"
	| "billing"
	| "reports";

export type ProtectedRouteMeta = {
	id: ProtectedRouteId;
	path: string;
	href: `${typeof APP_BASE_PATH}/${string}`;
	labelKey: string;
	titleKey: string;
	descriptionKey: string;
	icon?: ComponentType<LucideProps>;
};

const route = (
	id: ProtectedRouteId,
	path: string,
	icon?: ComponentType<LucideProps>,
): ProtectedRouteMeta => ({
	id,
	path,
	href: `${APP_BASE_PATH}/${path}`,
	labelKey: `routes.protected.${id}.label`,
	titleKey: `routes.protected.${id}.title`,
	descriptionKey: `routes.protected.${id}.description`,
	icon,
});

export const protectedRoutes = [
	route("dashboard", "dashboard", LayoutDashboard),
	route("properties", "properties", Building2),
	route("users", "users", Users),
	route("rooms", "rooms", DoorOpen),
	route("roomTypes", "room-types", Layers),
	route("guests", "guests", UserCheck),
	route("reservations", "reservations", CalendarCheck),
	route("housekeeping", "housekeeping", SprayCan),
	route("maintenance", "maintenance", Wrench),
	route("billing", "billing", Receipt),
	route("reports", "reports", BarChart3),
] as const;

export function findProtectedRoute(pathname: string) {
	return protectedRoutes.find((route) => pathname === route.href);
}
