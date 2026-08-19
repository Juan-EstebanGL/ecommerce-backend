import { createContext, useContext, useCallback, useState } from "react";
import { getCart } from "../api/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await getCart();
      const items = response.data?.items || [];
      const total = items.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components -- Patrón estándar de React Context: el hook del consumidor vive en el mismo archivo que el Provider (ver https://react.dev/reference/react/createContext). Separar el hook a src/hooks/ sería un refactor de otra fase. */
export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}