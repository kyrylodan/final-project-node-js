import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/SingIn.ts";
import type { IManagerActionInfoResponse } from "../models/IManager.ts";

export const ManagerActionPage = () => {
    const { token = "" } = useParams();
    const [actionInfo, setActionInfo] = useState<IManagerActionInfoResponse | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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

        if (password.trim().length < 4) {
            setError("Password must contain at least 4 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            const { data } = await api.post<{ message: string }>(`/auth/activate/${token}`, {
                password,
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
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Password"
                                type="password"
                                value={password}
                            />
                        </label>

                        <label className="action-field">
                            <span>Confirm password</span>
                            <input
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Confirm password"
                                type="password"
                                value={confirmPassword}
                            />
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
