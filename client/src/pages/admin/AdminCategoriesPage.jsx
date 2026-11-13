import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";
import AdminNav from "../../components/admin/AdminNav.jsx";
import { useToast } from "../../ToastContext.jsx";
import { slugify } from "../../utils/slugify.js";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const readOnly = user?.role === "viewer";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [manualSlug, setManualSlug] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function loadCategories() {
    try {
      const res = await api("/api/categories");
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách danh mục");
    }
  }

  useEffect(() => {
    let ignore = false;
    api("/api/categories")
      .then((res) => {
        if (!ignore) {
          setCategories(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Không thể tải danh sách danh mục");
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  function handleNameChange(e) {
    const val = e.target.value;
    setName(val);
    if (!manualSlug) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(e) {
    setManualSlug(true);
    setSlug(slugify(e.target.value));
  }

  function resetForm() {
    setName("");
    setSlug("");
    setManualSlug(false);
    setEditingId(null);
  }

  function startEdit(cat) {
    setError("");
    setMessage("");
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setManualSlug(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }
    const finalSlug = slug.trim() || slugify(name);
    if (!finalSlug) {
      setError("Slug không hợp lệ");
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (editingId) {
        await api(`/api/categories/${editingId}`, {
          method: "PUT",
          body: { name: name.trim(), slug: finalSlug },
        });
        showToast("Đã cập nhật danh mục thành công");
        setMessage("Đã cập nhật danh mục thành công");
      } else {
        await api("/api/categories", {
          method: "POST",
          body: { name: name.trim(), slug: finalSlug },
        });
        showToast("Đã tạo danh mục mới thành công");
        setMessage("Đã tạo danh mục mới thành công");
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err.message || "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) return;
    setError("");
    setMessage("");
    try {
      await api(`/api/categories/${cat._id}`, { method: "DELETE" });
      showToast("Đã xóa danh mục");
      if (editingId === cat._id) resetForm();
      await loadCategories();
    } catch (err) {
      setError(err.message || "Không thể xóa danh mục này");
    }
  }

  const inputClass =
    "w-full border border-[#EAEAEA] bg-white px-3.5 py-2.5 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]";

  return (
    <div className="animate-fade-in">
      <AdminNav
        title="Quản lý danh mục"
        subtitle="Tạo mới, đổi tên, cập nhật đường dẫn slug và phân loại sản phẩm trong cửa hàng."
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

      {/* Form tạo / chỉnh sửa danh mục */}
      {!readOnly && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 border border-[#EAEAEA] bg-white p-6 sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3 mb-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
              {editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-[#777777]">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="Ví dụ: Áo Sơ Mi, Quần Tây, Phụ Kiện..."
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs text-[#777777]">
                  Đường dẫn (Slug) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setManualSlug(false);
                    setSlug(slugify(name));
                  }}
                  className="text-[11px] text-[#777777] hover:text-[#171717] underline"
                >
                  Tự tạo lại từ tên
                </button>
              </div>
              <input
                className={inputClass}
                placeholder="ao-so-mi"
                value={slug}
                onChange={handleSlugChange}
                required
              />
              <p className="mt-1 text-[11px] text-[#999999]">
                Chỉ gồm chữ thường không dấu, số và dấu gạch ngang (-)
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EAEAEA] pt-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-[#EAEAEA] bg-white px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-[#777777] hover:border-[#171717] hover:text-[#171717]"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-[#171717] px-6 py-2.5 text-xs uppercase tracking-[0.16em] text-white transition hover:bg-[#202020] disabled:opacity-50"
            >
              {saving
                ? "Đang lưu..."
                : editingId
                ? "Cập nhật danh mục"
                : "+ Tạo danh mục"}
            </button>
          </div>
        </form>
      )}

      {/* Danh sách danh mục */}
      <div className="border border-[#EAEAEA] bg-white">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] px-6 py-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-[#171717]">
            Danh sách danh mục ({categories.length})
          </h3>
          <Link
            to="/admin/products"
            className="text-xs text-[#777777] hover:text-[#171717] underline underline-offset-4"
          >
            Quản lý sản phẩm →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#777777]">
            Đang tải danh sách danh mục...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#777777]">
            Chưa có danh mục nào. Hãy tạo danh mục đầu tiên ở biểu mẫu phía trên.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#EAEAEA] bg-[#FAF9F5] text-[11px] uppercase tracking-[0.12em] text-[#777777]">
                <tr>
                  <th className="px-6 py-3">Tên danh mục</th>
                  <th className="px-6 py-3">Slug đường dẫn</th>
                  <th className="px-6 py-3">Ngày tạo</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-[#FAF9F5] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#171717]">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-[#777777]">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-[#777777]">
                      {cat.createdAt
                        ? new Date(cat.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!readOnly ? (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="text-[#171717] hover:underline"
                          >
                            Chỉnh sửa
                          </button>
                          <span className="text-[#EAEAEA]">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="text-red-600 hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#999999]">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
