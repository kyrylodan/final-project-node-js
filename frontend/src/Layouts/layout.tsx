import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { AdminIcon, LogoutIcon } from "../components/AppIcons.tsx";
import { clearAuthStorage, getStoredUser, isAdminUser } from "../utils/auth.ts";

export const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = getStoredUser();
    const isAdmin = isAdminUser(user);

    const handleLogout = () => {
        clearAuthStorage();
        navigate("/", { replace: true });
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <button
                    className="app-logo"
                    onClick={() => navigate("/applications?page=1")}
                    type="button"
                >
                    Logo
                </button>

                <div className="app-header-actions">
                    <span className="app-header-user">{user?.name || user?.email || "User"}</span>

                    {isAdmin && (
                        <button
                            aria-label="Admin panel"
                            className={`app-header-button app-header-button--icon ${location.pathname === "/admin" ? "app-header-button--active" : ""}`}
                            onClick={() => navigate("/admin")}
                            title="Admin panel"
                            type="button"
                        >
                            <AdminIcon />
                            <span className="sr-only">Admin panel</span>
                        </button>
                    )}

                    <button
                        aria-label="Logout"
                        className="app-header-button app-header-button--icon"
                        onClick={handleLogout}
                        title="Logout"
                        type="button"
                    >
                        <LogoutIcon />
                        <span className="sr-only">Logout</span>
                    </button>
                </div>
            </header>

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
};
