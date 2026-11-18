import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

export default function OrderSuccessPage() {
    const [params] = useSearchParams();
    const code = params.get("code");
    const [copied, setCopied] = useState(false);

    if (!code) return <Navigate to="/" replace />;

    async function copy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
        } catch {
            // trình duyệt chặn clipboard: khách tự chép tay
        }
    }

    return (
        <div className="mx-auto max-w-md py-12 text-center animate-fade-in">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Đặt hàng thành công</p>
            <h1 className="mt-2 font-serif text-3xl text-[#171717]">Cảm ơn bạn đã mua hàng</h1>
            <p className="mt-3 text-sm text-[#777777]">
                Hãy lưu lại mã đơn bên dưới. Bạn sẽ cần mã này cùng số điện thoại đã đặt hàng để tra cứu
                hoặc hủy đơn.
            </p>

            <div className="mt-8 border border-[#171717] bg-[#F5F4F0] px-6 py-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#777777]">Mã đơn hàng</p>
                <p className="mt-2 select-all font-mono text-2xl font-medium tracking-widest text-[#171717]">
                    {code}
                </p>
                <button
                    type="button"
                    onClick={copy}
                    className="mt-4 border border-[#171717] bg-white px-5 py-2 text-xs uppercase tracking-[0.14em] transition hover:bg-[#171717] hover:text-white"
                >
                    {copied ? "Đã sao chép" : "Sao chép mã"}
                </button>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                    to={`/order-lookup?code=${encodeURIComponent(code)}`}
                    className="bg-[#171717] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white"
                >
                    Tra cứu đơn hàng
                </Link>
                <Link
                    to="/products"
                    className="border border-[#EAEAEA] px-6 py-3 text-xs uppercase tracking-[0.14em] text-[#202020] transition hover:border-[#171717]"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        </div>
    );
}