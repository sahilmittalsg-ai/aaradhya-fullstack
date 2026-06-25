import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import type { CartItem, Product } from "../types";

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  isCartOpen: boolean;
  addItem: (product: Product | CartItem, quantity?: number, openDrawer?: boolean) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  function persist(nextItems: CartItem[]) {
    setItems(nextItems);
    localStorage.setItem("cart", JSON.stringify(nextItems));
  }

  function addItem(product: Product | CartItem, quantity = 1, openDrawer = true) {
    const selectedSize =
      "selectedSize" in product && product.selectedSize
        ? product.sizeOptions?.find((size) => size.value === product.selectedSize)
        : undefined;
    const maxQuantity = Math.max(selectedSize?.stock || product.stock || quantity, 0);
    const cartKey =
      "cartKey" in product && product.cartKey
        ? product.cartKey
        : `${product.slug}-${"selectedSize" in product ? product.selectedSize || "default" : "default"}-${
            "selectedAddOns" in product && product.selectedAddOns?.length ? product.selectedAddOns.map((item) => item.code).join("-") : "no-plan"
          }`;
    const existing = items.find((item) => (item.cartKey || item.slug) === cartKey);
    const nextItems = existing
      ? items.map((item) =>
          (item.cartKey || item.slug) === cartKey ? { ...item, quantity: Math.min(item.quantity + quantity, maxQuantity) } : item
        )
      : [...items, { ...product, cartKey, quantity: Math.min(quantity, maxQuantity) } as CartItem].filter((item) => item.quantity > 0);
    persist(nextItems);
    if (openDrawer) setIsCartOpen(true);
  }

  function removeItem(key: string) {
    persist(items.filter((item) => (item.cartKey || item.slug) !== key));
  }

  function updateQuantity(key: string, quantity: number) {
    persist(
      items
        .map((item) => ((item.cartKey || item.slug) === key ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    persist([]);
  }

  function openCart() {
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.price + (item.selectedAddOns || []).reduce((addOnSum, addOn) => addOnSum + addOn.price, 0)) * item.quantity,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, subtotal, isCartOpen, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
