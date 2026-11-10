import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";

const STATUS_LABEL = {
    pending: "Chờ xử lý",
    shipping: "Đang giao",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
};

// Trạng thái hiện tại -> các nút chuyển được hiển thị (giống ALLOWED_TRANSITIONS ở backend)
const NEXT = {
    pending: ["shipping", "cancelled"],
    shipping: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const readOnly = user?.role === "viewer";
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");

    async function load() {
        setError("");
        const query = new URLSearchParams({ page, limit: 10 });
        if (status) query.set("status", status);
        try {
            setData(await api(`/api/admin/orders?${query}`));
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        load();
    }, [status, page]);

    async function changeStatus(id, newStatus) {
        setError("");
        try {
            await api(`/api/admin/orders/${id}/status`, {
                method: "PATCH",
                body: { status: newStatus },
            });
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Quản lý đơn hàng</h1>
            {readOnly && (
                <p className="mb-4 border-2 border-black bg-[#c6ff00] p-2 text-sm font-bold">
                    Chế độ chỉ xem (tài khoản demo). Thông tin khách hàng đã được che.
                </p>
            )}
            <select
                value={status}
                onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                }}
                className="mb-4 rounded border px-3 py-2"
            >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>

            {error && <p className="mb-2 text-red-600">{error}</p>}
            {!data && !error && <p>Đang tải...</p>}
            {data && data.data.length === 0 && <p>Không có đơn hàng.</p>}

            <div className="space-y-3">
                {data?.data.map((o) => (
                    <div key={o._id} className="rounded border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">
                                {o.user?.name} ({o.user?.email})
                            </p>
                            <span className="rounded bg-gray-100 px-2 py-1 text-sm">
                                {STATUS_LABEL[o.status]}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {new Date(o.createdAt).toLocaleString("vi-VN")} - {o.shippingAddress.fullName}, {o.shippingAddress.phone}, {o.shippingAddress.street}, {o.shippingAddress.city}
                        </p>

                        {o.items.map((i) => (
                            <p key={i._id} className="text-sm">
                                {i.name} ({i.size}, {i.color}) x {i.quantity}
                            </p>
                        ))}

                        <div className="mt-2 flex items-center justify-between">
                            <p className="font-semibold">{o.totalPrice.toLocaleString("vi-VN")}đ</p>
                            {!readOnly && (
                                <div className="flex gap-2">
                                    {NEXT[o.status].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => changeStatus(o._id, s)}
                                            className="rounded border px-3 py-1 text-sm"
                                        >
                                            {STATUS_LABEL[s]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {data && (
                <div className="mt-4 flex items-center gap-3">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button>
                    <span>Trang {data.page} / {data.totalPages || 1}</span>
                    <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button>
                </div>
            )}
        </div>
    );
}