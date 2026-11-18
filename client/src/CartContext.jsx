import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

const EMPTY_CART = { items: [], totalPrice: 0 };
const GUEST_KEY = "guestCart";

// ---- Giỏ của khách vãng lai: [{ productId, sku, quantity }] trong trình duyệt ----
function readGuest() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeGuest(list) {
  try {
    if (list.length) localStorage.setItem(GUEST_KEY, JSON.stringify(list));
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    // localStorage bị chặn: bỏ qua, giỏ chỉ sống trong phiên này
  }
}

const lineId = (productId, sku) => `${productId}:${sku}`;

async function previewGuest(list) {
  if (list.length === 0) return EMPTY_CART;
  const body = await api("/api/cart/preview", { method: "POST", body: { items: list } });
  return body.data;
}

// Gộp giỏ khách vào giỏ tài khoản. Xóa giỏ khách TRƯỚC khi gửi để tránh gộp hai lần
// (React StrictMode chạy effect hai lần ở máy dev).
let mergeInFlight = null;
function mergeGuestIntoAccount() {
  const guest = readGuest();
  if (guest.length === 0) return mergeInFlight;
  writeGuest([]);
  mergeInFlight = (async () => {
    for (const item of guest) {
      try {
        await api("/api/cart/items", { method: "POST", body: item });
      } catch {
        // món hết hàng hoặc ngừng bán thì bỏ qua
      }
    }
  })().finally(() => {
    mergeInFlight = null;
  });
  return mergeInFlight;
}

export function CartProvider({ children }) {
  const { user, ready } = useAuth();
  const isGuest = !user;
  const canShop = !user || user.role !== "viewer";

  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!canShop) return EMPTY_CART;
    if (isGuest) return previewGuest(readGuest());
    const body = await api("/api/cart");
    return body.data;
  }, [canShop, isGuest]);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadCart();
      setCart(data);
      return data;
    } catch {
      setCart(EMPTY_CART);
      return EMPTY_CART;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  useEffect(() => {
    if (!ready) return;
    let ignore = false;
    (async () => {
      try {
        if (user && canShop) await mergeGuestIntoAccount();
        const data = await loadCart();
        if (!ignore) setCart(data);
      } catch {
        if (!ignore) setCart(EMPTY_CART);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [ready, user, canShop, loadCart]);

  const addItem = useCallback(
    async ({ productId, sku, quantity = 1 }) => {
      if (!isGuest) {
        const body = await api("/api/cart/items", {
          method: "POST",
          body: { productId, sku, quantity },
        });
        setCart(body.data);
        return body.data;
      }

      const skuUp = sku.toUpperCase();
      const list = readGuest();
      const existing = list.find((i) => i.productId === productId && i.sku === skuUp);
      const next = existing
        ? list.map((i) => (i === existing ? { ...i, quantity: i.quantity + quantity } : i))
        : [...list, { productId, sku: skuUp, quantity }];

      const view = await previewGuest(next);
      const line = view.items.find((i) => i.itemId === lineId(productId, skuUp));
      if (!line || !line.available) throw new Error("Sản phẩm không còn khả dụng");
      if (line.quantity > line.stock) {
        throw new Error(
          `Không đủ hàng. Tồn kho: ${line.stock}, trong giỏ đã có: ${existing ? existing.quantity : 0}`
        );
      }
      writeGuest(next);
      setCart(view);
      return view;
    },
    [isGuest]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      if (!isGuest) {
        const body = await api(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          body: { quantity },
        });
        setCart(body.data);
        return body.data;
      }

      const next = readGuest().map((i) =>
        lineId(i.productId, i.sku) === itemId ? { ...i, quantity } : i
      );
      const view = await previewGuest(next);
      const line = view.items.find((i) => i.itemId === itemId);
      if (line && line.available && quantity > line.stock) {
        throw new Error(`Không đủ hàng. Tồn kho: ${line.stock}`);
      }
      writeGuest(next);
      setCart(view);
      return view;
    },
    [isGuest]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!isGuest) {
        const body = await api(`/api/cart/items/${itemId}`, { method: "DELETE" });
        setCart(body.data);
        return body.data;
      }

      const next = readGuest().filter((i) => lineId(i.productId, i.sku) !== itemId);
      const view = await previewGuest(next);
      writeGuest(next);
      setCart(view);
      return view;
    },
    [isGuest]
  );

  const clearCart = useCallback(async () => {
    if (!isGuest) {
      const body = await api("/api/cart", { method: "DELETE" });
      setCart(body.data);
      return body.data;
    }
    writeGuest([]);
    setCart(EMPTY_CART);
    return EMPTY_CART;
  }, [isGuest]);

  const resetLocalCart = useCallback(() => {
    writeGuest([]);
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
        isGuest,
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