import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { CartItem, Product } from "../types";

type CartStateValue = {
  items: CartItem[];
  subtotal: number;
  isCartOpen: boolean;
};

type CartActionsValue = {
  addItem: (product: Product | CartItem, quantity?: number, openDrawer?: boolean) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartStateContext = createContext<CartStateValue | undefined>(undefined);
const CartActionsContext = createContext<CartActionsValue | undefined>(undefined);

function saveCart(nextItems: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(nextItems));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((product: Product | CartItem, quantity = 1, openDrawer = true) => {
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

    setItems((current) => {
      const existing = current.find((item) => (item.cartKey || item.slug) === cartKey);
      const nextItems = existing
        ? current.map((item) =>
            (item.cartKey || item.slug) === cartKey ? { ...item, quantity: Math.min(item.quantity + quantity, maxQuantity) } : item
          )
        : [...current, { ...product, cartKey, quantity: Math.min(quantity, maxQuantity) } as CartItem].filter((item) => item.quantity > 0);

      saveCart(nextItems);
      return nextItems;
    });

    if (openDrawer) setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => {
      const nextItems = current.filter((item) => (item.cartKey || item.slug) !== key);
      saveCart(nextItems);
      return nextItems;
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) => {
      const nextItems = current
        .map((item) => ((item.cartKey || item.slug) === key ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);

      saveCart(nextItems);
      return nextItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
    setItems([]);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.price + (item.selectedAddOns || []).reduce((addOnSum, addOn) => addOnSum + addOn.price, 0)) * item.quantity,
        0
      ),
    [items]
  );
  const stateValue = useMemo(() => ({ items, subtotal, isCartOpen }), [items, subtotal, isCartOpen]);
  const actionsValue = useMemo(
    () => ({ addItem, removeItem, updateQuantity, clearCart, openCart, closeCart }),
    [addItem, removeItem, updateQuantity, clearCart, openCart, closeCart]
  );

  return (
    <CartActionsContext.Provider value={actionsValue}>
      <CartStateContext.Provider value={stateValue}>{children}</CartStateContext.Provider>
    </CartActionsContext.Provider>
  );
}

export function useCart() {
  const state = useContext(CartStateContext);
  const actions = useContext(CartActionsContext);
  if (!state || !actions) throw new Error("useCart must be used inside CartProvider");
  return { ...state, ...actions };
}

export function useCartActions() {
  const actions = useContext(CartActionsContext);
  if (!actions) throw new Error("useCartActions must be used inside CartProvider");
  return actions;
}
