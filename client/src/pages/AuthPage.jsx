import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useToast } from "../ToastContext.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (isRegister && !form.name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (!form.email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (isRegister && form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (!isRegister && !form.password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(form.name.trim(), form.email.trim(), form.password);
        showToast("Đăng ký tài khoản thành công");
      } else {
        await login(form.email.trim(), form.password);
        showToast("Đăng nhập thành công");
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-[#EAEAEA] bg-white px-4 py-3 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717]";

  return (
    <div className="mx-auto max-w-md py-8 sm:py-14 animate-fade-in">
      <div className="border border-[#EAEAEA] bg-white p-8 sm:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
          {isRegister ? "Join Us" : "Welcome Back"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-normal text-[#171717]">
          {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#777777]">
          {isRegister
            ? "Đăng ký để lưu sản phẩm yêu thích, đặt hàng nhanh và theo dõi đơn hàng."
            : "Đăng nhập vào tài khoản FASHION SHOP của bạn."}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-xs text-[#777777]">Họ và tên</label>
              <input
                className={inputClass}
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={set("name")}
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs text-[#777777]">Email</label>
            <input
              type="email"
              className={inputClass}
              placeholder="name@example.com"
              value={form.email}
              onChange={set("email")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[#777777]">Mật khẩu</label>
            <input
              type="password"
              className={inputClass}
              placeholder={isRegister ? "Tối thiểu 8 ký tự" : "Nhập mật khẩu"}
              value={form.password}
              onChange={set("password")}
            />
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full bg-[#171717] py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#202020] disabled:opacity-50"
          >
            {submitting
              ? "Đang xử lý..."
              : isRegister
              ? "Tạo tài khoản"
              : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 border-t border-[#EAEAEA] pt-5 text-center text-xs text-[#777777]">
          {isRegister ? (
            <>
              Đã có tài khoản?{" "}
              <Link to="/login" className="font-medium text-[#171717] underline underline-offset-4">
                Đăng nhập
              </Link>
            </>
          ) : (
            <>
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-[#171717] underline underline-offset-4"
              >
                Đăng ký ngay
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
