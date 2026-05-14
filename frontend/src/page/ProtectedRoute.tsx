import { Navigate, Outlet } from "react-router-dom";

import { clearAuthStorage, getStoredUser } from "../utils/auth.ts";

export const ProtectedRoute = () => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();
    const isLegacyRoleId = typeof user?.role === "string" && /^[a-f\d]{24}$/i.test(user.role);

    if (!token) {
        return <Navigate replace to="/" />;
    }

    if (user?.role !== "admin" && user?.role !== "manager" && !isLegacyRoleId) {
        clearAuthStorage();
        return <Navigate replace to="/" />;
    }

    return <Outlet />;
};
