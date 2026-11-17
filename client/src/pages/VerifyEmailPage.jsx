import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, getToken } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import AuthCard from "../components/AuthCard.jsx";

export default function VerifyEmailPage() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState(token ? "loading" : "error");
    const [message, setMessage] = useState(token ? "" : "Liên kết không hợp lệ");
    const called = useRef(false);

    useEffect(() => {
        // Mã chỉ dùng được một lần; React StrictMode chạy effect hai lần ở máy dev
        // nên phải chặn lần gọi thứ hai, nếu không lần hai sẽ báo "hết hạn" đè lên.
        if (!token || called.current) return;
        called.current = true;

        api("/api/auth/verify-email", { method: "POST", body: { token } })
            .then(() => {
                setStatus("ok");
                if (getToken()) refreshUser().catch(() => { });
            })
            .catch((err) => {
                setStatus("error");
                setMessage(err.message);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <AuthCard eyebrow="Email" title="Xác minh email">
            {status === "loading" && <p className="text-sm text-[#777777]">Đang xác minh...</p>}
            {status === "ok" && (
                <div className="space-y-4">
                    <p className="text-sm text-[#171717]">Email của bạn đã được xác minh. Giờ bạn có thể đặt hàng.</p>
                    <Link to="/" className="inline-block bg-[#171717] px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white">
                        Về trang chủ
                    </Link>
                </div>
            )}
            {status === "error" && (
                <div className="space-y-4">
                    <p className="border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">{message}</p>
                    <p className="text-xs text-[#777777]">
                        Đăng nhập rồi bấm "Gửi lại email" ở thanh thông báo để nhận liên kết mới.
                    </p>
                    <Link to="/login" className="text-xs font-medium text-[#171717] underline underline-offset-4">
                        Đăng nhập
                    </Link>
                </div>
            )}
        </AuthCard>
    );
}