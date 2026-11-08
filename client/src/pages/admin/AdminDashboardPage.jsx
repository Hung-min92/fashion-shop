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

// "2026-11-08" -> "08/11"
const shortDate = (d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

function StatCard({ label, value, accent }) {
    return (
        <div className="border-2 border-black bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {label}
            </p>
            <p
                className={`mt-2 inline-block px-1 text-2xl font-black ${accent ? "bg-[#c6ff00]" : ""
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

export default function AdminDashboardPage() {
    const [days, setDays] = useState(30);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError("");

        api(`/api/admin/stats?days=${days}`)
            .then((body) => {
                if (!ignore) setStats(body.data);
            })
            .catch((err) => {
                if (!ignore) setError(err.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [days]);

    if (error) return <p className="text-red-600">Lỗi: {error}</p>;
    if (!stats) return <p>Đang tải thống kê...</p>;

    const { summary, revenueByDay, topProducts, lowStock } = stats;

    return (
        <div className={loading ? "opacity-60 transition" : "transition"}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-black uppercase">Thống kê</h1>
                <div className="flex gap-2">
                    {RANGES.map((r) => (
                        <button
                            key={r}
                            onClick={() => setDays(r)}
                            className={`border-2 border-black px-3 py-1 text-sm font-black uppercase ${days === r ? "bg-black text-white" : "bg-white"
                                }`}
                        >
                            {r} ngày
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
                <StatCard label="Doanh thu" value={money(summary.revenue)} accent />
                <StatCard label="Đơn hoàn thành" value={summary.completedOrders} />
                <StatCard label="Giá trị TB / đơn" value={money(summary.avgOrderValue)} />
                <StatCard label="Khách hàng" value={summary.totalCustomers} />
                <StatCard label="Sản phẩm" value={summary.totalProducts} />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <div key={key} className="border-2 border-black bg-white p-3">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                            {label}
                        </p>
                        <p className="text-xl font-black">{summary.statusCounts[key]}</p>
                    </div>
                ))}
            </div>

            <div className="mb-6 border-2 border-black bg-white p-4">
                <h2 className="mb-3 text-sm font-black uppercase tracking-widest">
                    Doanh thu theo ngày
                </h2>
                {summary.revenue === 0 && (
                    <p className="mb-2 text-sm text-gray-500">
                        Chưa có đơn hoàn thành trong {days} ngày qua.
                    </p>
                )}
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueByDay}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={shortDate}
                                interval="preserveStartEnd"
                                minTickGap={24}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis tickFormatter={shortMoney} width={48} tick={{ fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: "#c6ff0055" }}
                                labelFormatter={shortDate}
                                formatter={(value) => [money(value), "Doanh thu"]}
                            />
                            <Bar dataKey="revenue" fill="#000" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="border-2 border-black bg-white p-4">
                    <h2 className="mb-3 text-sm font-black uppercase tracking-widest">
                        Bán chạy nhất
                    </h2>
                    {topProducts.length === 0 ? (
                        <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
                    ) : (
                        <ol className="space-y-2">
                            {topProducts.map((p, i) => (
                                <li key={p.productId} className="flex items-center gap-3">
                                    <span className="w-6 text-lg font-black">{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="font-bold uppercase leading-tight">{p.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {p.quantity} đã bán - {money(p.revenue)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="border-2 border-black bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest">
                            Sắp hết hàng
                        </h2>
                        <Link to="/admin/products" className="text-sm underline">
                            Quản lý kho
                        </Link>
                    </div>
                    {lowStock.length === 0 ? (
                        <p className="text-sm text-gray-500">Tồn kho đều ổn.</p>
                    ) : (
                        <ul className="space-y-2">
                            {lowStock.map((v) => (
                                <li key={v.sku} className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold uppercase leading-tight">{v.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {v.sku} - {v.size} / {v.color}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 text-sm font-black ${v.stock === 0 ? "bg-red-600 text-white" : "bg-[#c6ff00]"
                                            }`}
                                    >
                                        {v.stock === 0 ? "HẾT" : `Còn ${v.stock}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}