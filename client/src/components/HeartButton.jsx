import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useWishlist } from "../WishlistContext.jsx";
import { useToast } from "../ToastContext.jsx";
import { HeartIcon } from "./Icons.jsx";

export default function HeartButton({ product, className = "" }) {
  const { user } = useAuth();
  const { isCustomer, ids, toggle } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // Admin & Viewer không sử dụng wishlist cá nhân
  if (user && !isCustomer) return null;

  const wished = isCustomer && ids.has(product._id);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      navigate("/login");
      return;
    }

    if (busy) return;
    setBusy(true);
    try {
      await toggle(product);
      showToast(wished ? "Đã bỏ khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
    } catch (err) {
      showToast(err.message, { type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={wished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      aria-pressed={wished}
      className={`flex h-9 w-9 items-center justify-center border border-[#EAEAEA] bg-white/90 text-[#171717] backdrop-blur-sm transition hover:border-[#171717] disabled:opacity-50 ${className}`}
    >
      <HeartIcon
        className={`h-4 w-4 transition ${wished ? "text-[#171717]" : "text-[#202020]"}`}
        filled={wished}
      />
    </button>
  );
}
