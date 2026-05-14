import type { IUser } from "../models/IUser.ts";

export const getStoredUser = (): IUser | null => {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser) as IUser;
    } catch {
        return null;
    }
};

export const getCurrentUserSurnameNormalized = () =>
    String(getStoredUser()?.surname || "").trim().toLowerCase();

export const isAdminUser = (user: IUser | null) => user?.role === "admin";

export const clearAuthStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
