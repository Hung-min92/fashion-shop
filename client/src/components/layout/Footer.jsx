import { Link } from "react-router-dom";
import { shopInfo } from "../../config/shopInfo.js";

const linkClass = "transition hover:text-[#171717]";

export default function Footer() {
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
              {shopInfo.name}
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-[#777777]">
              Trang phục thiết yếu mang tinh thần tối giản đương đại. Tập trung vào phom dáng
              chuẩn mực, đường cắt tinh tế và chất liệu bền vững cho nhịp sống hằng ngày.
            </p>
            <div className="mt-5 space-y-1 text-xs text-[#777777]">
              <p>Flagship: {shopInfo.address}</p>
              <p>
                Hotline: {shopInfo.phone} ({shopInfo.hours})
              </p>
              <p>Email: {shopInfo.email}</p>
            </div>
          </div>

          {/* Column 2: Customer Service */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#171717]">
              Dịch vụ khách hàng
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#777777]">
              <li>
                <Link to="/policy/shipping" className={linkClass}>
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/policy/returns" className={linkClass}>
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/order-lookup" className={linkClass}>
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/orders" className={linkClass}>
                  Đơn hàng của tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  Liên hệ
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
                <Link to="/products" className={linkClass}>
                  Bộ sưu tập mới nhất
                </Link>
              </li>
              <li>
                <Link to="/products?sort=newest" className={linkClass}>
                  New Arrivals 2026
                </Link>
              </li>
              <li>
                <Link to="/policy/privacy" className={linkClass}>
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/policy/terms" className={linkClass}>
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#171717]">
              Kết nối với chúng tôi
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#777777]">
              {[
                ["Instagram", "https://instagram.com"],
                ["Facebook", "https://facebook.com"],
                ["Pinterest", "https://pinterest.com"],
                ["TikTok", "https://tiktok.com"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#EAEAEA] pt-8 text-[11px] text-[#777777] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {shopInfo.name}. All rights reserved.
            {shopInfo.isDemo && " Website demo phục vụ học tập, không có giao dịch thật."}
          </p>
          <p className="uppercase tracking-[0.14em]">
            Minimalist Essentials · Thanh toán khi nhận hàng (COD)
          </p>
        </div>
      </div>
    </footer>
  );
}