import { useEffect } from "react";
import { Link } from "react-router-dom";
import { shopInfo } from "../config/shopInfo.js";
import { POLICY_LINKS } from "../content/policies.js";

export default function ContactPage() {
  useEffect(() => {
    document.title = `Liên hệ | ${shopInfo.name}`;
    return () => {
      document.title = shopInfo.name;
    };
  }, []);

  const rows = [
    ["Email", shopInfo.email],
    ["Điện thoại", shopInfo.phone],
    ["Địa chỉ", shopInfo.address],
    ["Giờ làm việc", shopInfo.hours],
  ];

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8 border-b border-[#EAEAEA] pb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Contact</p>
        <h1 className="mt-1 font-serif text-3xl font-normal text-[#171717]">Liên hệ</h1>
        <p className="mt-2 text-sm text-[#777777]">
          Bạn cần hỗ trợ về đơn hàng, đổi trả hoặc sản phẩm? Hãy liên hệ {shopInfo.name}.
        </p>
      </div>

      {shopInfo.isDemo && (
        <div className="mb-8 border border-[#B9A58A] bg-[#B9A58A]/10 px-4 py-3 text-xs leading-relaxed text-[#202020]">
          Đây là website demo, thông tin liên hệ dưới đây chỉ mang tính minh họa.
        </div>
      )}

      <dl className="divide-y divide-[#EAEAEA] border border-[#EAEAEA] bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-[#777777]">{label}</dt>
            <dd className="text-sm text-[#171717] sm:col-span-3">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          to="/order-lookup"
          className="border border-[#171717] bg-white px-5 py-3.5 text-center text-xs font-medium uppercase tracking-[0.14em] transition hover:bg-[#171717] hover:text-white"
        >
          Tra cứu đơn hàng
        </Link>
        <Link
          to="/policy/returns"
          className="border border-[#EAEAEA] px-5 py-3.5 text-center text-xs uppercase tracking-[0.14em] transition hover:border-[#171717]"
        >
          Chính sách đổi trả
        </Link>
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#777777]">
        {POLICY_LINKS.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="underline underline-offset-4 hover:text-[#171717]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}