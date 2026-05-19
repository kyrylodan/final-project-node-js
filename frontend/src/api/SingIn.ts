import axios from "axios";

import {
    clearAuthStorage,
    getAccessToken,
    getRefreshToken,
    storeAuthTokens,
} from "../utils/auth.ts";

type RefreshResponse = {
    token: {
        accessToken: string;
        refreshToken: string;
    };
};

type RetryableRequest = {
    _retry?: boolean;
    headers?: Record<string, string>;
    url?: string;
};

const AUTH_BASE_URL = "http://localhost:3000/api";

const navigateToLogin = () => {
    if (window.location.pathname === "/") {
        return;
    }

    window.history.replaceState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
};

const refreshClient = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let refreshRequest: Promise<string> | null = null;

const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error("Refresh token is missing");
    }

    const { data } = await refreshClient.post<RefreshResponse>("/auth/refresh", {
        refreshToken,
    });

    storeAuthTokens(data.token);

    return data.token.accessToken;
};

export const api = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = (error.config || {}) as RetryableRequest;
        const requestUrl = String(originalRequest.url || "");
        const isSignInRequest = requestUrl.includes("/auth/sign-in");
        const isRefreshRequest = requestUrl.includes("/auth/refresh");
        const isUnauthorized = error.response?.status === 401;

        if (!isUnauthorized) {
            return Promise.reject(error);
        }

        if (isSignInRequest) {
            return Promise.reject(error);
        }

        if (isRefreshRequest || originalRequest._retry) {
            clearAuthStorage();
            navigateToLogin();
            return Promise.reject(error);
        }

        try {
            originalRequest._retry = true;

            if (!refreshRequest) {
                refreshRequest = refreshAccessToken().finally(() => {
                    refreshRequest = null;
                });
            }

            const newAccessToken = await refreshRequest;
            originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${newAccessToken}`,
            };

            return await api(originalRequest);
        } catch (refreshError) {
            clearAuthStorage();
            navigateToLogin();
            return Promise.reject(refreshError);
        }
    }
);
