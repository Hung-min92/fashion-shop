import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Tự động cuộn lên đầu trang (top: 0, left: 0) mỗi khi chuyển đổi route (URL thay đổi)
 * Giải quyết triệt để lỗi khi click sản phẩm từ trang chủ/danh mục mà bị tụt lùi vị trí scroll
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, search]);

  return null;
}

