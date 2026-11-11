import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiGet } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import Stars from "./Stars.jsx";

function StarInput({ value, onChange }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    aria-label={`${n} sao`}
                    className={`text-3xl leading-none ${n <= value ? "text-black" : "text-gray-300"}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

export default function ReviewSection({ productId, onChanged }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [mine, setMine] = useState(null); // { review, purchased } hoặc null
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadReviews(p = 1) {
        const body = await apiGet(`/api/products/${productId}/reviews?page=${p}&limit=5`);
        if (p === 1) setReviews(body.data);
        else setReviews((prev) => [...prev, ...body.data]);
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
        loadReviews(1).catch((err) => setError(err.message));
        loadMine().catch(() => { });
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
            } else {
                await api(`/api/products/${productId}/reviews`, {
                    method: "POST",
                    body: { rating, comment },
                });
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
        if (!window.confirm("Xóa đánh giá này?")) return;
        setError("");
        try {
            await api(`/api/reviews/${id}`, { method: "DELETE" });
            setRating(5);
            setComment("");
            setEditing(false);
            await refreshAll();
        } catch (err) {
            setError(err.message);
        }
    }

    const showForm = editing || (mine && !mine.review && mine.purchased);

    return (
        <section className="mt-12 border-t-2 border-black pt-6">
            <h2 className="mb-4 text-xl font-black uppercase">Đánh giá ({totalItems})</h2>

            {error && <p className="mb-3 text-red-600">{error}</p>}

            {!user && (
                <p className="mb-4 text-sm">
                    <Link to="/login" className="underline">Đăng nhập</Link> để viết đánh giá.
                </p>
            )}

            {user?.role === "customer" && mine && !mine.review && !mine.purchased && (
                <p className="mb-4 text-sm text-gray-500">
                    Bạn chỉ có thể đánh giá sau khi đã mua và nhận hàng sản phẩm này.
                </p>
            )}

            {mine?.review && !editing && (
                <div className="mb-6 border-2 border-black bg-[#c6ff00]/30 p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest">Đánh giá của bạn</p>
                    <Stars value={mine.review.rating} size="text-xl" />
                    {mine.review.comment && <p className="mt-2">{mine.review.comment}</p>}
                    <div className="mt-3 flex gap-4 text-sm">
                        <button onClick={startEdit} className="underline">Sửa</button>
                        <button onClick={() => remove(mine.review._id)} className="text-red-600">Xóa</button>
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={submit} className="mb-6 border-2 border-black bg-white p-4">
                    <p className="mb-2 text-sm font-bold uppercase tracking-widest">
                        {mine?.review ? "Sửa đánh giá" : "Viết đánh giá"}
                    </p>
                    <StarInput value={rating} onChange={setRating} />
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="Chia sẻ cảm nhận của bạn (không bắt buộc)"
                        className="mt-3 w-full border-2 border-black px-3 py-2 text-sm"
                    />
                    <div className="mt-3 flex gap-3">
                        <button
                            disabled={saving}
                            className="border-2 border-black bg-black px-4 py-2 text-sm font-black uppercase text-white hover:bg-[#c6ff00] hover:text-black disabled:opacity-50"
                        >
                            {saving ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                        {editing && (
                            <button type="button" onClick={() => setEditing(false)} className="text-sm underline">
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            )}

            {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
            ) : (
                <ul className="space-y-4">
                    {reviews.map((r) => (
                        <li key={r._id} className="border-b pb-4">
                            <div className="flex items-center gap-3">
                                <Stars value={r.rating} />
                                <span className="text-sm font-bold">{r.userName}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                                {user?.role === "admin" && (
                                    <button
                                        onClick={() => remove(r._id)}
                                        className="ml-auto text-xs text-red-600"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                            {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                        </li>
                    ))}
                </ul>
            )}

            {page < totalPages && (
                <button
                    onClick={() => loadReviews(page + 1).catch((err) => setError(err.message))}
                    className="mt-4 border-2 border-black px-4 py-2 text-sm font-black uppercase"
                >
                    Xem thêm
                </button>
            )}
        </section>
    );
}