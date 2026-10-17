import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("form-cart") || "[]"));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("form-wishlist") || "[]"));
  const [toasts, setToasts] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [coupon, setCoupon] = useState(() => JSON.parse(localStorage.getItem("form-coupon") || "null"));

  useEffect(() => localStorage.setItem("form-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("form-wishlist", JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem("form-coupon", JSON.stringify(coupon)), [coupon]);

  const triggerToast = (title, subtitle = "", image = "") => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev.slice(-2), { id, title, subtitle, image }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  const addToCart = (product, quantity = 1) => {
    setCart(old => {
      const found = old.find(i => i.id === product.id);
      if (found) return old.map(i => i.id === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 99) } : i);
      return [...old, { ...product, quantity }];
    });
    triggerToast(`Added to bag`, `${product.name} (×${quantity})`, product.image);
  };

  const updateQuantity = (id, quantity) => setCart(old => quantity < 1 ? old.filter(i => i.id !== id) : old.map(i => i.id === id ? { ...i, quantity: Math.min(quantity, i.stock || 99) } : i));
  const removeFromCart = id => setCart(old => old.filter(i => i.id !== id));

  const toggleWishlist = (id, product = null) => {
    setWishlist(old => {
      const exists = old.includes(id);
      if (exists) {
        triggerToast("Removed from wishlist", product?.name || "");
        return old.filter(x => x !== id);
      }
      triggerToast("Saved to wishlist", product?.name || "Ready when you are", product?.image || "");
      return [...old, id];
    });
  };

  const clearCart = () => setCart([]);

  const applyCoupon = (code = "") => {
    const clean = code.trim().toUpperCase();
    if (clean === "FORM10") {
      setCoupon({ code: "FORM10", percent: 10, note: "10% off your order" });
      triggerToast("Coupon applied!", "10% discount has been applied.");
      return { success: true, message: "10% coupon applied!" };
    }
    if (clean === "WELCOME20") {
      setCoupon({ code: "WELCOME20", percent: 20, note: "20% welcome discount" });
      triggerToast("Coupon applied!", "20% discount has been applied.");
      return { success: true, message: "20% coupon applied!" };
    }
    return { success: false, message: "Invalid promo code. Try FORM10 or WELCOME20" };
  };

  const removeCoupon = () => {
    setCoupon(null);
    triggerToast("Coupon removed");
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const discount = useMemo(() => coupon ? Math.round((subtotal * coupon.percent) / 100) : 0, [subtotal, coupon]);
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 199;
  const total = Math.max(0, subtotal - discount + shipping);

  const value = {
    cart,
    wishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    clearCart,
    subtotal,
    discount,
    shipping,
    total,
    itemCount: cart.reduce((n, i) => n + i.quantity, 0),
    toasts,
    triggerToast,
    removeToast,
    quickViewProduct,
    setQuickViewProduct,
    coupon,
    applyCoupon,
    removeCoupon
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
