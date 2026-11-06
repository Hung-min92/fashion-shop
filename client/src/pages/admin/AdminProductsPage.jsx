import { useEffect, useState } from "react";
import { api } from "../../api.js";

const EMPTY = {
    name: "",
    description: "",
    price: "",
    category: "",
    sku: "",
    size: "",
    color: "",
    stock: "",
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function load() {
        const [p, c] = await Promise.all([
            api("/api/products?limit=50"),
            api("/api/categories"),
        ]);
        setProducts(p.data);
        setCategories(c.data);
    }

    useEffect(() => {
        load().catch((err) => setError(err.message));
    }, []);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    async function create(e) {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            await api("/api/products", {
                method: "POST",
                body: {
                    name: form.name,
                    description: form.description,
                    price: Number(form.price),
                    category: form.category,
                    variants: [
                        {
                            sku: form.sku,
                            size: form.size,
                            color: form.color,
                            stock: Number(form.stock),
                        },
                    ],
                },
            });
            setForm(EMPTY);
            setMessage("Đã tạo sản phẩm");
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    async function hide(id) {
        if (!window.confirm("Ẩn sản phẩm này khỏi cửa hàng?")) return;
        setError("");
        try {
            await api(`/api/products/${id}`, { method: "DELETE" });
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    const input = "w-full rounded border px-3 py-2";

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Quản lý sản phẩm</h1>

            <form onSubmit={create} className="mb-8 grid gap-2 rounded border bg-white p-4 md:grid-cols-2">
                <input className={input} placeholder="Tên sản phẩm" value={form.name} onChange={set("name")} />
                <input className={input} placeholder="Giá (đồng)" value={form.price} onChange={set("price")} />
                <select className={input} value={form.category} onChange={set("category")}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                <input className={input} placeholder="Mô tả" value={form.description} onChange={set("description")} />
                <input className={input} placeholder="SKU (vd: AO-M-DEN)" value={form.sku} onChange={set("sku")} />
                <input className={input} placeholder="Size" value={form.size} onChange={set("size")} />
                <input className={input} placeholder="Màu" value={form.color} onChange={set("color")} />
                <input className={input} placeholder="Tồn kho" value={form.stock} onChange={set("stock")} />
                <button className="rounded bg-black py-2 text-white md:col-span-2">Tạo sản phẩm</button>
            </form>

            {error && <p className="mb-2 text-red-600">{error}</p>}
            {message && <p className="mb-2 text-green-700">{message}</p>}

            <div className="space-y-2">
                {products.map((p) => (
                    <div key={p._id} className="flex items-center justify-between rounded border bg-white p-3">
                        <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-gray-500">
                                {p.category?.name} - {p.price.toLocaleString("vi-VN")}đ - {p.variants.length} biến thể
                            </p>
                        </div>
                        <button onClick={() => hide(p._id)} className="text-sm text-red-600">Ẩn</button>
                    </div>
                ))}
            </div>
        </div>
    );
}