import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, apiGet } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function ProductDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [size, setSize] = useState("");
    const [color, setColor] = useState("");
    const [msg, setMsg] = useState("");
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        setLoading(true);
        setActiveImage(0);
        apiGet(`/api/products/${id}`)
            .then((body) => setProduct(body.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-600">Lỗi: {error}</p>;
    if (!product) return null;

    const sizes = [...new Set(product.variants.map((v) => v.size))];
    const colors = [...new Set(product.variants.map((v) => v.color))];
    const selected = product.variants.find(
        (v) => v.size === size && v.color === color
    );

    async function addToCart() {
        if (!user) return navigate("/login");
        try {
            await api("/api/cart/items", {
                method: "POST",
                body: { productId: product._id, sku: selected.sku, quantity: 1 },
            });
            setMsg("Đã thêm vào giỏ hàng");
        } catch (err) {
            setMsg(err.message);
        }
    }

    return (
        <div>
            <Link to="/" className="text-sm text-gray-500 hover:underline">
                ← Quay lại
            </Link>

            <div className="mt-4 grid gap-8 md:grid-cols-2">
                <div>
                    <div className="flex h-[480px] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                        {product.images?.length ? (
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <span className="text-gray-400">Chưa có ảnh</span>
                        )}
                    </div>

                    {product.images?.length > 1 && (
                        <div className="mt-2 flex gap-2">
                            {product.images.map((url, i) => (
                                <button
                                    key={url}
                                    type="button"
                                    onClick={() => setActiveImage(i)}
                                    className={`h-20 w-16 overflow-hidden border-2 ${i === activeImage ? "border-black" : "border-transparent"
                                        }`}
                                >
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <p className="my-2 text-xl font-semibold">
                        {product.price.toLocaleString("vi-VN")}đ
                    </p>
                    <p className="mb-4 text-gray-600">{product.description}</p>

                    <p className="mb-1 font-medium">Size</p>
                    <div className="mb-4 flex gap-2">
                        {sizes.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSize(s)}
                                className={`rounded border px-3 py-1 ${size === s ? "bg-black text-white" : "bg-white"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <p className="mb-1 font-medium">Màu</p>
                    <div className="mb-4 flex gap-2">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`rounded border px-3 py-1 ${color === c ? "bg-black text-white" : "bg-white"
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {size && color && (
                        <p
                            className={`mb-4 text-sm ${selected && selected.stock === 0 ? "text-red-600" : ""
                                }`}
                        >
                            {selected
                                ? selected.stock > 0
                                    ? `Còn ${selected.stock} sản phẩm`
                                    : "Hết hàng"
                                : "Phiên bản này không có"}
                        </p>
                    )}

                    <button
                        disabled={!selected || selected.stock === 0}
                        onClick={addToCart}
                        className="rounded bg-black px-4 py-2 text-white disabled:opacity-40"
                    >
                        Thêm vào giỏ
                    </button>
                    {msg && <p className="mt-2 text-sm">{msg}</p>}
                </div>
            </div>
        </div>
    );
}