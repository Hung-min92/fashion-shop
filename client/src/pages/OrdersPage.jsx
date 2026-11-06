import { useEffect, useState } from "react";
import { api } from "../api.js";

const STATUS_LABEL = {
    pending: "Chờ xử lý",
    shipping: "Đang giao",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
};

export default function OrdersPage() {
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState("");

    async function load() {
        try {
            const body = await api("/api/orders/my");
            setOrders(body.data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function cancel(id) {
        if (!window.confirm("Bạn chắc chắn muốn hủy đơn này?")) return;
        setError("");
        try {
            await api(`/api/orders/${id}/cancel`, { method: "PATCH" });
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    if (!orders && !error) return <p>Đang tải đơn hàng...</p>;
    if (!orders) return <p className="text-red-600">Lỗi: {error}</p>;
    if (orders.length === 0) return <p>Bạn chưa có đơn hàng nào.</p>;

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Đơn hàng của tôi</h1>
            {error && <p className="mb-2 text-red-600">{error}</p>}

            <div className="space-y-4">
                {orders.map((o) => (
                    <div key={o._id} className="rounded border bg-white p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {new Date(o.createdAt).toLocaleString("vi-VN")}
                            </p>
                            <span className="rounded bg-gray-100 px-2 py-1 text-sm">
                                {STATUS_LABEL[o.status]}
                            </span>
                        </div>

                        {o.items.map((i) => (
                            <p key={i._id} className="text-sm">
                                {i.name} ({i.size}, {i.color}) x {i.quantity} - {i.price.toLocaleString("vi-VN")}đ
                            </p>
                        ))}

                        <div className="mt-2 flex items-center justify-between">
                            <p className="font-semibold">Tổng: {o.totalPrice.toLocaleString("vi-VN")}đ</p>
                            {o.status === "pending" && (
                                <button onClick={() => cancel(o._id)} className="text-sm text-red-600">
                                    Hủy đơn
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}