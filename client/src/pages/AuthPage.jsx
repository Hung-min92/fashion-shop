import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function AuthPage({ mode }) {
    const isRegister = mode === "register";
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    async function submit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            if (isRegister) await register(form.name, form.email, form.password);
            else await login(form.email, form.password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={submit} className="mx-auto max-w-sm space-y-3">
            <h1 className="text-2xl font-bold">
                {isRegister ? "Đăng ký" : "Đăng nhập"}
            </h1>

            {isRegister && (
                <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="Họ tên"
                    value={form.name}
                    onChange={set("name")}
                />
            )}
            <input
                className="w-full rounded border px-3 py-2"
                placeholder="Email"
                value={form.email}
                onChange={set("email")}
            />
            <input
                className="w-full rounded border px-3 py-2"
                type="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={set("password")}
            />

            {error && <p className="text-red-600">{error}</p>}

            <button
                disabled={submitting}
                className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
            >
                {submitting ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
            </button>

            <p className="text-sm text-gray-600">
                {isRegister ? (
                    <>Đã có tài khoản? <Link to="/login" className="underline">Đăng nhập</Link></>
                ) : (
                    <>Chưa có tài khoản? <Link to="/register" className="underline">Đăng ký</Link></>
                )}
            </p>
        </form>
    );
}