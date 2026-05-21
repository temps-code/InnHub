import { Outlet, useLocation } from "react-router-dom";

import { protectedRoutes, findProtectedRoute } from "../routes/routeMetadata";
import { AppShell } from "../shell/AppShell";

export function ProtectedLayout() {
	const location = useLocation();
	const activeRoute = findProtectedRoute(location.pathname);

	return (
		<AppShell activeRoute={activeRoute} items={protectedRoutes}>
			<Outlet />
		</AppShell>
	);
}
