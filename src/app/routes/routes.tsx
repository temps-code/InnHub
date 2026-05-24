import { Navigate, type RouteObject } from "react-router-dom";

import { ProtectedLayout } from "../layouts/ProtectedLayout";
import { LoginPage } from "../pages/LoginPage";
import { ModulePlaceholderPage } from "../pages/ModulePlaceholderPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PublicHomePage } from "../pages/PublicHomePage";
import { APP_BASE_PATH, protectedRoutes } from "./routeMetadata";

export const appRoutes: RouteObject[] = [
	{ path: "/", element: <PublicHomePage /> },
	{ path: "/login", element: <LoginPage /> },
	{
		path: APP_BASE_PATH,
		element: <ProtectedLayout />,
		children: [
			{ index: true, element: <Navigate to="/app/dashboard" replace /> },
			...protectedRoutes.map((route) => ({
				path: route.path,
				element: <ModulePlaceholderPage route={route} />,
			})),
		],
	},
	{ path: "*", element: <NotFoundPage /> },
];
