import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

const SORTS = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá tăng dần" },
    { value: "price_desc", label: "Giá giảm dần" },
];

const field =
    "border-2 border-black bg-white px-3 py-2 text-sm font-medium outline-none focus:bg-[#c6ff00]/20";

export default function ProductListPage() {
    const [params, setParams] = useSearchParams();

    const search = params.get("search") || "";
    const category = params.get("category") || "";
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    const sort = params.get("sort") || "newest";
    const page = Number(params.get("page")) || 1;

    const [searchInput, setSearchInput] = useState(search);
    const [minInput, setMinInput] = useState(minPrice);
    const [maxInput, setMaxInput] = useState(maxPrice);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const query = params.toString();

    useEffect(() => {
        apiGet("/api/categories")
            .then((body) => setCategories(body.data))
            .catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        setError("");
        apiGet(`/api/products?${query}`)
            .then((body) => {
                setProducts(body.data);
                setTotalPages(body.totalPages);
                setTotalItems(body.totalItems);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [query]);

    function update(changes) {
        const next = new URLSearchParams(params);
        for (const [key, value] of Object.entries(changes)) {
            if (value === "" || value == null) next.delete(key);
            else next.set(key, value);
        }
        if (!("page" in changes)) next.delete("page");
        setParams(next);
    }

    function applyFilters(e) {
        e.preventDefault();
        update({
            search: searchInput.trim(),
            minPrice: minInput,
            maxPrice: maxInput,
        });
    }

    function resetAll() {
        setSearchInput("");
        setMinInput("");
        setMaxInput("");
        setParams({});
    }

    return (
        <div>
            <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-3">
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className={`${field} w-full sm:w-64`}
                />
                <select
                    value={category}
                    onChange={(e) => update({ category: e.target.value })}
                    className={field}
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <input
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    placeholder="Giá từ"
                    inputMode="numeric"
                    className={`${field} w-28`}
                />
                <input
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    placeholder="Giá đến"
                    inputMode="numeric"
                    className={`${field} w-28`}
                />
                <select
                    value={sort}
                    onChange={(e) => update({ sort: e.target.value })}
                    className={field}
                >
                    {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <button className="border-2 border-black bg-black px-4 py-2 text-sm font-black uppercase text-white hover:bg-[#c6ff00] hover:text-black">
                    Lọc
                </button>
                <button
                    type="button"
                    onClick={resetAll}
                    className="px-2 py-2 text-sm underline"
                >
                    Xóa lọc
                </button>
            </form>

            {!loading && !error && (
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                    {totalItems} sản phẩm
                </p>
            )}

            {loading && <p>Đang tải sản phẩm...</p>}
            {error && <p className="text-red-600">Lỗi: {error}</p>}
            {!loading && !error && products.length === 0 && (
                <p>Không tìm thấy sản phẩm nào.</p>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        disabled={page <= 1}
                        onClick={() => update({ page: page - 1 })}
                        className="border-2 border-black px-4 py-2 text-sm font-black uppercase disabled:opacity-30"
                    >
                        Trước
                    </button>
                    <span className="text-sm font-bold">
                        {page} / {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => update({ page: page + 1 })}
                        className="border-2 border-black px-4 py-2 text-sm font-black uppercase disabled:opacity-30"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
}