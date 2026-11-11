import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../api.js";
import AdminNav from "../../components/admin/AdminNav.jsx";

const RANGES = [7, 30, 90];

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const money = (n) => `${n.toLocaleString("vi-VN")}đ`;

const shortMoney = (n) => {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}tr`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
};

const shortDate = (d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`border border-[#EAEAEA] p-5 ${
        highlight ? "bg-[#F5F4F0]" : "bg-white"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#777777]">
        {label}
      </p>
      <p className="mt-2.5 font-serif text-2xl text-[#171717]">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loadedDays, setLoadedDays] = useState(null);
  const [error, setError] = useState("");
  const loading = !error && loadedDays !== days;

  useEffect(() => {
    let ignore = false;

    api(`/api/admin/stats?days=${days}`)
      .then((body) => {
        if (!ignore) {
          setStats(body.data);
          setError("");
          setLoadedDays(days);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setLoadedDays(days);
        }
      });

    return () => {
      ignore = true;
    };
  }, [days]);

  return (
    <div className="animate-fade-in">
      <AdminNav
        title="Thống kê tổng quan"
        subtitle="Theo dõi doanh thu, tình trạng đơn hàng, sản phẩm bán chạy và cảnh báo tồn kho."
      />

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          Lỗi: {error}
        </div>
      )}

      {!stats && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse bg-[#F5F4F0]" />
            ))}
          </div>
          <div className="h-72 animate-pulse bg-[#F5F4F0]" />
        </div>
      )}

      {stats && (
        <div className={loading ? "opacity-60 transition" : "transition"}>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.16em] text-[#777777]">
              Khoảng thời gian
            </p>
            <div className="flex gap-2">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDays(r)}
                  className={`border px-3.5 py-1.5 text-xs uppercase tracking-[0.12em] transition ${
                    days === r
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                  }`}
                >
                  {r} ngày
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Doanh thu" value={money(stats.summary.revenue)} highlight />
            <StatCard label="Đơn hoàn thành" value={stats.summary.completedOrders} />
            <StatCard label="Giá trị TB / đơn" value={money(stats.summary.avgOrderValue)} />
            <StatCard label="Khách hàng" value={stats.summary.totalCustomers} />
            <StatCard label="Sản phẩm" value={stats.summary.totalProducts} />
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="border border-[#EAEAEA] bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#777777]">
                  {label}
                </p>
                <p className="mt-1.5 text-xl font-medium text-[#171717]">
                  {stats.summary.statusCounts[key]}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-6 border border-[#EAEAEA] bg-white p-6">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
              Biểu đồ doanh thu theo ngày
            </h2>
            {stats.summary.revenue === 0 && (
              <p className="mb-3 text-xs text-[#777777]">
                Chưa có đơn hoàn thành trong {days} ngày qua.
              </p>
            )}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueByDay}>
                  <CartesianGrid stroke="#EAEAEA" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDate}
                    interval="preserveStartEnd"
                    minTickGap={24}
                    tick={{ fontSize: 11, fill: "#777777" }}
                    axisLine={{ stroke: "#EAEAEA" }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={shortMoney}
                    width={48}
                    tick={{ fontSize: 11, fill: "#777777" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#F5F4F0" }}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#EAEAEA",
                      fontSize: "12px",
                    }}
                    labelFormatter={shortDate}
                    formatter={(value) => [money(value), "Doanh thu"]}
                  />
                  <Bar dataKey="revenue" fill="#171717" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-[#EAEAEA] bg-white p-6">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
                Sản phẩm bán chạy
              </h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-xs text-[#777777]">Chưa có dữ liệu.</p>
              ) : (
                <ol className="divide-y divide-[#EAEAEA]">
                  {stats.topProducts.map((p, i) => (
                    <li key={p.productId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <span className="w-6 font-serif text-lg text-[#B9A58A]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#171717]">{p.name}</p>
                        <p className="mt-0.5 text-xs text-[#777777]">
                          {p.quantity} đã bán · {money(p.revenue)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="border border-[#EAEAEA] bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
                  Cảnh báo tồn kho thấp
                </h2>
                <Link
                  to="/admin/products"
                  className="text-xs text-[#171717] underline underline-offset-4 hover:text-[#B9A58A]"
                >
                  Quản lý kho
                </Link>
              </div>
              {stats.lowStock.length === 0 ? (
                <p className="text-xs text-[#777777]">Tồn kho đều ổn định.</p>
              ) : (
                <ul className="divide-y divide-[#EAEAEA]">
                  {stats.lowStock.map((v) => (
                    <li
                      key={v.sku}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#171717]">{v.name}</p>
                        <p className="mt-0.5 text-xs text-[#777777]">
                          {v.sku} · {v.size} / {v.color}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 border px-2.5 py-1 text-[11px] uppercase tracking-wider ${
                          v.stock === 0
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-[#B9A58A] bg-[#F5F4F0] text-[#171717]"
                        }`}
                      >
                        {v.stock === 0 ? "Hết hàng" : `Còn ${v.stock}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
