import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useToast } from "../ToastContext.jsx";

export default function EmailVerifyBanner() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);

    // Chỉ hiện khi chắc chắn chưa xác minh
    if (!user || user.role !== "customer" || user.emailVerified !== false) return null;

    async function resend() {
        setSending(true);
        try {
            await api("/api/auth/resend-verification", { method: "POST" });
            showToast("Đã gửi email xác minh, hãy kiểm tra hộp thư");
        } catch (err) {
            showToast(err.message);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="border-b border-[#EAEAEA] bg-[#FFF8E1] px-4 py-2 text-center text-xs text-[#171717]">
            Email của bạn chưa được xác minh nên chưa thể đặt hàng.{" "}
            <button onClick={resend} disabled={sending} className="font-medium underline underline-offset-4 disabled:opacity-50">
                {sending ? "Đang gửi..." : "Gửi lại email"}
            </button>
        </div>
    );
}