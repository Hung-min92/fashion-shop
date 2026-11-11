import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const isCustomer = user?.role === "customer";
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!isCustomer) {
            setItems([]);
            setLoaded(false);
            return;
        }
        let ignore = false;
        api("/api/wishlist")
            .then((body) => {
                if (!ignore) {
                    setItems(body.data);
                    setLoaded(true);
                }
            })
            .catch(() => { });
        return () => {
            ignore = true;
        };
    }, [isCustomer, user?.email]);

    const ids = new Set(items.map((p) => p._id));

    // Cập nhật giao diện ngay (lạc quan), lỗi thì khôi phục
    async function toggle(product) {
        const wished = ids.has(product._id);
        const previous = items;
        setItems(
            wished ? items.filter((p) => p._id !== product._id) : [product, ...items]
        );
        try {
            await api(`/api/wishlist/${product._id}`, {
                method: wished ? "DELETE" : "POST",
            });
        } catch (err) {
            setItems(previous);
            throw err;
        }
    }

    return (
        <WishlistContext.Provider value={{ items, ids, isCustomer, loaded, toggle }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}