import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";
import {
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "../components/Icons.jsx";
import { useToast } from "../ToastContext.jsx";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, refreshCart, updateItem, removeItem, clearCart } = useCart();
  const { showToast } = useToast();

  const [thumbnails, setThumbnails] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Lấy ảnh thumbnail thật từ /api/products/:id cho các sản phẩm trong giỏ
  useEffect(() => {
    const missingIds = [
      ...new Set(cart.items.map((i) => i.productId).filter(Boolean)),
    ].filter((id) => !(id in thumbnails));

    if (missingIds.length === 0) return;

    let ignore = false;
    Promise.all(
      missingIds.map((id) =>
        apiGet(`/api/products/${id}`)
          .then((b) => [id, b.data?.images?.[0] || ""])
          .catch(() => [id, ""])
      )
    ).then((entries) => {
      if (ignore) return;
      setThumbnails((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });

    return () => {
      ignore = true;
    };
  }, [cart.items, thumbnails]);

  async function handleQty(item, nextQty) {
    if (nextQty < 1) return;
    setError("");
    setBusyId(item.itemId);
    try {
      await updateItem(item.itemId, nextQty);
    } catch (err) {
      setError(err.message);
      showToast(err.message, { type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(itemId) {
    setError("");
    setBusyId(itemId);
    try {
      await removeItem(itemId);
      showToast("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleClear() {
    if (!window.confirm("Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;
    setError("");
    try {
      await clearCart();
      showToast("Đã làm trống giỏ hàng");
    } catch (err) {
      setError(err.message);
    }
  }

  if (user?.role === "viewer") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">Demo Viewer</p>
        <h1 className="mt-2 font-serif text-2xl text-[#171717]">Tài khoản chỉ xem</h1>
        <p className="mt-2 text-sm text-[#777777]">
          Tài khoản demo viewer chỉ dùng để xem khu vực quản trị, không hỗ trợ giỏ hàng và đặt mua.
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-block bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.14em] text-white"
        >
          Đến trang thống kê
        </Link>
      </div>
    );
  }

  if (loading && cart.items.length === 0) {
    return (
      <div className="py-12">
        <div className="h-8 w-48 animate-pulse bg-[#F5F4F0]" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="h-64 animate-pulse bg-[#F5F4F0] lg:col-span-8" />
          <div className="h-64 animate-pulse bg-[#F5F4F0] lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center animate-fade-in">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Shopping Bag</p>
        <h1 className="mt-2 font-serif text-3xl text-[#171717]">Giỏ hàng của bạn đang trống</h1>
        <p className="mt-3 text-sm text-[#777777]">
          Khám phá các thiết kế mới nhất và thêm những món đồ yêu thích vào túi.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 bg-[#171717] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#202020]"
        >
          <span>Khám phá bộ sưu tập</span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const hasProblem = cart.items.some((i) => !i.available || i.quantity > i.stock);
  const totalCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#EAEAEA] pb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Shopping Bag</p>
          <h1 className="mt-1 font-serif text-3xl font-normal text-[#171717]">
            Giỏ hàng ({totalCount})
          </h1>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-[#777777] underline underline-offset-4 transition hover:text-[#171717]"
        >
          Xóa tất cả
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Cart Items */}
        <div className="divide-y divide-[#EAEAEA] border-b border-[#EAEAEA] lg:col-span-8">
          {cart.items.map((item) => {
            const thumb = thumbnails[item.productId];
            const overStock = item.available && item.quantity > item.stock;
            const disabled = busyId === item.itemId;

            return (
              <div
                key={item.itemId}
                className="flex gap-4 py-6 first:pt-0 sm:gap-6"
              >
                <Link
                  to={`/products/${item.productId}`}
                  className="aspect-[3/4] w-20 shrink-0 overflow-hidden bg-[#F5F4F0] sm:w-24"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.name || "Sản phẩm"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-[#777777]">
                      FS
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/products/${item.productId}`}
                        className="block truncate text-sm font-medium text-[#171717] hover:underline"
                      >
                        {item.name ?? "Sản phẩm không còn khả dụng"}
                      </Link>
                      <p className="mt-1 text-xs text-[#777777]">
                        Size: {item.size || "-"} · Màu: {item.color || "-"} · SKU: {item.sku}
                      </p>
                      {item.available && (
                        <p className="mt-1 text-xs text-[#777777]">
                          Đơn giá: {item.price.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                      {!item.available && (
                        <p className="mt-1.5 text-xs text-red-600">
                          Sản phẩm này hiện không còn bán. Vui lòng xóa khỏi giỏ.
                        </p>
                      )}
                      {overStock && (
                        <p className="mt-1.5 text-xs text-red-600">
                          Số lượng vượt quá tồn kho hiện tại (còn {item.stock}).
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-sm font-medium text-[#171717]">
                      {item.available ? `${item.lineTotal.toLocaleString("vi-VN")}đ` : "—"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-[#EAEAEA]">
                      <button
                        type="button"
                        disabled={disabled || item.quantity <= 1}
                        onClick={() => handleQty(item, item.quantity - 1)}
                        aria-label="Giảm số lượng"
                        className="px-2.5 py-1.5 text-[#202020] transition hover:bg-[#F5F4F0] disabled:opacity-40"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={disabled || !item.available || item.quantity >= item.stock}
                        onClick={() => handleQty(item, item.quantity + 1)}
                        aria-label="Tăng số lượng"
                        className="px-2.5 py-1.5 text-[#202020] transition hover:bg-[#F5F4F0] disabled:opacity-40"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemove(item.itemId)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#777777] transition hover:text-red-600"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-4">
          <div className="border border-[#EAEAEA] bg-[#F5F4F0] p-6 sm:p-8 lg:sticky lg:top-24">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
              Tóm tắt đơn hàng
            </h2>

            <div className="mt-6 space-y-3 border-b border-[#EAEAEA] pb-5 text-sm">
              <div className="flex justify-between text-[#777777]">
                <span>Tạm tính</span>
                <span className="text-[#171717]">
                  {cart.totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between text-[#777777]">
                <span>Phí vận chuyển</span>
                <span className="text-[#171717]">Miễn phí</span>
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-[#777777]">
                Tổng cộng
              </span>
              <span className="text-xl font-medium text-[#171717]">
                {cart.totalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <p className="mt-1 text-right text-[11px] text-[#777777]">
              Thanh toán khi nhận hàng (COD)
            </p>

            {hasProblem ? (
              <div className="mt-6 border border-red-200 bg-white p-3 text-xs text-red-600">
                Vui lòng xóa hoặc điều chỉnh các sản phẩm không khả dụng trước khi đặt hàng.
              </div>
            ) : (
              <Link
                to="/checkout"
                className="mt-6 block w-full bg-[#171717] py-3.5 text-center text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#202020]"
              >
                Tiến hành đặt hàng
              </Link>
            )}

            <Link
              to="/products"
              className="mt-3 block w-full border border-[#EAEAEA] bg-white py-3 text-center text-xs uppercase tracking-[0.14em] text-[#202020] transition hover:border-[#171717]"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
