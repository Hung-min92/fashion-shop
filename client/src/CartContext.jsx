import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

const EMPTY_CART = { items: [], totalPrice: 0 };

export function CartProvider({ children }) {
  const { user, ready } = useAuth();
  const canShop = Boolean(user && user.role !== "viewer");

  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!canShop) {
      setCart(EMPTY_CART);
      return EMPTY_CART;
    }
    setLoading(true);
    try {
      const body = await api("/api/cart");
      setCart(body.data);
      return body.data;
    } catch {
      setCart(EMPTY_CART);
      return EMPTY_CART;
    } finally {
      setLoading(false);
    }
  }, [canShop]);

  useEffect(() => {
    if (!ready) return;
    if (!canShop) {
      Promise.resolve().then(() => setCart(EMPTY_CART));
      return;
    }
    let ignore = false;
    api("/api/cart")
      .then((body) => {
        if (!ignore) setCart(body.data);
      })
      .catch(() => {
        if (!ignore) setCart(EMPTY_CART);
      });
    return () => {
      ignore = true;
    };
  }, [ready, canShop, user?.id]);

  const addItem = useCallback(async ({ productId, sku, quantity = 1 }) => {
    const body = await api("/api/cart/items", {
      method: "POST",
      body: { productId, sku, quantity },
    });
    setCart(body.data);
    return body.data;
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const body = await api(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      body: { quantity },
    });
    setCart(body.data);
    return body.data;
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const body = await api(`/api/cart/items/${itemId}`, {
      method: "DELETE",
    });
    setCart(body.data);
    return body.data;
  }, []);

  const clearCart = useCallback(async () => {
    const body = await api("/api/cart", { method: "DELETE" });
    setCart(body.data);
    return body.data;
  }, []);

  const resetLocalCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        canShop,
        refreshCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        resetLocalCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

