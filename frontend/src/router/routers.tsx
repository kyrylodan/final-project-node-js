import { createBrowserRouter } from "react-router-dom";

import { Layout } from "../Layouts/layout.tsx";
import { AdminPage } from "../page/AdminPage.tsx";
import { Application } from "../page/Application.tsx";
import { LoginPage } from "../page/LoginPage.tsx";
import { ManagerActionPage } from "../page/ManagerActionPage.tsx";
import { ProtectedRoute } from "../page/ProtectedRoute.tsx";

export const routes = createBrowserRouter([
    {
        path: "/",
        children: [
            { index: true, element: <LoginPage /> },
            { path: "activate/:token", element: <ManagerActionPage /> },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <Layout />,
                        children: [
                            { path: "applications", element: <Application /> },
                            { path: "admin", element: <AdminPage /> },
                        ],
                    },
                ],
            },
        ],
    },
]);
