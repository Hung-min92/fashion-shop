import { Link } from "react-router-dom";
import Stars from "./Stars.jsx";
import HeartButton from "./HeartButton.jsx";

export default function ProductCard({ product: p }) {
    return (
        <div className="relative">
            <Link
                to={`/products/${p._id}`}
                className="group block border-2 border-black bg-white transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
            >
                <div className="aspect-[3/4] overflow-hidden border-b-2 border-black bg-gray-100">
                    {p.images?.[0] ? (
                        <img
                            src={p.images[0]}
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                            Chưa có ảnh
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                        {p.category?.name}
                    </p>
                    <p className="mt-1 line-clamp-2 font-black uppercase leading-tight">
                        {p.name}
                    </p>
                    {p.ratingCount > 0 && (
                        <p className="mt-1 flex items-center gap-1 text-xs">
                            <Stars value={p.ratingAverage} size="text-sm" />
                            <span className="text-gray-500">({p.ratingCount})</span>
                        </p>
                    )}
                    <p className="mt-2 inline-block bg-[#c6ff00] px-2 py-0.5 text-sm font-black">
                        {p.price.toLocaleString("vi-VN")}đ
                    </p>
                </div>
            </Link>
            <HeartButton product={p} className="absolute right-2 top-2" />
        </div>
    );
}