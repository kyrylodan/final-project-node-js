import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {api} from "../api/SingIn.ts";

export const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    if (localStorage.getItem("token")) {
        return <Navigate to="/applications?page=1" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/sign-in", { email, password });

            localStorage.setItem("token", response.data.token.accessToken);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/applications?page=1");
        } catch (err: any) {
            setMessage(err.response?.data?.message || "Помилка при вході");
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
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <h1>Password</h1>
                        <input
                            className={"password"}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
