import { useState } from "react";
import { Link } from "react-router-dom";
import { getColorHex } from "../utils/colorUtils.js";
import HeartButton from "./HeartButton.jsx";
import QuickViewModal from "./QuickViewModal.jsx";
import Stars from "./Stars.jsx";

function isRecentProduct(createdAt) {
  if (!createdAt) return false;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= 14;
}

export default function ProductCard({ product: p, badge }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const primaryImage = p.images?.[0];
  const secondaryImage = p.images?.[1];
  const uniqueColors = [...new Set((p.variants || []).map((v) => v.color))];
  const showNewBadge = badge === "NEW" || (badge !== false && isRecentProduct(p.createdAt));

  return (
    <>
      <div className="group relative flex flex-col">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0]">
          <Link to={`/products/${p._id}`} className="block h-full w-full">
            {primaryImage ? (
              <>
                <img
                  src={primaryImage}
                  alt={p.name}
                  loading="lazy"
                  className={`h-full w-full object-cover transition duration-500 ease-out ${
                    secondaryImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
                  }`}
                />
                {secondaryImage && (
                  <img
                    src={secondaryImage}
                    alt={`${p.name} — góc nhìn khác`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 ease-out group-hover:opacity-100"
                  />
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-[11px] uppercase tracking-[0.2em] text-[#777777]">
                Chưa có ảnh
              </div>
            )}
          </Link>

          {/* Badge */}
          {showNewBadge && (
            <span className="pointer-events-none absolute left-3 top-3 bg-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#171717]">
              New
            </span>
          )}

          {/* Wishlist Button */}
          <HeartButton
            product={p}
            className="absolute right-3 top-3 h-8 w-8 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          />

          {/* Quick View Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="absolute bottom-3 left-3 right-3 hidden bg-white/95 py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-[#171717] backdrop-blur-sm transition-all duration-300 hover:bg-[#171717] hover:text-white md:block md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            Xem nhanh
          </button>
        </div>

        {/* Product Details */}
        <Link to={`/products/${p._id}`} className="mt-3.5 block space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#777777]">
              {p.category?.name}
            </p>
            {p.ratingCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-[#777777]">
                <Stars value={p.ratingAverage} size="text-[11px]" />
                <span>({p.ratingCount})</span>
              </span>
            )}
          </div>

          <h3 className="line-clamp-1 text-sm font-normal text-[#202020] transition-colors group-hover:text-[#777777]">
            {p.name}
          </h3>

          <div className="flex items-center justify-between pt-0.5">
            <p className="text-sm font-medium text-[#171717]">
              {p.price.toLocaleString("vi-VN")}đ
            </p>

            {uniqueColors.length > 0 && (
              <div className="flex items-center gap-1.5" aria-label="Màu sắc có sẵn">
                {uniqueColors.slice(0, 4).map((color) => {
                  const hex = getColorHex(color);
                  return (
                    <span
                      key={color}
                      title={color}
                      className="h-2.5 w-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: hex || "#D4D4D4" }}
                    />
                  );
                })}
                {uniqueColors.length > 4 && (
                  <span className="text-[10px] text-[#777777]">
                    +{uniqueColors.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>

      {quickViewOpen && (
        <QuickViewModal product={p} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
