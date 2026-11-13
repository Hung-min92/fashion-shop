import { useState } from "react";
import { Link } from "react-router-dom";
import { CloseIcon } from "../Icons.jsx";

const POLICIES = {
  shipping: {
    title: "Chính sách vận chuyển",
    body: [
      "Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng từ 500.000đ.",
      "Thời gian giao hàng dự kiến từ 2–4 ngày làm việc tại khu vực nội thành và 3–6 ngày đối với các tỉnh thành khác.",
      "Đơn hàng được đóng gói tối giản, thân thiện môi trường và hỗ trợ thanh toán khi nhận hàng (COD).",
    ],
  },
  returns: {
    title: "Chính sách đổi trả",
    body: [
      "Hỗ trợ đổi size hoặc hoàn trả trong vòng 14 ngày kể từ ngày nhận hàng.",
      "Sản phẩm đổi trả cần còn nguyên tem mác, chưa qua giặt ủi hoặc sử dụng.",
      "Bạn có thể hủy đơn hàng đang ở trạng thái 'Chờ xử lý' trực tiếp tại trang Đơn hàng của tôi.",
    ],
  },
  privacy: {
    title: "Chính sách bảo mật",
    body: [
      "Mọi thông tin cá nhân, địa chỉ giao hàng và lịch sử đơn hàng của bạn đều được mã hóa và bảo mật tuyệt đối.",
      "Chúng tôi chỉ sử dụng dữ liệu liên hệ để xử lý đơn hàng, giao vận và thông báo ưu đãi khi bạn đăng ký.",
    ],
  },
  terms: {
    title: "Điều khoản sử dụng",
    body: [
      "Giá sản phẩm được niêm yết bằng Việt Nam Đồng (VNĐ) và đã bao gồm thuế VAT.",
      "Tồn kho thực tế được kiểm tra và giữ ngay tại thời điểm xác nhận đặt hàng thành công.",
    ],
  },
};

export default function Footer() {
  const [policyKey, setPolicyKey] = useState(null);
  const policy = policyKey ? POLICIES[policyKey] : null;

  return (
    <footer className="border-t border-[#EAEAEA] bg-white text-[#202020]">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand Information */}
          <div>
            <Link
              to="/"
              className="text-sm font-semibold uppercase tracking-[0.22em] text-[#171717]"
            >
              GIN SHOP
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-[#777777]">
              Trang phục thiết yếu mang tinh thần tối giản đương đại. Tập trung vào phom dáng
              chuẩn mực, đường cắt tinh tế và chất liệu bền vững cho nhịp sống hằng ngày.
            </p>
            <div className="mt-5 space-y-1 text-xs text-[#777777]">
              <p>Flagship: 128 Đồng Khởi, Quận 1, TP. HCM</p>
              <p>Hotline: 1900 6868 (09:00 – 21:00)</p>
              <p>Email: care@fashionshop.vn</p>
            </div>
          </div>

          {/* Column 2: Customer Service */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#171717]">
              Dịch vụ khách hàng
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#777777]">
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyKey("shipping")}
                  className="transition hover:text-[#171717]"
                >
                  Chính sách vận chuyển
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyKey("returns")}
                  className="transition hover:text-[#171717]"
                >
                  Chính sách đổi trả
                </button>
              </li>
              <li>
                <Link to="/orders" className="transition hover:text-[#171717]">
                  Theo dõi đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-[#171717]">
                  Giỏ hàng &amp; Thanh toán COD
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About Us */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#171717]">
              Về chúng tôi
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#777777]">
              <li>
                <Link to="/products" className="transition hover:text-[#171717]">
                  Bộ sưu tập mới nhất
                </Link>
              </li>
              <li>
                <Link to="/products?sort=newest" className="transition hover:text-[#171717]">
                  New Arrivals 2026
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyKey("privacy")}
                  className="transition hover:text-[#171717]"
                >
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyKey("terms")}
                  className="transition hover:text-[#171717]"
                >
                  Điều khoản sử dụng
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#171717]">
              Kết nối với chúng tôi
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#777777]">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#171717]"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#171717]"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#171717]"
                >
                  Pinterest
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#171717]"
                >
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#EAEAEA] pt-8 text-[11px] text-[#777777] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} GIN SHOP. All rights reserved.</p>
          <p className="uppercase tracking-[0.14em]">
            Minimalist Essentials · Thanh toán khi nhận hàng (COD)
          </p>
        </div>
      </div>

      {/* Policy Modal */}
      {policy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="animate-fade-in fixed inset-0 bg-black/40"
            onClick={() => setPolicyKey(null)}
          />
          <div className="animate-fade-in-up relative z-10 w-full max-w-md border border-[#EAEAEA] bg-white p-8">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-serif text-xl text-[#171717]">{policy.title}</h4>
              <button
                type="button"
                onClick={() => setPolicyKey(null)}
                aria-label="Đóng"
                className="p-1 text-[#777777] hover:text-[#171717]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#777777]">
              {policy.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPolicyKey(null)}
              className="mt-6 w-full bg-[#171717] py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#202020]"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}

