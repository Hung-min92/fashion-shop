import { useEffect, useState } from "react";
import { apiGet } from "../api.js";

export default function ProductListPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [input, setInput] = useState(""); // chữ đang gõ trong ô
    const [keyword, setKeyword] = useState(""); // từ khóa đã bấm tìm

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
            <h1>Sản phẩm</h1>

            <form onSubmit={handleSubmit}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                />
                <button type="submit">Tìm</button>
            </form>

            {loading && <p>Đang tải sản phẩm...</p>}
            {error && <p>Lỗi: {error}</p>}
            {!loading && !error && products.length === 0 && (
                <p>Không tìm thấy sản phẩm nào.</p>
            )}

            <ul>
                {products.map((p) => (
                    <li key={p._id}>
                        {p.name} ({p.category?.name}) - {p.price.toLocaleString("vi-VN")}đ
                    </li>
                ))}
            </ul>
        </div>
    );
}