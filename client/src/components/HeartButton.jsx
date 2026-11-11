import { useState } from "react";
import { useWishlist } from "../WishlistContext.jsx";

export default function HeartButton({ product, className = "" }) {
    const { isCustomer, ids, toggle } = useWishlist();
    const [busy, setBusy] = useState(false);

    if (!isCustomer) return null;

    const wished = ids.has(product._id);

    async function handleClick() {
        if (busy) return;
        setBusy(true);
        try {
            await toggle(product);
        } catch (err) {
            window.alert(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            aria-label={wished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
            aria-pressed={wished}
            className={`flex h-9 w-9 items-center justify-center border-2 border-black text-lg leading-none transition disabled:opacity-60 ${wished ? "bg-[#c6ff00]" : "bg-white"
                } ${className}`}
        >
            {wished ? "♥" : "♡"}
        </button>
    );
}