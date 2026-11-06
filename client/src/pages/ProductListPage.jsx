import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";

export default function ProductListPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [input, setInput] = useState("");
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");
        const url = keyword
            ? `/api/products?search=${encodeURIComponent(keyword)}`
            : "/api/products";

        apiGet(url)
            .then((body) => setProducts(body.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [keyword]);

    function handleSubmit(e) {
        e.preventDefault();
        setKeyword(input.trim());
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="w-full max-w-sm rounded border px-3 py-2"
                />
                <button className="rounded bg-black px-4 py-2 text-white">Tìm</button>
            </form>

            {loading && <p>Đang tải sản phẩm...</p>}
            {error && <p className="text-red-600">Lỗi: {error}</p>}
            {!loading && !error && products.length === 0 && (
                <p>Không tìm thấy sản phẩm nào.</p>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                    <Link
                        key={p._id}
                        to={`/products/${p._id}`}
                        className="rounded-lg border bg-white p-4 hover:shadow"
                    >
                        <div className="mb-3 flex h-40 items-center justify-center rounded bg-gray-100 text-gray-400">
                            Chưa có ảnh
                        </div>
                        <p className="text-sm text-gray-500">{p.category?.name}</p>
                        <p className="font-medium">{p.name}</p>
                        <p className="font-semibold">{p.price.toLocaleString("vi-VN")}đ</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}