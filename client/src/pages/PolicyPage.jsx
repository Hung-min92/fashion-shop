import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { shopInfo } from "../config/shopInfo.js";
import { POLICIES } from "../content/policies.js";

export default function PolicyPage() {
  const { slug } = useParams();
  const policy = POLICIES.find((p) => p.slug === slug);

  useEffect(() => {
    if (policy) document.title = `${policy.title} | ${shopInfo.name}`;
    return () => {
      document.title = shopInfo.name;
    };
  }, [policy]);

  if (!policy) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-serif text-2xl text-[#171717]">Không tìm thấy trang</h1>
        <Link to="/" className="mt-6 inline-block text-xs underline underline-offset-4">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8 border-b border-[#EAEAEA] pb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">{shopInfo.name}</p>
        <h1 className="mt-1 font-serif text-3xl font-normal text-[#171717]">{policy.title}</h1>
      </div>

      {shopInfo.isDemo && (
        <div className="mb-8 border border-[#B9A58A] bg-[#B9A58A]/10 px-4 py-3 text-xs leading-relaxed text-[#202020]">
          Đây là website demo phục vụ học tập và trình bày dự án. Nội dung chính sách mang tính minh
          họa, không có giao dịch thật. Vui lòng không nhập thông tin cá nhân thật.
        </div>
      )}

      <div className="space-y-8">
        {policy.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-[#171717]">
              {s.heading}
            </h2>
            {s.paragraphs?.map((text) => (
              <p key={text} className="mt-3 text-sm leading-relaxed text-[#444444]">
                {text}
              </p>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#444444]">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-[#EAEAEA] pt-5 text-xs text-[#777777]">
        Cần hỗ trợ thêm?{" "}
        <Link to="/contact" className="underline underline-offset-4">
          Liên hệ {shopInfo.name}
        </Link>
      </p>
    </div>
  );
}