import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";
import AdminNav from "../../components/admin/AdminNav.jsx";
import { useToast } from "../../ToastContext.jsx";

const STATUS_META = {
  pending: { label: "Chờ xử lý", style: "bg-[#F5F4F0] text-[#202020] border-[#EAEAEA]" },
  shipping: { label: "Đang giao", style: "bg-[#B9A58A]/20 text-[#171717] border-[#B9A58A]" },
  completed: { label: "Hoàn tất", style: "bg-[#171717] text-white border-[#171717]" },
  cancelled: { label: "Đã hủy", style: "bg-white text-[#777777] border-[#EAEAEA]" },
};

const NEXT = {
  pending: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const readOnly = user?.role === "viewer";

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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
    let ignore = false;
    const query = new URLSearchParams({ page, limit: 10 });
    if (status) query.set("status", status);
    api(`/api/admin/orders?${query}`)
      .then((body) => {
        if (!ignore) {
          setData(body);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [status, page]);

  async function changeStatus(id, newStatus) {
    setError("");
    setUpdatingId(id);
    try {
      await api(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      showToast(`Đã cập nhật trạng thái: ${STATUS_META[newStatus].label}`);
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, { type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <AdminNav
        title="Quản lý đơn hàng"
        subtitle="Theo dõi, lọc trạng thái và cập nhật tiến trình xử lý đơn hàng."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setPage(1);
            }}
            className={`border px-3.5 py-2 text-xs uppercase tracking-[0.12em] transition ${
              status === ""
                ? "border-[#171717] bg-[#171717] text-white"
                : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
            }`}
          >
            Tất cả
          </button>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className={`border px-3.5 py-2 text-xs uppercase tracking-[0.12em] transition ${
                status === value
                  ? "border-[#171717] bg-[#171717] text-white"
                  : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>

        {data && (
          <p className="text-xs text-[#777777]">{data.totalItems} đơn hàng</p>
        )}
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {!data && !error && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse bg-[#F5F4F0]" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="border border-[#EAEAEA] bg-[#F5F4F0]/50 py-14 text-center text-sm text-[#777777]">
          Không có đơn hàng nào ở trạng thái này.
        </div>
      )}

      <div className="space-y-4">
        {data?.data.map((o) => {
          const meta = STATUS_META[o.status] || STATUS_META.pending;
          return (
            <div key={o._id} className="border border-[#EAEAEA] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAEAEA] pb-4">
                <div>
                  <p className="text-sm font-medium text-[#171717]">
                    {o.user?.name} <span className="text-[#777777]">({o.user?.email})</span>
                  </p>
                  <p className="mt-1 text-xs text-[#777777]">
                    #{o._id.slice(-8).toUpperCase()} ·{" "}
                    {new Date(o.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                <span className={`border px-3 py-1 text-[11px] uppercase tracking-[0.12em] ${meta.style}`}>
                  {meta.label}
                </span>
              </div>

              <div className="mt-3 bg-[#F5F4F0] px-4 py-2.5 text-xs text-[#777777]">
                <span className="font-medium text-[#202020]">Giao nhận: </span>
                {o.shippingAddress.fullName}, {o.shippingAddress.phone},{" "}
                {o.shippingAddress.street}, {o.shippingAddress.city}
                {o.note && <span className="block mt-1">Ghi chú: {o.note}</span>}
              </div>

              <ul className="divide-y divide-[#EAEAEA] py-2">
                {o.items.map((i) => (
                  <li key={i._id} className="flex justify-between py-2.5 text-sm">
                    <span className="text-[#202020]">
                      {i.name}{" "}
                      <span className="text-xs text-[#777777]">
                        ({i.size}, {i.color}) × {i.quantity}
                      </span>
                    </span>
                    <span className="text-[#171717]">
                      {(i.price * i.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAEAEA] pt-4">
                <p className="text-base font-medium text-[#171717]">
                  Tổng: {o.totalPrice.toLocaleString("vi-VN")}đ
                </p>

                {!readOnly && NEXT[o.status].length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {NEXT[o.status].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={updatingId === o._id}
                        onClick={() => changeStatus(o._id, s)}
                        className={`border px-4 py-2 text-xs uppercase tracking-[0.12em] transition disabled:opacity-50 ${
                          s === "cancelled"
                            ? "border-red-200 text-red-600 hover:border-red-600 hover:bg-red-50"
                            : "border-[#171717] bg-[#171717] text-white hover:bg-[#202020]"
                        }`}
                      >
                        Chuyển: {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="border border-[#EAEAEA] px-4 py-2 text-xs uppercase tracking-[0.12em] transition hover:border-[#171717] disabled:opacity-35"
          >
            Trước
          </button>
          <span className="text-xs text-[#777777]">
            Trang {data.page} / {data.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
            className="border border-[#EAEAEA] px-4 py-2 text-xs uppercase tracking-[0.12em] transition hover:border-[#171717] disabled:opacity-35"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
