import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import AuthCard from "../components/AuthCard.jsx";

const inputClass =
    "w-full border border-[#EAEAEA] bg-white px-4 py-3 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]";

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (password.length < 8) return setError("Mật khẩu phải có ít nhất 8 ký tự");
        if (password !== confirm) return setError("Hai mật khẩu không khớp");
        setSubmitting(true);
        try {
            await api("/api/auth/reset-password", { method: "POST", body: { token, password } });
            showToast("Đã đặt lại mật khẩu, hãy đăng nhập");
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (!token) {
        return (
            <AuthCard eyebrow="Mật khẩu" title="Liên kết không hợp lệ">
                <Link to="/forgot-password" className="text-xs font-medium text-[#171717] underline underline-offset-4">
                    Yêu cầu liên kết mới
                </Link>
            </AuthCard>
        );
    }

    return (
        <AuthCard eyebrow="Mật khẩu" title="Đặt mật khẩu mới">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-xs text-[#777777]">Mật khẩu mới</label>
                    <input
                        type="password"
                        className={inputClass}
                        placeholder="Tối thiểu 8 ký tự"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs text-[#777777]">Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        className={inputClass}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </div>
                {error && (
                    <div className="border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                        {error}{" "}
                        <Link to="/forgot-password" className="underline">Yêu cầu liên kết mới</Link>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#171717] py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#202020] disabled:opacity-50"
                >
                    {submitting ? "Đang xử lý..." : "Đặt mật khẩu"}
                </button>
            </form>
        </AuthCard>
    );
}