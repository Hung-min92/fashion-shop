import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import AuthCard from "../components/AuthCard.jsx";

const inputClass =
    "w-full border border-[#EAEAEA] bg-white px-4 py-3 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (!email.trim()) return setError("Vui lòng nhập email");
        setSubmitting(true);
        try {
            await api("/api/auth/forgot-password", { method: "POST", body: { email: email.trim() } });
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthCard
            eyebrow="Mật khẩu"
            title="Quên mật khẩu"
            intro="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu."
        >
            {sent ? (
                <p className="border border-[#EAEAEA] bg-[#FAFAFA] px-3.5 py-3 text-sm text-[#171717]">
                    Nếu email tồn tại trong hệ thống, bạn sẽ nhận được thư trong vài phút. Hãy kiểm tra cả mục Spam.
                </p>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs text-[#777777]">Email</label>
                        <input
                            type="email"
                            className={inputClass}
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {error && (
                        <div className="border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#171717] py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#202020] disabled:opacity-50"
                    >
                        {submitting ? "Đang gửi..." : "Gửi liên kết"}
                    </button>
                </form>
            )}
            <p className="mt-6 text-center text-xs text-[#777777]">
                <Link to="/login" className="font-medium text-[#171717] underline underline-offset-4">
                    Quay lại đăng nhập
                </Link>
            </p>
        </AuthCard>
    );
}