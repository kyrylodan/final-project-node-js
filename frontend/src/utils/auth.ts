import type { IUser } from "../models/IUser.ts";
type TokenPair = {
    accessToken: string;
    refreshToken: string;
};

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

export const getAccessToken = () => localStorage.getItem("token");

export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const storeAuthTokens = (tokenPair: TokenPair) => {
    localStorage.setItem("token", tokenPair.accessToken);
    localStorage.setItem("refreshToken", tokenPair.refreshToken);
};

export const storeAuthSession = (user: IUser, tokenPair: TokenPair) => {
    storeAuthTokens(tokenPair);
    localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};
