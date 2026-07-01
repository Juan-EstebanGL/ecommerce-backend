import { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "../api/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  async function refreshCartCount() {
    try {
      const response = await getCart();
      const items = response.data?.items || [];
      const total = items.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
