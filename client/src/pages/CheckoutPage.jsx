import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        note: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    async function submit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const { note, ...shippingAddress } = form;
            await api("/api/orders", {
                method: "POST",
                body: { shippingAddress, note },
            });
            navigate("/orders");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={submit} className="mx-auto max-w-md space-y-3">
            <h1 className="text-2xl font-bold">Thông tin giao hàng</h1>
            <input className="w-full rounded border px-3 py-2" placeholder="Họ tên" value={form.fullName} onChange={set("fullName")} />
            <input className="w-full rounded border px-3 py-2" placeholder="Số điện thoại (10 số, bắt đầu bằng 0)" value={form.phone} onChange={set("phone")} />
            <input className="w-full rounded border px-3 py-2" placeholder="Địa chỉ" value={form.street} onChange={set("street")} />
            <input className="w-full rounded border px-3 py-2" placeholder="Tỉnh / Thành phố" value={form.city} onChange={set("city")} />
            <textarea className="w-full rounded border px-3 py-2" placeholder="Ghi chú (không bắt buộc)" value={form.note} onChange={set("note")} />

            <p className="text-sm text-gray-600">Thanh toán khi nhận hàng (COD).</p>
            {error && <p className="text-red-600">{error}</p>}

            <button disabled={submitting} className="w-full rounded bg-black py-2 text-white disabled:opacity-50">
                {submitting ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
            </button>
        </form>
    );
}