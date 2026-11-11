import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";

const LINKS = [
  { to: "/admin", label: "Thống kê" },
  { to: "/admin/orders", label: "Đơn hàng" },
  { to: "/admin/products", label: "Sản phẩm" },
];

export default function AdminNav({ title, subtitle }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isViewer = user?.role === "viewer";

  return (
    <div className="mb-8 border-b border-[#EAEAEA] pb-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
            Admin Console
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal text-[#171717]">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-xs text-[#777777]">{subtitle}</p>}
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Điều hướng quản trị">
          {LINKS.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`border px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                  active
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {isViewer && (
        <div className="mt-4 border border-[#B9A58A] bg-[#F5F4F0] px-4 py-2.5 text-xs text-[#202020]">
          Chế độ chỉ xem (Demo Viewer): Các thao tác chỉnh sửa đã bị vô hiệu hóa và thông tin cá nhân khách hàng được ẩn bảo mật.
        </div>
      )}
    </div>
  );
}

