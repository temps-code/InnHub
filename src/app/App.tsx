import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { appRoutes } from "./routes/routes";

const router = createBrowserRouter(appRoutes);

export function App() {
	return <RouterProvider router={router} />;
}
