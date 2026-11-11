import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../ToastContext.jsx";

const STATUS_META = {
  pending: { label: "Chờ xử lý", style: "bg-[#F5F4F0] text-[#202020] border-[#EAEAEA]" },
  shipping: { label: "Đang giao", style: "bg-[#B9A58A]/20 text-[#171717] border-[#B9A58A]" },
  completed: { label: "Hoàn tất", style: "bg-[#171717] text-white border-[#171717]" },
  cancelled: { label: "Đã hủy", style: "bg-white text-[#777777] border-[#EAEAEA] line-through" },
};

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function load() {
    try {
      const body = await api("/api/orders/my");
      setOrders(body.data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    let ignore = false;
    api("/api/orders/my")
      .then((body) => {
        if (!ignore) setOrders(body.data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function cancel(id) {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    setError("");
    setCancellingId(id);
    try {
      await api(`/api/orders/${id}/cancel`, { method: "PATCH" });
      showToast("Đã hủy đơn hàng");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, { type: "error" });
    } finally {
      setCancellingId(null);
    }
  }

  if (!orders && !error) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-8 w-52 animate-pulse bg-[#F5F4F0]" />
        <div className="h-40 animate-pulse bg-[#F5F4F0]" />
        <div className="h-40 animate-pulse bg-[#F5F4F0]" />
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="border border-red-200 bg-white p-6 text-sm text-red-700">
        Lỗi: {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center animate-fade-in">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Order History</p>
        <h1 className="mt-2 font-serif text-3xl text-[#171717]">Chưa có đơn hàng</h1>
        <p className="mt-3 text-sm text-[#777777]">
          Bạn chưa thực hiện đơn hàng nào. Hãy khám phá các bộ sưu tập hiện có.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-block bg-[#171717] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <div className="mb-8 border-b border-[#EAEAEA] pb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Order History</p>
        <h1 className="mt-1 font-serif text-3xl font-normal text-[#171717]">
          Đơn hàng của tôi ({orders.length})
        </h1>
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {orders.map((o) => {
          const meta = STATUS_META[o.status] || STATUS_META.pending;
          return (
            <div key={o._id} className="border border-[#EAEAEA] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#171717]">
                    Đơn #{o._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-[#777777]">
                    {new Date(o.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#777777]">
                    {o.paymentStatus === "paid" ? "Đã thanh toán" : "COD · Chưa thanh toán"}
                  </span>
                  <span className={`border px-3 py-1 text-[11px] uppercase tracking-[0.12em] ${meta.style}`}>
                    {meta.label}
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-[#EAEAEA] py-2">
                {o.items.map((i) => (
                  <li key={i._id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div>
                      <Link
                        to={`/products/${i.product}`}
                        className="font-medium text-[#171717] hover:underline"
                      >
                        {i.name}
                      </Link>
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

              {o.shippingAddress && (
                <div className="mt-2 bg-[#F5F4F0] p-3.5 text-xs text-[#777777]">
                  <span className="font-medium text-[#202020]">Giao đến: </span>
                  {o.shippingAddress.fullName} ({o.shippingAddress.phone}) —{" "}
                  {o.shippingAddress.street}, {o.shippingAddress.city}
                  {o.note && <p className="mt-1">Ghi chú: {o.note}</p>}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAEAEA] pt-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.12em] text-[#777777]">
                    Tổng cộng:{" "}
                  </span>
                  <span className="text-base font-medium text-[#171717]">
                    {o.totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {o.status === "pending" && (
                  <button
                    type="button"
                    disabled={cancellingId === o._id}
                    onClick={() => cancel(o._id)}
                    className="border border-red-200 px-4 py-2 text-xs uppercase tracking-[0.12em] text-red-600 transition hover:border-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === o._id ? "Đang hủy..." : "Hủy đơn hàng"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
