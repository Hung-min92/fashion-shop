import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../ToastContext.jsx";

const STATUS_META = {
    pending: { label: "Chờ xử lý", style: "bg-[#F5F4F0] text-[#202020] border-[#EAEAEA]" },
    shipping: { label: "Đang giao", style: "bg-[#B9A58A]/20 text-[#171717] border-[#B9A58A]" },
    completed: { label: "Hoàn tất", style: "bg-[#171717] text-white border-[#171717]" },
    cancelled: { label: "Đã hủy", style: "bg-white text-[#777777] border-[#EAEAEA] line-through" },
};

const inputClass =
    "w-full border border-[#EAEAEA] bg-white px-4 py-3 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]";

export default function OrderLookupPage() {
    const [params] = useSearchParams();
    const { showToast } = useToast();
    const [code, setCode] = useState(params.get("code") || "");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    async function lookup(e) {
        e.preventDefault();
        setError("");
        setOrder(null);
        if (!code.trim() || !phone.trim()) {
            setError("Vui lòng nhập mã đơn và số điện thoại");
            return;
        }
        setLoading(true);
        try {
            const body = await api("/api/orders/lookup", {
                method: "POST",
                body: { code: code.trim(), phone: phone.trim() },
            });
            setOrder(body.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function cancel() {
        if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
        setCancelling(true);
        setError("");
        try {
            const body = await api("/api/orders/guest-cancel", {
                method: "POST",
                body: { code: order.orderCode, phone: phone.trim() },
            });
            setOrder(body.data);
            showToast("Đã hủy đơn hàng");
        } catch (err) {
            setError(err.message);
        } finally {
            setCancelling(false);
        }
    }

    const meta = order ? STATUS_META[order.status] || STATUS_META.pending : null;

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            <div className="mb-8 border-b border-[#EAEAEA] pb-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Order Tracking</p>
                <h1 className="mt-1 font-serif text-3xl font-normal text-[#171717]">Tra cứu đơn hàng</h1>
                <p className="mt-2 text-xs leading-relaxed text-[#777777]">
                    Dành cho đơn đặt không cần tài khoản. Nhập mã đơn và số điện thoại đã dùng khi đặt hàng.
                    Nếu bạn có tài khoản, hãy xem trong{" "}
                    <Link to="/orders" className="underline underline-offset-4">
                        Đơn hàng của tôi
                    </Link>
                    .
                </p>
            </div>

            <form onSubmit={lookup} className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-xs text-[#777777]">Mã đơn hàng</label>
                    <input
                        className={`${inputClass} font-mono uppercase`}
                        placeholder="FS-XXXXXXXX"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs text-[#777777]">Số điện thoại</label>
                    <input
                        className={inputClass}
                        placeholder="09xxxxxxxx"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="sm:col-span-2 bg-[#171717] py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#202020] disabled:opacity-50"
                >
                    {loading ? "Đang tra cứu..." : "Tra cứu"}
                </button>
            </form>

            {error && (
                <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {error}
                </div>
            )}

            {order && (
                <div className="mt-8 border border-[#EAEAEA] bg-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] pb-4">
                        <div>
                            <p className="font-mono text-sm font-medium tracking-widest text-[#171717]">
                                {order.orderCode}
                            </p>
                            <p className="mt-0.5 text-xs text-[#777777]">
                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                            </p>
                        </div>
                        <span className={`border px-3 py-1 text-[11px] uppercase tracking-[0.12em] ${meta.style}`}>
                            {meta.label}
                        </span>
                    </div>

                    <ul className="divide-y divide-[#EAEAEA] py-2">
                        {order.items.map((i) => (
                            <li key={i._id} className="flex items-center justify-between gap-4 py-3 text-sm">
                                <div>
                                    <p className="font-medium text-[#171717]">{i.name}</p>
                                    <p className="mt-0.5 text-xs text-[#777777]">
                                        Size: {i.size} · Màu: {i.color} · SL: {i.quantity}
                                    </p>
                                </div>
                                <p className="shrink-0 text-sm text-[#171717]">
                                    {(i.price * i.quantity).toLocaleString("vi-VN")}đ
                                </p>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-2 bg-[#F5F4F0] p-3.5 text-xs text-[#777777]">
                        <span className="font-medium text-[#202020]">Giao đến: </span>
                        {order.shippingAddress.fullName} ({order.shippingAddress.phone}) —{" "}
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                        {order.note && <p className="mt-1">Ghi chú: {order.note}</p>}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAEAEA] pt-4">
                        <div>
                            <span className="text-xs uppercase tracking-[0.12em] text-[#777777]">Tổng cộng: </span>
                            <span className="text-base font-medium text-[#171717]">
                                {order.totalPrice.toLocaleString("vi-VN")}đ
                            </span>
                            <p className="mt-0.5 text-[11px] text-[#777777]">Thanh toán khi nhận hàng (COD)</p>
                        </div>
                        {order.status === "pending" && (
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={cancel}
                                className="border border-red-200 px-4 py-2 text-xs uppercase tracking-[0.12em] text-red-600 transition hover:border-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                                {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}