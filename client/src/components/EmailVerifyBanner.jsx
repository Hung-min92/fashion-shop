import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useToast } from "../ToastContext.jsx";

export default function EmailVerifyBanner() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Chỉ hiện khi chắc chắn chưa xác minh
    if (dismissed || !user || user.role !== "customer" || user.emailVerified !== false) {
        return null;
    }

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
        <div className="flex items-center justify-center gap-3 border-b border-[#EAEAEA] bg-[#FFF8E1] px-4 py-2 text-xs text-[#171717]">
            <span>
                Xác minh email để nhận ưu đãi và thông báo đơn hàng.{" "}
                <button
                    onClick={resend}
                    disabled={sending}
                    className="font-medium underline underline-offset-4 disabled:opacity-50"
                >
                    {sending ? "Đang gửi..." : "Gửi email xác minh"}
                </button>
            </span>
            <button onClick={() => setDismissed(true)} aria-label="Đóng" className="text-[#777777]">
                ✕
            </button>
        </div>
    );
}