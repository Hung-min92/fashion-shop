import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useWishlist } from "../WishlistContext.jsx";

export default function WishlistPage() {
  const { items, loaded } = useWishlist();

  return (
    <div className="animate-fade-in">
      <div className="mb-8 border-b border-[#EAEAEA] pb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">Saved Items</p>
        <h1 className="mt-1 font-serif text-3xl font-normal text-[#171717]">
          Danh sách yêu thích{loaded ? ` (${items.length})` : ""}
        </h1>
      </div>

      {!loaded && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] w-full bg-[#F5F4F0]" />
              <div className="mt-3 h-4 w-3/4 bg-[#F5F4F0]" />
            </div>
          ))}
        </div>
      )}

      {loaded && items.length === 0 && (
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="font-serif text-2xl text-[#171717]">Chưa có sản phẩm yêu thích</p>
          <p className="mt-2 text-sm text-[#777777]">
            Nhấn vào biểu tượng trái tim trên sản phẩm bạn quan tâm để lưu lại tại đây.
          </p>
          <Link
            to="/products"
            className="mt-7 inline-block bg-[#171717] px-7 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white"
          >
            Xem bộ sưu tập
          </Link>
        </div>
      )}

      {loaded && items.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
