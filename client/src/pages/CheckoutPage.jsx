import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";
import { ChevronRightIcon } from "../components/Icons.jsx";
import { useToast } from "../ToastContext.jsx";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, refreshCart, resetLocalCart } = useCart();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    note: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Họ tên là bắt buộc";
    if (!/^0\d{9}$/.test(form.phone.trim())) {
      errs.phone = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";
    }
    if (!form.street.trim()) errs.street = "Địa chỉ giao hàng là bắt buộc";
    if (!form.city.trim()) errs.city = "Tỉnh / Thành phố là bắt buộc";
    if (form.note.length > 500) errs.note = "Ghi chú tối đa 500 ký tự";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { note, ...shippingAddress } = form;
      await api("/api/orders", {
        method: "POST",
        body: {
          shippingAddress: {
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            street: shippingAddress.street.trim(),
            city: shippingAddress.city.trim(),
          },
          note: note.trim(),
        },
      });
      resetLocalCart();
      showToast("Đặt hàng thành công!");
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">Checkout</p>
        <h1 className="mt-2 font-serif text-2xl text-[#171717]">Giỏ hàng đang trống</h1>
        <p className="mt-2 text-sm text-[#777777]">
          Bạn cần thêm sản phẩm vào giỏ trước khi tiến hành thanh toán.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block bg-[#171717] px-7 py-3 text-xs uppercase tracking-[0.14em] text-white"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  const inputBase =
    "w-full border bg-white px-3.5 py-3 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]";

  return (
    <div className="animate-fade-in">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
        <Link to="/cart" className="transition hover:text-[#171717]">
          Giỏ hàng
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-[#171717]">Thanh toán</span>
      </nav>

      <h1 className="mb-8 font-serif text-3xl font-normal text-[#171717]">
        Thông tin đặt hàng
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: Shipping & Payment Form */}
        <form onSubmit={submit} className="space-y-8 lg:col-span-7">
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="border border-[#EAEAEA] bg-white p-6 sm:p-8">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
              1. Địa chỉ nhận hàng
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-[#777777]">Họ và tên *</label>
                <input
                  className={`${inputBase} ${
                    fieldErrors.fullName ? "border-red-400" : "border-[#EAEAEA]"
                  }`}
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={set("fullName")}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#777777]">Số điện thoại *</label>
                <input
                  className={`${inputBase} ${
                    fieldErrors.phone ? "border-red-400" : "border-[#EAEAEA]"
                  }`}
                  placeholder="09xxxxxxxx"
                  value={form.phone}
                  onChange={set("phone")}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-[#777777]">Địa chỉ cụ thể *</label>
                <input
                  className={`${inputBase} ${
                    fieldErrors.street ? "border-red-400" : "border-[#EAEAEA]"
                  }`}
                  placeholder="Số nhà, tên đường, phường/xã"
                  value={form.street}
                  onChange={set("street")}
                />
                {fieldErrors.street && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.street}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-[#777777]">Tỉnh / Thành phố *</label>
                <input
                  className={`${inputBase} ${
                    fieldErrors.city ? "border-red-400" : "border-[#EAEAEA]"
                  }`}
                  placeholder="TP. Hồ Chí Minh"
                  value={form.city}
                  onChange={set("city")}
                />
                {fieldErrors.city && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-[#777777]">
                  Ghi chú đơn hàng (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  className={`${inputBase} border-[#EAEAEA]`}
                  placeholder="Thời gian giao mong muốn hoặc lưu ý cho shipper..."
                  value={form.note}
                  onChange={set("note")}
                />
                {fieldErrors.note && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.note}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border border-[#EAEAEA] bg-white p-6 sm:p-8">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
              2. Vận chuyển &amp; Thanh toán
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between border border-[#EAEAEA] p-4">
                <div>
                  <p className="font-medium text-[#171717]">Giao hàng tiêu chuẩn</p>
                  <p className="mt-0.5 text-xs text-[#777777]">Dự kiến nhận hàng trong 2–5 ngày</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-[#171717]">
                  Miễn phí
                </span>
              </div>

              <div className="flex items-center justify-between border border-[#171717] bg-[#F5F4F0] p-4">
                <div>
                  <p className="font-medium text-[#171717]">Thanh toán khi nhận hàng (COD)</p>
                  <p className="mt-0.5 text-xs text-[#777777]">
                    Kiểm tra gói hàng trước khi thanh toán tiền mặt
                  </p>
                </div>
                <span className="h-3 w-3 rounded-full bg-[#171717]" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#171717] py-4 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#202020] disabled:opacity-50"
          >
            {submitting ? "Đang xử lý đơn hàng..." : "Xác nhận đặt hàng"}
          </button>
        </form>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="border border-[#EAEAEA] bg-[#F5F4F0] p-6 sm:p-8 lg:sticky lg:top-24">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
              Chi tiết đơn hàng ({cart.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
            </h2>

            <ul className="mt-5 divide-y divide-[#EAEAEA] border-b border-[#EAEAEA]">
              {cart.items.map((item) => (
                <li key={item.itemId} className="flex items-start justify-between gap-4 py-3.5 text-sm">
                  <div>
                    <p className="font-medium text-[#171717]">{item.name}</p>
                    <p className="mt-0.5 text-xs text-[#777777]">
                      {item.size} / {item.color} · SL: {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium text-[#171717]">
                    {item.lineTotal.toLocaleString("vi-VN")}đ
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2.5 border-b border-[#EAEAEA] pb-5 text-sm">
              <div className="flex justify-between text-[#777777]">
                <span>Tạm tính</span>
                <span className="text-[#171717]">
                  {cart.totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between text-[#777777]">
                <span>Vận chuyển</span>
                <span className="text-[#171717]">Miễn phí</span>
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-[#777777]">
                Tổng thanh toán
              </span>
              <span className="text-xl font-medium text-[#171717]">
                {cart.totalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
