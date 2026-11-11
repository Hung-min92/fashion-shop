import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";
import AdminNav from "../../components/admin/AdminNav.jsx";
import { CloseIcon } from "../../components/Icons.jsx";
import { useToast } from "../../ToastContext.jsx";

const EMPTY_FORM = { name: "", description: "", price: "", category: "" };
const EMPTY_VARIANT = { sku: "", size: "", color: "", stock: "" };

export default function AdminProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const readOnly = user?.role === "viewer";

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

  async function load() {
    const [p, c] = await Promise.all([
      api("/api/products?limit=50"),
      api("/api/categories"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
  }

  useEffect(() => {
    let ignore = false;
    Promise.all([api("/api/products?limit=50"), api("/api/categories")])
      .then(([p, c]) => {
        if (ignore) return;
        setProducts(p.data || []);
        setCategories(c.data || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
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
      showToast("Đã tải ảnh lên Cloudinary");
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
        showToast("Đã cập nhật sản phẩm");
      } else {
        await api("/api/products", { method: "POST", body });
        setMessage("Đã tạo sản phẩm mới");
        showToast("Đã tạo sản phẩm mới");
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
      showToast("Đã ẩn sản phẩm");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass =
    "w-full border border-[#EAEAEA] bg-white px-3.5 py-2.5 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]";

  return (
    <div className="animate-fade-in">
      <AdminNav
        title="Quản lý sản phẩm"
        subtitle="Thêm mới, chỉnh sửa biến thể tồn kho, tải ảnh sản phẩm và quản lý danh mục bán."
      />

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 border border-[#B9A58A] bg-[#F5F4F0] px-4 py-3 text-xs text-[#171717]">
          {message}
        </div>
      )}

      {!readOnly && (
        <form
          onSubmit={submit}
          className="mb-10 grid gap-4 border border-[#EAEAEA] bg-white p-6 sm:p-8 md:grid-cols-2"
        >
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3 md:col-span-2">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
              {editingId ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-[#777777] underline underline-offset-4 hover:text-[#171717]"
              >
                Hủy chỉnh sửa
              </button>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[#777777]">Tên sản phẩm</label>
            <input
              className={inputClass}
              placeholder="Áo sơ mi Linen Minimalist"
              value={form.name}
              onChange={setField("name")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[#777777]">Giá bán (VNĐ)</label>
            <input
              className={inputClass}
              placeholder="490000"
              value={form.price}
              onChange={setField("price")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[#777777]">Danh mục</label>
            <select
              className={inputClass}
              value={form.category}
              onChange={setField("category")}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[#777777]">Mô tả</label>
            <input
              className={inputClass}
              placeholder="Chất liệu thoáng mát, phom dáng hiện đại..."
              value={form.description}
              onChange={setField("description")}
            />
          </div>

          {/* Image Upload */}
          <div className="border-t border-[#EAEAEA] pt-4 md:col-span-2">
            <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-[#777777]">
              Ảnh sản phẩm ({images.length}/6)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              disabled={uploading || images.length >= 6}
              className="block text-xs text-[#777777] file:mr-4 file:border file:border-[#171717] file:bg-white file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.12em] file:text-[#171717] hover:file:bg-[#171717] hover:file:text-white"
            />
            {uploading && (
              <p className="mt-2 text-xs text-[#777777]">Đang tải ảnh lên...</p>
            )}

            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((url) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt=""
                      className="aspect-[3/4] w-20 border border-[#EAEAEA] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      aria-label="Xóa ảnh"
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-white"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="border-t border-[#EAEAEA] pt-4 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.14em] text-[#777777]">
                Biến thể (SKU, Size, Màu, Tồn kho)
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-medium text-[#171717] underline underline-offset-4 hover:text-[#B9A58A]"
              >
                + Thêm biến thể
              </button>
            </div>

            <div className="space-y-2.5">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
                  <input
                    className={inputClass}
                    placeholder="SKU (vd: AO-M-DEN)"
                    value={v.sku}
                    onChange={(e) => setVariantField(i, "sku", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Size"
                    value={v.size}
                    onChange={(e) => setVariantField(i, "size", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Màu"
                    value={v.color}
                    onChange={(e) => setVariantField(i, "color", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Tồn kho"
                    value={v.stock}
                    onChange={(e) => setVariantField(i, "stock", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={variants.length === 1}
                    className="border border-[#EAEAEA] px-3 py-2 text-xs text-red-600 transition hover:border-red-600 disabled:opacity-35"
                  >
                    Xóa dòng
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 md:col-span-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-[#171717] py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#202020] disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      )}

      {/* Product List */}
      <div className="divide-y divide-[#EAEAEA] border border-[#EAEAEA] bg-white">
        {products.map((p) => {
          const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
          const isEditing = editingId === p._id;
          return (
            <div
              key={p._id}
              className={`flex flex-wrap items-center justify-between gap-4 p-4 transition ${
                isEditing ? "bg-[#F5F4F0]" : "hover:bg-[#F5F4F0]/50"
              }`}
            >
              <div className="flex items-center gap-4">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[3/4] w-12 bg-[#F5F4F0] object-cover"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-12 items-center justify-center bg-[#F5F4F0] text-[10px] text-[#777777]">
                    NO IMG
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#171717]">{p.name}</p>
                  <p className="mt-0.5 text-xs text-[#777777]">
                    {p.category?.name} · {p.price.toLocaleString("vi-VN")}đ ·{" "}
                    {p.variants.length} biến thể · Tồn: {totalStock}
                  </p>
                </div>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="text-[#171717] underline underline-offset-4 hover:text-[#B9A58A]"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => hide(p._id)}
                    className="text-red-600 hover:underline"
                  >
                    Ẩn
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
