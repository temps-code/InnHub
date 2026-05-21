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
};

const route = (id: ProtectedRouteId, path: string): ProtectedRouteMeta => ({
	id,
	path,
	href: `${APP_BASE_PATH}/${path}`,
	labelKey: `routes.protected.${id}.label`,
	titleKey: `routes.protected.${id}.title`,
	descriptionKey: `routes.protected.${id}.description`,
});

export const protectedRoutes = [
	route("dashboard", "dashboard"),
	route("properties", "properties"),
	route("users", "users"),
	route("rooms", "rooms"),
	route("roomTypes", "room-types"),
	route("guests", "guests"),
	route("reservations", "reservations"),
	route("housekeeping", "housekeeping"),
	route("maintenance", "maintenance"),
	route("billing", "billing"),
	route("reports", "reports"),
] as const;

export function findProtectedRoute(pathname: string) {
	return protectedRoutes.find((route) => pathname === route.href);
}
