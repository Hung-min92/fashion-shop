import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useWishlist } from "../WishlistContext.jsx";

export default function WishlistPage() {
    const { items, loaded } = useWishlist();

    return (
        <div>
            <h1 className="mb-4 text-2xl font-black uppercase">
                Yêu thích{loaded ? ` (${items.length})` : ""}
            </h1>

            {!loaded && <p>Đang tải...</p>}

            {loaded && items.length === 0 && (
                <p>
                    Bạn chưa có sản phẩm yêu thích nào.{" "}
                    <Link to="/" className="underline">Xem sản phẩm</Link>
                </p>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {items.map((p) => (
                    <ProductCard key={p._id} product={p} />
                ))}
            </div>
        </div>
    );
}