import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {api} from "../api/SingIn.ts";
import { getAccessToken, storeAuthSession } from "../utils/auth.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    if (getAccessToken()) {
        return <Navigate to="/applications?page=1" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const normalizedEmail = email.trim();

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setMessage("Invalid email");
            return;
        }

        setMessage("");

        try {
            const response = await api.post("/auth/sign-in", { email: normalizedEmail, password });

            storeAuthSession(response.data.user, response.data.token);
            navigate("/applications?page=1");
        } catch (err: any) {
            setMessage(err.response?.data?.message || "Login error");
        }
    };

    return (
        <div className="login-page">
            <div className="sign-in">
                <div className="Login">
                    <form onSubmit={handleLogin}>
                        <h1>Email</h1>
                        <input
                            className={"email"}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setMessage("");
                            }}
                            required
                        />

                        <h1>Password</h1>
                        <input
                            className={"password"}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setMessage("");
                            }}
                            required
                        />

                        <button type="submit">Login</button>
                    </form>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
};
