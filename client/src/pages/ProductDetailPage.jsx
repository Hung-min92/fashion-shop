import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";
import HeartButton from "../components/HeartButton.jsx";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  TruckIcon,
} from "../components/Icons.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ReviewSection from "../components/ReviewSection.jsx";
import Stars from "../components/Stars.jsx";
import { useToast } from "../ToastContext.jsx";
import { getColorHex } from "../utils/colorUtils.js";

function SizeGuideModal({ onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-fade-in fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-fade-in-up relative z-10 w-full max-w-lg border border-[#EAEAEA] bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-[#EAEAEA] pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#777777]">Size Guide</p>
            <h3 className="mt-1 font-serif text-xl text-[#171717]">Bảng quy đổi kích thước</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 text-[#777777] hover:text-[#171717]"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-[11px] uppercase tracking-[0.12em] text-[#777777]">
                <th className="py-2.5 pr-4 font-medium">Size</th>
                <th className="py-2.5 pr-4 font-medium">Chiều cao (cm)</th>
                <th className="py-2.5 pr-4 font-medium">Cân nặng (kg)</th>
                <th className="py-2.5 font-medium">Ngực / Eo (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] text-[#202020]">
              <tr>
                <td className="py-2.5 pr-4 font-medium">S</td>
                <td className="py-2.5 pr-4">158 – 166</td>
                <td className="py-2.5 pr-4">50 – 58</td>
                <td className="py-2.5">86 – 90 / 70 – 74</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">M</td>
                <td className="py-2.5 pr-4">165 – 173</td>
                <td className="py-2.5 pr-4">58 – 67</td>
                <td className="py-2.5">90 – 96 / 74 – 80</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">L</td>
                <td className="py-2.5 pr-4">172 – 180</td>
                <td className="py-2.5 pr-4">67 – 76</td>
                <td className="py-2.5">96 – 102 / 80 – 86</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">XL</td>
                <td className="py-2.5 pr-4">176 – 185</td>
                <td className="py-2.5 pr-4">76 – 86</td>
                <td className="py-2.5">102 – 108 / 86 – 92</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-[#777777]">
          Số đo mang tính chất tham khảo cho phom dáng tiêu chuẩn. Nếu bạn thích mặc rộng rãi (relaxed fit), hãy cân nhắc chọn tăng 1 size.
        </p>
      </div>
    </div>
  );
}

function AccordionItem({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-[#EAEAEA]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-xs font-medium uppercase tracking-[0.14em] text-[#171717] transition hover:opacity-75"
      >
        <span>{title}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-5 text-sm leading-relaxed text-[#777777]">{children}</div>}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadedId, setLoadedId] = useState(null);
  const [error, setError] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("description");

  const loading = !error && loadedId !== id;

  useEffect(() => {
    let ignore = false;

    apiGet(`/api/products/${id}`)
      .then((body) => {
        if (ignore) return;
        const p = body.data;
        setProduct(p);
        setError("");
        setActiveImage(0);
        setQuantity(1);
        setLoadedId(id);

        const defaultVariant =
          p.variants?.find((v) => v.stock > 0) || p.variants?.[0];
        setSize(defaultVariant?.size || "");
        setColor(defaultVariant?.color || "");

        if (p.category?._id) {
          apiGet(`/api/products?category=${p.category._id}&limit=5`)
            .then((relBody) => {
              if (ignore) return;
              const filtered = (relBody.data || []).filter((item) => item._id !== p._id);
              if (filtered.length > 0) {
                setRelatedProducts(filtered.slice(0, 4));
              } else {
                apiGet("/api/products?sort=newest&limit=5")
                  .then((allBody) => {
                    if (!ignore) {
                      setRelatedProducts(
                        (allBody.data || []).filter((item) => item._id !== p._id).slice(0, 4)
                      );
                    }
                  })
                  .catch(() => {});
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setLoadedId(id);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  function selectColor(c) {
    setColor(c);
    setQuantity(1);
  }

  function selectSize(s) {
    setSize(s);
    setQuantity(1);
  }

  const sizes = useMemo(
    () => (product ? [...new Set(product.variants.map((v) => v.size))] : []),
    [product]
  );
  const colors = useMemo(
    () => (product ? [...new Set(product.variants.map((v) => v.color))] : []),
    [product]
  );
  const selected = useMemo(
    () => product?.variants.find((v) => v.size === size && v.color === color),
    [product, size, color]
  );

  async function reloadProduct() {
    const body = await apiGet(`/api/products/${id}`);
    setProduct(body.data);
  }

  async function handleAddToCart({ redirectCheckout = false } = {}) {
    if (!user) {
      showToast("Vui lòng đăng nhập để mua hàng");
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
      if (redirectCheckout) {
        navigate("/checkout");
      } else {
        showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
      }
    } catch (err) {
      showToast(err.message, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="aspect-[3/4] animate-pulse bg-[#F5F4F0] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="h-3 w-24 animate-pulse bg-[#F5F4F0]" />
          <div className="h-8 w-3/4 animate-pulse bg-[#F5F4F0]" />
          <div className="h-6 w-32 animate-pulse bg-[#F5F4F0]" />
          <div className="mt-8 h-32 w-full animate-pulse bg-[#F5F4F0]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-red-600">Lỗi: {error}</p>
        <Link
          to="/products"
          className="mt-6 inline-block border border-[#171717] px-6 py-2.5 text-xs uppercase tracking-[0.14em]"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#777777]">
        <Link to="/" className="transition hover:text-[#171717]">
          Trang chủ
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <Link to="/products" className="transition hover:text-[#171717]">
          Bộ sưu tập
        </Link>
        {product.category && (
          <>
            <ChevronRightIcon className="h-3 w-3" />
            <Link
              to={`/products?category=${product.category._id}`}
              className="transition hover:text-[#171717]"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRightIcon className="h-3 w-3" />
        <span className="truncate text-[#171717]">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: Product Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row lg:col-span-7">
          {product.images?.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto sm:w-20 sm:shrink-0 sm:flex-col">
              {product.images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`aspect-[3/4] w-16 shrink-0 overflow-hidden border transition sm:w-full ${
                    i === activeImage
                      ? "border-[#171717]"
                      : "border-[#EAEAEA] opacity-65 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="aspect-[3/4] w-full flex-1 overflow-hidden bg-[#F5F4F0]">
            {product.images?.length ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#777777]">
                Chưa có ảnh sản phẩm
              </div>
            )}
          </div>
        </div>

        {/* Right: Sticky Product Details */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            {product.category && (
              <Link
                to={`/products?category=${product.category._id}`}
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#777777] transition hover:text-[#171717]"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="mt-2 font-serif text-2xl font-normal text-[#171717] sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xl font-medium text-[#171717]">
                {product.price.toLocaleString("vi-VN")}đ
              </p>

              <a
                href="#reviews"
                className="flex items-center gap-1.5 text-xs text-[#777777] transition hover:text-[#171717]"
              >
                <Stars value={product.ratingAverage} />
                <span>
                  {product.ratingCount > 0
                    ? `${product.ratingAverage} (${product.ratingCount} đánh giá)`
                    : "Chưa có đánh giá"}
                </span>
              </a>
            </div>

            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#777777]">
                {product.description}
              </p>
            )}

            <div className="my-6 border-t border-[#EAEAEA]" />

            {/* Color Swatches */}
            <div>
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.14em] text-[#777777]">Màu sắc</span>
                <span className="font-medium text-[#171717]">{color || "Chọn màu"}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => {
                  const hex = getColorHex(c);
                  const active = color === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => selectColor(c)}
                      title={c}
                      className={`flex items-center gap-2 border px-3.5 py-2 text-xs transition ${
                        active
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                      }`}
                    >
                      {hex && (
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: hex }}
                        />
                      )}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-6">
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.14em] text-[#777777]">Kích thước</span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-[#777777] underline underline-offset-4 transition hover:text-[#171717]"
                >
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {sizes.map((s) => {
                  const variantForSize = product.variants.find(
                    (v) => v.size === s && (!color || v.color === color)
                  );
                  const out = variantForSize && variantForSize.stock === 0;
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => selectSize(s)}
                      className={`border py-2.5 text-xs font-medium transition ${
                        active
                          ? "border-[#171717] bg-[#171717] text-white"
                          : out
                          ? "border-[#EAEAEA] bg-[#F5F4F0] text-[#777777] line-through"
                          : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Status */}
            {size && color && (
              <div className="mt-4 text-xs">
                {!selected ? (
                  <p className="text-red-600">Phiên bản màu/size này hiện không có sẵn.</p>
                ) : selected.stock === 0 ? (
                  <p className="text-red-600">Phiên bản này hiện đã hết hàng.</p>
                ) : selected.stock <= 5 ? (
                  <p className="text-[#B9A58A]">
                    Sắp hết hàng — chỉ còn {selected.stock} sản phẩm (SKU: {selected.sku})
                  </p>
                ) : (
                  <p className="text-[#777777]">
                    Còn {selected.stock} sản phẩm có sẵn (SKU: {selected.sku})
                  </p>
                )}
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="mt-6 space-y-3">
              <div className="flex items-stretch gap-3">
                <div className="flex items-center border border-[#EAEAEA]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                    className="px-3.5 py-3 text-[#202020] transition hover:bg-[#F5F4F0]"
                  >
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        selected ? Math.min(selected.stock, q + 1) : q + 1
                      )
                    }
                    disabled={!selected || quantity >= selected.stock}
                    aria-label="Tăng số lượng"
                    className="px-3.5 py-3 text-[#202020] transition hover:bg-[#F5F4F0] disabled:opacity-40"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!selected || selected.stock === 0 || submitting}
                  onClick={() => handleAddToCart({ redirectCheckout: false })}
                  className="flex-1 bg-[#171717] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#202020] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting
                    ? "Đang xử lý..."
                    : selected?.stock === 0
                    ? "Hết hàng"
                    : "Thêm vào giỏ hàng"}
                </button>

                <HeartButton product={product} className="h-auto w-12 shrink-0" />
              </div>

              <button
                type="button"
                disabled={!selected || selected.stock === 0 || submitting}
                onClick={() => handleAddToCart({ redirectCheckout: true })}
                className="w-full border border-[#171717] bg-white py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#171717] transition hover:bg-[#F5F4F0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mua ngay
              </button>
            </div>

            {/* Service Highlights */}
            <div className="mt-6 space-y-2.5 bg-[#F5F4F0] p-4 text-xs text-[#202020]">
              <div className="flex items-center gap-2.5">
                <TruckIcon className="h-4 w-4 text-[#777777]" />
                <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshIcon className="h-4 w-4 text-[#777777]" />
                <span>Đổi trả trong vòng 14 ngày · Thanh toán khi nhận hàng (COD)</span>
              </div>
            </div>

            {/* Accordion Details */}
            <div className="mt-8 border-t border-[#EAEAEA]">
              <AccordionItem
                title="Mô tả sản phẩm"
                open={openAccordion === "description"}
                onToggle={() =>
                  setOpenAccordion((v) => (v === "description" ? "" : "description"))
                }
              >
                {product.description ||
                  "Thiết kế tối giản hiện đại, tập trung vào phom dáng tinh gọn và cảm giác thoải mái khi mặc hằng ngày."}
              </AccordionItem>

              <AccordionItem
                title="Chi tiết & Bảo quản"
                open={openAccordion === "details"}
                onToggle={() =>
                  setOpenAccordion((v) => (v === "details" ? "" : "details"))
                }
              >
                <ul className="list-disc space-y-1.5 pl-4">
                  <li>Danh mục: {product.category?.name || "Thời trang thiết yếu"}</li>
                  <li>Kích thước hiện có: {sizes.join(", ")}</li>
                  <li>Màu sắc hiện có: {colors.join(", ")}</li>
                  <li>Giặt nhẹ ở nhiệt độ thường, không dùng chất tẩy mạnh, ủi ở nhiệt độ thấp.</li>
                </ul>
              </AccordionItem>

              <AccordionItem
                title="Vận chuyển & Đổi trả"
                open={openAccordion === "shipping"}
                onToggle={() =>
                  setOpenAccordion((v) => (v === "shipping" ? "" : "shipping"))
                }
              >
                <p>
                  Giao hàng tiêu chuẩn toàn quốc trong 2–5 ngày làm việc. Hỗ trợ thanh toán tiền mặt
                  khi nhận hàng (COD) và đổi trả sản phẩm nguyên tem mác trong 14 ngày.
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <ReviewSection
        productId={product._id}
        ratingAverage={product.ratingAverage}
        ratingCount={product.ratingCount}
        onChanged={reloadProduct}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-[#EAEAEA] pt-14 lg:mt-24 lg:pt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
                You May Also Like
              </p>
              <h2 className="mt-1.5 font-serif text-2xl font-normal text-[#171717]">
                Sản phẩm liên quan
              </h2>
            </div>
            <Link
              to={
                product.category?._id
                  ? `/products?category=${product.category._id}`
                  : "/products"
              }
              className="text-xs uppercase tracking-[0.14em] text-[#171717] underline underline-offset-4 hover:text-[#B9A58A]"
            >
              Xem thêm
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
    </div>
  );
}
