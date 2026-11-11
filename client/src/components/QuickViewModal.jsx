import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";
import { useToast } from "../ToastContext.jsx";
import { getColorHex } from "../utils/colorUtils.js";
import { ArrowRightIcon, CloseIcon, MinusIcon, PlusIcon } from "./Icons.jsx";
import HeartButton from "./HeartButton.jsx";
import Stars from "./Stars.jsx";

export default function QuickViewModal({ product, onClose }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const firstAvailable =
    product.variants.find((v) => v.stock > 0) || product.variants[0] || {};

  const [size, setSize] = useState(firstAvailable.size || "");
  const [color, setColor] = useState(firstAvailable.color || "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const selected = product.variants.find(
    (v) => v.size === size && v.color === color
  );

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function selectColor(c) {
    setColor(c);
    setQuantity(1);
  }

  function selectSize(s) {
    setSize(s);
    setQuantity(1);
  }

  async function handleAddToCart() {
    if (!user) {
      onClose();
      showToast("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login");
      return;
    }
    if (user.role === "viewer") {
      showToast("Tài khoản demo không hỗ trợ mua hàng", { type: "error" });
      return;
    }
    if (!selected || selected.stock === 0) return;

    setSubmitting(true);
    try {
      await addItem({ productId: product._id, sku: selected.sku, quantity });
      showToast(`Đã thêm ${product.name} vào giỏ hàng`);
      onClose();
    } catch (err) {
      showToast(err.message, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in fixed inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="animate-fade-in-up relative z-10 grid max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#EAEAEA] bg-white md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng xem nhanh"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center bg-white/90 text-[#171717] transition hover:bg-[#171717] hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {/* Left Image */}
        <div className="relative bg-[#F5F4F0]">
          <div className="aspect-[3/4] w-full overflow-hidden">
            {product.images?.[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#777777]">
                Chưa có ảnh
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {product.images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-1.5 transition-all ${
                    i === activeImage ? "w-5 bg-[#171717]" : "w-1.5 bg-white/80"
                  }`}
                  aria-label={`Ảnh ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#777777]">
              {product.category?.name}
            </p>
            <h2 className="mt-1.5 font-serif text-2xl text-[#171717]">{product.name}</h2>

            <div className="mt-2 flex items-center gap-3">
              <p className="text-base font-medium text-[#171717]">
                {product.price.toLocaleString("vi-VN")}đ
              </p>
              {product.ratingCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-[#777777]">
                  <Stars value={product.ratingAverage} />
                  <span>({product.ratingCount})</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#777777]">
                {product.description}
              </p>
            )}

            {/* Color Selection */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.12em] text-[#777777]">Màu sắc</span>
                <span className="font-medium text-[#171717]">{color}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const hex = getColorHex(c);
                  const active = color === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => selectColor(c)}
                      title={c}
                      className={`flex items-center gap-2 border px-3 py-1.5 text-xs transition ${
                        active
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                      }`}
                    >
                      {hex && (
                        <span
                          className="h-3 w-3 rounded-full border border-black/15"
                          style={{ backgroundColor: hex }}
                        />
                      )}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.12em] text-[#777777]">Kích thước</span>
                {selected && (
                  <span className={selected.stock === 0 ? "text-red-600" : "text-[#777777]"}>
                    {selected.stock > 0 ? `Còn ${selected.stock} sản phẩm` : "Hết hàng"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectSize(s)}
                    className={`min-w-[44px] border px-3 py-1.5 text-xs font-medium transition ${
                      size === s
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {size && color && !selected && (
                <p className="mt-2 text-xs text-red-600">Phiên bản này hiện không có sẵn</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-5 flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.12em] text-[#777777]">Số lượng</span>
              <div className="flex items-center border border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-[#202020] transition hover:bg-[#F5F4F0]"
                  aria-label="Giảm số lượng"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      selected ? Math.min(selected.stock, q + 1) : q + 1
                    )
                  }
                  disabled={!selected || quantity >= selected.stock}
                  className="px-3 py-2 text-[#202020] transition hover:bg-[#F5F4F0] disabled:opacity-40"
                  aria-label="Tăng số lượng"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 pt-4">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!selected || selected.stock === 0 || submitting}
                onClick={handleAddToCart}
                className="flex-1 bg-[#171717] py-3 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#202020] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "Đang thêm..."
                  : selected?.stock === 0
                  ? "Hết hàng"
                  : "Thêm vào giỏ"}
              </button>
              <HeartButton product={product} className="h-[42px] w-[42px]" />
            </div>

            <Link
              to={`/products/${product._id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 border border-[#EAEAEA] py-2.5 text-xs uppercase tracking-[0.14em] text-[#202020] transition hover:border-[#171717]"
            >
              <span>Xem chi tiết sản phẩm</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

