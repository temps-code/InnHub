import { Navigate, type RouteObject } from "react-router-dom";

import { ProtectedLayout } from "../layouts/ProtectedLayout";
import { LoginPage } from "../pages/LoginPage";
import { ModulePlaceholderPage } from "../pages/ModulePlaceholderPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PublicHomePage } from "../pages/PublicHomePage";
import { PropertyProfilePage } from "../../features/properties/PropertyProfilePage";
import { RoomTypesPage } from "../../features/room-types/RoomTypesPage";
import { RoomsPage } from "../../features/rooms/RoomsPage";
import { UserProfilePage } from "../../features/profile/UserProfilePage";
import { APP_BASE_PATH, protectedRoutes, settingsRoutes } from "./routeMetadata";
import { SettingsLayout } from "./SettingsLayout";

export const appRoutes: RouteObject[] = [
	{ path: "/", element: <PublicHomePage /> },
	{ path: "/login", element: <LoginPage /> },
	{
		path: APP_BASE_PATH,
		element: <ProtectedLayout />,
		children: [
			{ index: true, element: <Navigate to="/app/dashboard" replace /> },
			// Top-level routes (operations + reports)
			...protectedRoutes.map((route) => ({
				path: route.path,
				element:
					route.id === "propertyProfile" ? (
						<PropertyProfilePage titleKey={route.titleKey} />
					) : route.id === "roomTypes" ? (
						<RoomTypesPage />
					) : route.id === "rooms" ? (
						<RoomsPage />
					) : (
						<ModulePlaceholderPage route={route} />
					),
			})),
			// Settings nesting
			{
				path: "settings",
				element: <SettingsLayout />,
				children: settingsRoutes.map((route) => ({
					path: route.path,
			element:
				route.id === "propertyProfile" ? (
					<PropertyProfilePage titleKey={route.titleKey} />
				) : route.id === "profile" ? (
					<UserProfilePage titleKey={route.titleKey} />
				) : (
					<ModulePlaceholderPage route={route} />
				),
		})),
	},
	// Old path redirect
			{ path: "properties", element: <Navigate to="/app/settings/property" /> },
		],
	},
	{ path: "*", element: <NotFoundPage /> },
];
