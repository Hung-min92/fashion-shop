import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [error, setError] = useState("");

    async function load() {
        try {
            const body = await api("/api/cart");
            setCart(body.data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function changeQty(itemId, quantity) {
        if (quantity < 1) return;
        setError("");
        try {
            const body = await api(`/api/cart/items/${itemId}`, {
                method: "PATCH",
                body: { quantity },
            });
            setCart(body.data);
        } catch (err) {
            setError(err.message);
        }
    }

    async function remove(itemId) {
        const body = await api(`/api/cart/items/${itemId}`, { method: "DELETE" });
        setCart(body.data);
    }

    if (!cart && !error) return <p>Đang tải giỏ hàng...</p>;
    if (!cart) return <p className="text-red-600">Lỗi: {error}</p>;
    if (cart.items.length === 0) {
        return (
            <p>
                Giỏ hàng trống. <Link to="/" className="underline">Tiếp tục mua sắm</Link>
            </p>
        );
    }

    const hasProblem = cart.items.some((i) => !i.available);

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>
            {error && <p className="mb-2 text-red-600">{error}</p>}

            <div className="space-y-3">
                {cart.items.map((i) => (
                    <div key={i.itemId} className="flex items-center justify-between rounded border bg-white p-4">
                        <div>
                            <p className="font-medium">{i.name ?? "Sản phẩm không còn bán"}</p>
                            <p className="text-sm text-gray-500">{i.size} / {i.color}</p>
                            {i.issue && <p className="text-sm text-red-600">{i.issue}</p>}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button onClick={() => changeQty(i.itemId, i.quantity - 1)} className="rounded border px-2">-</button>
                                <span>{i.quantity}</span>
                                <button onClick={() => changeQty(i.itemId, i.quantity + 1)} className="rounded border px-2">+</button>
                            </div>
                            <p className="w-28 text-right font-semibold">
                                {i.available ? `${i.lineTotal.toLocaleString("vi-VN")}đ` : "-"}
                            </p>
                            <button onClick={() => remove(i.itemId)} className="text-sm text-red-600">Xóa</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
                <p className="text-xl font-bold">
                    Tổng: {cart.totalPrice.toLocaleString("vi-VN")}đ
                </p>
                {hasProblem ? (
                    <p className="text-sm text-red-600">Hãy xóa hoặc chỉnh các món có vấn đề trước khi đặt hàng.</p>
                ) : (
                    <Link to="/checkout" className="rounded bg-black px-4 py-2 text-white">Đặt hàng</Link>
                )}
            </div>
        </div>
    );
}