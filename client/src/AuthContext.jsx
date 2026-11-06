import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, clearToken, getToken } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!getToken()) return setReady(true);
        api("/api/auth/me")
            .then((b) => setUser(b.user))
            .catch(() => clearToken())
            .finally(() => setReady(true));
    }, []);

    async function login(email, password) {
        const b = await api("/api/auth/login", { method: "POST", body: { email, password } });
        setToken(b.token);
        setUser(b.user);
    }

    async function register(name, email, password) {
        await api("/api/auth/register", { method: "POST", body: { name, email, password } });
        await login(email, password);
    }

    function logout() {
        clearToken();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, ready, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}