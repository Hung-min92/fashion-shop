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
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

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
    async function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        setError("");
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("image", file);
            const res = await api("/api/uploads", { method: "POST", body: fd });
            setImages((prev) => [...prev, res.data.url]);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    function removeImage(url) {
        setImages((prev) => prev.filter((u) => u !== url));
    }

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
                    images,
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
            setImages([]);
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
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                        Ảnh sản phẩm ({images.length}/6)
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFile}
                        disabled={uploading || images.length >= 6}
                        className="text-sm"
                    />
                    {uploading && <p className="mt-1 text-sm text-gray-500">Đang tải ảnh lên...</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {images.map((url) => (
                            <div key={url} className="relative">
                                <img src={url} alt="" className="h-20 w-16 rounded border object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(url)}
                                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-black text-xs text-white"
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="rounded bg-black py-2 text-white md:col-span-2">Tạo sản phẩm</button>
            </form>

            {error && <p className="mb-2 text-red-600">{error}</p>}
            {message && <p className="mb-2 text-green-700">{message}</p>}

            <div className="space-y-2">
                {products.map((p) => (
                    <div key={p._id} className="flex items-center justify-between rounded border bg-white p-3">
                        <div className="flex items-center gap-3">
                            {p.images?.[0] ? (
                                <img src={p.images[0]} alt="" className="h-14 w-11 rounded object-cover" />
                            ) : (
                                <div className="h-14 w-11 rounded bg-gray-100" />
                            )}
                            <div>
                                <p className="font-medium">{p.name}</p>
                                <p className="text-sm text-gray-500">
                                    {p.category?.name} - {p.price.toLocaleString("vi-VN")}đ - {p.variants.length} biến thể
                                </p>
                            </div>
                        </div>
                        <button onClick={() => hide(p._id)} className="text-sm text-red-600">Ẩn</button>
                    </div>
                ))}
            </div>
        </div>
    );
}