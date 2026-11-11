import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiGet } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useToast } from "../ToastContext.jsx";
import Stars from "./Stars.jsx";

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} sao`}
          className={`text-2xl leading-none transition ${
            n <= value ? "text-[#171717]" : "text-[#EAEAEA] hover:text-[#B9A58A]"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({
  productId,
  ratingAverage = 0,
  ratingCount = 0,
  onChanged,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [mine, setMine] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadReviews(p = 1) {
    const body = await apiGet(`/api/products/${productId}/reviews?page=${p}&limit=5`);
    if (p === 1) setReviews(body.data || []);
    else setReviews((prev) => [...prev, ...(body.data || [])]);
    setPage(body.page);
    setTotalPages(body.totalPages);
    setTotalItems(body.totalItems);
  }

  async function loadMine() {
    if (user?.role !== "customer") {
      setMine(null);
      return;
    }
    const body = await api(`/api/products/${productId}/reviews/me`);
    setMine(body.data);
  }

  useEffect(() => {
    let ignore = false;
    apiGet(`/api/products/${productId}/reviews?page=1&limit=5`)
      .then((body) => {
        if (ignore) return;
        setReviews(body.data || []);
        setPage(body.page);
        setTotalPages(body.totalPages);
        setTotalItems(body.totalItems);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });

    if (user?.role === "customer") {
      api(`/api/products/${productId}/reviews/me`)
        .then((body) => {
          if (!ignore) setMine(body.data);
        })
        .catch(() => {});
    } else {
      Promise.resolve().then(() => {
        if (!ignore) setMine(null);
      });
    }

    return () => {
      ignore = true;
    };
  }, [productId, user?.role]);

  async function refreshAll() {
    await Promise.all([loadReviews(1), loadMine()]);
    onChanged?.();
  }

  function startEdit() {
    setRating(mine.review.rating);
    setComment(mine.review.comment || "");
    setError("");
    setEditing(true);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (mine?.review) {
        await api(`/api/reviews/${mine.review._id}`, {
          method: "PUT",
          body: { rating, comment },
        });
        showToast("Đã cập nhật đánh giá");
      } else {
        await api(`/api/products/${productId}/reviews`, {
          method: "POST",
          body: { rating, comment },
        });
        showToast("Cảm ơn bạn đã gửi đánh giá");
      }
      setEditing(false);
      await refreshAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Bạn chắc chắn muốn xóa đánh giá này?")) return;
    setError("");
    try {
      await api(`/api/reviews/${id}`, { method: "DELETE" });
      setRating(5);
      setComment("");
      setEditing(false);
      showToast("Đã xóa đánh giá");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const showForm = editing || (mine && !mine.review && mine.purchased);

  return (
    <section id="reviews" className="mt-16 border-t border-[#EAEAEA] pt-14 lg:mt-24 lg:pt-16">
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Summary Column */}
        <div className="lg:col-span-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
            Customer Reviews
          </p>
          <h2 className="mt-1.5 font-serif text-2xl font-normal text-[#171717]">
            Đánh giá từ khách hàng
          </h2>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-serif text-4xl text-[#171717]">
              {ratingCount > 0 ? Number(ratingAverage).toFixed(1) : "—"}
            </span>
            <div>
              <Stars value={ratingAverage} size="text-sm" />
              <p className="mt-1 text-xs text-[#777777]">
                Dựa trên {totalItems || ratingCount} lượt đánh giá
              </p>
            </div>
          </div>

          {!user && (
            <p className="mt-6 border border-[#EAEAEA] bg-[#F5F4F0] p-4 text-xs leading-relaxed text-[#777777]">
              <Link to="/login" className="font-medium text-[#171717] underline underline-offset-4">
                Đăng nhập
              </Link>{" "}
              để chia sẻ đánh giá sau khi đã mua và nhận sản phẩm.
            </p>
          )}

          {user?.role === "customer" && mine && !mine.review && !mine.purchased && (
            <p className="mt-6 border border-[#EAEAEA] bg-[#F5F4F0] p-4 text-xs leading-relaxed text-[#777777]">
              Chỉ khách hàng đã mua và hoàn tất nhận hàng mới có thể viết đánh giá cho sản phẩm này.
            </p>
          )}
        </div>

        {/* Review List & Form Column */}
        <div className="lg:col-span-8">
          {error && (
            <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </p>
          )}

          {mine?.review && !editing && (
            <div className="mb-8 border border-[#EAEAEA] bg-[#F5F4F0] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#777777]">
                  Đánh giá của bạn
                </p>
                <div className="flex gap-4 text-xs">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="text-[#171717] underline underline-offset-4 hover:opacity-70"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(mine.review._id)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <Stars value={mine.review.rating} size="text-sm" />
              </div>
              {mine.review.comment && (
                <p className="mt-2.5 text-sm leading-relaxed text-[#202020]">
                  {mine.review.comment}
                </p>
              )}
            </div>
          )}

          {showForm && (
            <form onSubmit={submit} className="mb-8 border border-[#EAEAEA] bg-white p-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[#171717]">
                {mine?.review ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}
              </p>
              <StarInput value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Chia sẻ cảm nhận về phom dáng, chất liệu (không bắt buộc)..."
                className="mt-4 w-full border border-[#EAEAEA] bg-white px-3.5 py-2.5 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]"
              />
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#171717] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#202020] disabled:opacity-50"
                >
                  {saving ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-xs text-[#777777] underline underline-offset-4 hover:text-[#171717]"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="py-6 text-sm text-[#777777]">Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            <ul className="divide-y divide-[#EAEAEA]">
              {reviews.map((r) => (
                <li key={r._id} className="py-5 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Stars value={r.rating} />
                      <span className="text-xs font-medium text-[#171717]">{r.userName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#777777]">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      {user?.role === "admin" && (
                        <button
                          type="button"
                          onClick={() => remove(r._id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="mt-2.5 text-sm leading-relaxed text-[#202020]">{r.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {page < totalPages && (
            <button
              type="button"
              onClick={() => loadReviews(page + 1).catch((err) => setError(err.message))}
              className="mt-6 border border-[#171717] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
            >
              Xem thêm đánh giá
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
