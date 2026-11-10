import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";

const EMPTY_FORM = { name: "", description: "", price: "", category: "" };
const EMPTY_VARIANT = { sku: "", size: "", color: "", stock: "" };

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }]);
    const [images, setImages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const { user } = useAuth();
    const readOnly = user?.role === "viewer";

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

    const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    function setVariantField(index, key, value) {
        setVariants((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [key]: value } : v))
        );
    }

    function addVariant() {
        setVariants((prev) => [...prev, { ...EMPTY_VARIANT }]);
    }

    function removeVariant(index) {
        setVariants((prev) =>
            prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
        );
    }

    function resetForm() {
        setForm(EMPTY_FORM);
        setVariants([{ ...EMPTY_VARIANT }]);
        setImages([]);
        setEditingId(null);
    }

    function startEdit(p) {
        setError("");
        setMessage("");
        setEditingId(p._id);
        setForm({
            name: p.name,
            description: p.description || "",
            price: String(p.price),
            category: p.category?._id || "",
        });
        setImages(p.images || []);
        setVariants(
            p.variants.map((v) => ({
                sku: v.sku,
                size: v.size,
                color: v.color,
                stock: String(v.stock),
            }))
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

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

    async function submit(e) {
        e.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        const body = {
            name: form.name,
            description: form.description,
            price: Number(form.price),
            category: form.category,
            images,
            variants: variants.map((v) => ({
                sku: v.sku,
                size: v.size,
                color: v.color,
                stock: Number(v.stock),
            })),
        };

        try {
            if (editingId) {
                await api(`/api/products/${editingId}`, { method: "PUT", body });
                setMessage("Đã cập nhật sản phẩm");
            } else {
                await api("/api/products", { method: "POST", body });
                setMessage("Đã tạo sản phẩm");
            }
            resetForm();
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function hide(id) {
        if (!window.confirm("Ẩn sản phẩm này khỏi cửa hàng?")) return;
        setError("");
        try {
            await api(`/api/products/${id}`, { method: "DELETE" });
            if (editingId === id) resetForm();
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    const input = "w-full rounded border px-3 py-2";

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Quản lý sản phẩm</h1>
            {readOnly && (
                <p className="mb-4 border-2 border-black bg-[#c6ff00] p-2 text-sm font-bold">
                    Chế độ chỉ xem (tài khoản demo). Các thao tác chỉnh sửa bị vô hiệu hóa.
                </p>
            )}
            {error && <p className="mb-2 text-red-600">{error}</p>}
            {message && <p className="mb-2 text-green-700">{message}</p>}
            {!readOnly && (
                <form
                    onSubmit={submit}
                    className="mb-8 grid gap-2 rounded border bg-white p-4 md:grid-cols-2"
                >
                    <h2 className="font-bold md:col-span-2">
                        {editingId ? "Sửa sản phẩm" : "Tạo sản phẩm mới"}
                    </h2>

                    <input className={input} placeholder="Tên sản phẩm" value={form.name} onChange={setField("name")} />
                    <input className={input} placeholder="Giá (đồng)" value={form.price} onChange={setField("price")} />
                    <select className={input} value={form.category} onChange={setField("category")}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                    <input className={input} placeholder="Mô tả" value={form.description} onChange={setField("description")} />

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

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Biến thể (size, màu, tồn kho)</label>
                        <div className="space-y-2">
                            {variants.map((v, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2 md:grid-cols-5">
                                    <input className={input} placeholder="SKU (vd: AO-M-DEN)" value={v.sku} onChange={(e) => setVariantField(i, "sku", e.target.value)} />
                                    <input className={input} placeholder="Size" value={v.size} onChange={(e) => setVariantField(i, "size", e.target.value)} />
                                    <input className={input} placeholder="Màu" value={v.color} onChange={(e) => setVariantField(i, "color", e.target.value)} />
                                    <input className={input} placeholder="Tồn kho" value={v.stock} onChange={(e) => setVariantField(i, "stock", e.target.value)} />
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(i)}
                                        disabled={variants.length === 1}
                                        className="rounded border px-3 py-2 text-sm text-red-600 disabled:opacity-30"
                                    >
                                        Xóa dòng
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addVariant} className="mt-2 text-sm underline">
                            + Thêm biến thể
                        </button>
                    </div>

                    <div className="flex gap-2 md:col-span-2">
                        <button
                            disabled={saving || uploading}
                            className="flex-1 rounded bg-black py-2 text-white disabled:opacity-50"
                        >
                            {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo sản phẩm"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="rounded border px-4 py-2">
                                Hủy sửa
                            </button>
                        )}
                    </div>
                </form>
            )}
            <div className="space-y-2">
                {products.map((p) => {
                    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                    return (
                        <div
                            key={p._id}
                            className={`flex items-center justify-between rounded border bg-white p-3 ${editingId === p._id ? "border-black ring-2 ring-black" : ""
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {p.images?.[0] ? (
                                    <img src={p.images[0]} alt="" className="h-14 w-11 rounded object-cover" />
                                ) : (
                                    <div className="h-14 w-11 rounded bg-gray-100" />
                                )}
                                <div>
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {p.category?.name} - {p.price.toLocaleString("vi-VN")}đ - {p.variants.length} biến thể - tồn {totalStock}
                                    </p>
                                </div>
                            </div>
                            {!readOnly && (
                                <div className="flex gap-3 text-sm">
                                    <button onClick={() => startEdit(p)} className="underline">Sửa</button>
                                    <button onClick={() => hide(p._id)} className="text-red-600">Ẩn</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}