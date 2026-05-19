import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/SingIn.ts";
import type { IManagerActionInfoResponse } from "../models/IManager.ts";

const CYRILLIC_REGEX = /[А-Яа-яІіЇїЄєҐґ]/;
const LATIN_PASSWORD_REGEX = /^[\u0021-\u007E]+$/;

export const ManagerActionPage = () => {
    const { token = "" } = useParams();
    const [actionInfo, setActionInfo] = useState<IManagerActionInfoResponse | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const loadActionInfo = async () => {
            try {
                setLoading(true);
                setError("");
                const { data } = await api.get<IManagerActionInfoResponse>(`/auth/activate/${token}`);
                setActionInfo(data);
            } catch (requestError: any) {
                setError(requestError.response?.data?.message || "Invalid action link");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadActionInfo();
        }
    }, [token]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedPassword = password.trim();
        const nextFieldErrors = {
            password: "",
            confirmPassword: "",
        };

        if (normalizedPassword.length < 4) {
            nextFieldErrors.password = "Password must contain at least 4 characters";
        }

        if (
            normalizedPassword &&
            (CYRILLIC_REGEX.test(normalizedPassword) || !LATIN_PASSWORD_REGEX.test(normalizedPassword))
        ) {
            nextFieldErrors.password =
                "Password must contain only Latin letters, numbers, and symbols";
        }

        if (password !== confirmPassword) {
            nextFieldErrors.confirmPassword = "Passwords do not match";
        }

        if (nextFieldErrors.password || nextFieldErrors.confirmPassword) {
            setFieldErrors(nextFieldErrors);
            setError("");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setFieldErrors({
                password: "",
                confirmPassword: "",
            });
            const { data } = await api.post<{ message: string }>(`/auth/activate/${token}`, {
                password: normalizedPassword,
            });
            setSuccessMessage(data.message);
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "Failed to save password");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="action-page">
            <div className="action-card">
                {loading && <p className="action-state">Loading...</p>}

                {!loading && error && !successMessage && (
                    <p className="action-state action-state--error">{error}</p>
                )}

                {!loading && !error && !successMessage && actionInfo && (
                    <form className="action-form" onSubmit={handleSubmit}>
                        <h1 className="action-title">
                            {actionInfo.action === "activation" ? "Activate account" : "Reset password"}
                        </h1>
                        <p className="action-subtitle">{actionInfo.email}</p>

                        <label className="action-field">
                            <span>Password</span>
                            <input
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        password: "",
                                    }));
                                    setError("");
                                }}
                                placeholder="Password"
                                type="password"
                                value={password}
                            />
                            {fieldErrors.password && (
                                <span className="action-field-error">{fieldErrors.password}</span>
                            )}
                        </label>

                        <label className="action-field">
                            <span>Confirm password</span>
                            <input
                                onChange={(event) => {
                                    setConfirmPassword(event.target.value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        confirmPassword: "",
                                    }));
                                    setError("");
                                }}
                                placeholder="Confirm password"
                                type="password"
                                value={confirmPassword}
                            />
                            {fieldErrors.confirmPassword && (
                                <span className="action-field-error">
                                    {fieldErrors.confirmPassword}
                                </span>
                            )}
                        </label>

                        {error && <p className="action-state action-state--error">{error}</p>}

                        <button className="action-submit" disabled={submitting} type="submit">
                            {submitting
                                ? "Saving..."
                                : actionInfo.action === "activation"
                                  ? "Activate"
                                  : "Save password"}
                        </button>
                    </form>
                )}

                {!!successMessage && (
                    <div className="action-success">
                        <p className="action-state">{successMessage}</p>
                        <Link className="action-submit action-submit--link" to="/">
                            Go to login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
