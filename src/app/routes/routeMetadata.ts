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
import type { AppProfileRole } from "../../features/auth/types";

export const APP_BASE_PATH = "/app";

export type RouteGroup = "operations" | "reports" | "settings";

export type ProtectedRouteId =
	| "dashboard"
	| "propertyProfile"
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
	group: RouteGroup;
	order: number;
	minRole: AppProfileRole;
};

const ROLE_ORDER: Record<AppProfileRole, number> = {
	administrator: 100,
	manager: 80,
	receptionist: 60,
	housekeeping: 40,
	maintenance: 40,
};

export function canAccess(
	minRole: AppProfileRole,
	userRole: AppProfileRole,
): boolean {
	const userLevel = ROLE_ORDER[userRole];
	const minLevel = ROLE_ORDER[minRole];

	// Same level: only exact role match (prevents peer roles like
	// housekeeping and maintenance from accessing each other's routes)
	if (userLevel === minLevel) {
		return userRole === minRole;
	}

	return userLevel > minLevel;
}

export type GroupedRouteItem = {
	group: RouteGroup;
	labelKey: string;
	items: readonly ProtectedRouteMeta[];
};

const route = (
	id: ProtectedRouteId,
	path: string,
	group: RouteGroup,
	order: number,
	minRole: AppProfileRole,
	icon?: ComponentType<LucideProps>,
	href?: string,
): ProtectedRouteMeta => ({
	id,
	path,
	href: `${APP_BASE_PATH}/${href ?? path}`,
	labelKey: `routes.protected.${id}.label`,
	titleKey: `routes.protected.${id}.title`,
	descriptionKey: `routes.protected.${id}.description`,
	icon,
	group,
	order,
	minRole,
});

export const protectedRoutes = [
	route(
		"dashboard",
		"dashboard",
		"operations",
		10,
		"receptionist",
		LayoutDashboard,
	),
	route("rooms", "rooms", "operations", 20, "receptionist", DoorOpen),
	route("roomTypes", "room-types", "operations", 30, "receptionist", Layers),
	route("guests", "guests", "operations", 40, "receptionist", UserCheck),
	route(
		"reservations",
		"reservations",
		"operations",
		50,
		"receptionist",
		CalendarCheck,
	),
	route(
		"housekeeping",
		"housekeeping",
		"operations",
		60,
		"housekeeping",
		SprayCan,
	),
	route("maintenance", "maintenance", "operations", 70, "maintenance", Wrench),
	route("billing", "billing", "operations", 80, "receptionist", Receipt),
	route("reports", "reports", "reports", 10, "manager", BarChart3),
] as const;

export const settingsRoutes = [
	route(
		"propertyProfile",
		"property",
		"settings",
		10,
		"administrator",
		Building2,
		"settings/property",
	),
	route(
		"users",
		"users",
		"settings",
		20,
		"administrator",
		Users,
		"settings/users",
	),
] as const;

export const allRoutes = [...protectedRoutes, ...settingsRoutes];

export function findProtectedRoute(pathname: string) {
	return allRoutes.find((route) => pathname === route.href);
}
