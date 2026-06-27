import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { CartItem, Product } from "../types";

type CartStateValue = {
  items: CartItem[];
  subtotal: number;
  isCartOpen: boolean;
};

type CartActionsValue = {
  addItem: (product: Product | CartItem, quantity?: number, openDrawer?: boolean) => boolean;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  completePendingAdd: () => string | undefined;
  syncCartForCurrentUser: () => void;
  resetCartView: () => void;
};

const CartStateContext = createContext<CartStateValue | undefined>(undefined);
const CartActionsContext = createContext<CartActionsValue | undefined>(undefined);

const LEGACY_CART_KEY = "cart";
const PENDING_CART_KEY = "aaradhya-pending-cart-add";

function getCartStorageKey() {
  if (!localStorage.getItem("token")) return undefined;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}") as { _id?: string; id?: string; email?: string };
    const identity = user._id || user.id || user.email;
    return identity ? `cart:${identity}` : undefined;
  } catch {
    return undefined;
  }
}

function readCart(): CartItem[] {
  const key = getCartStorageKey();
  if (!key) return [];
  const saved = localStorage.getItem(key);
  if (saved) return parseCart(saved);

  const legacy = localStorage.getItem(LEGACY_CART_KEY);
  if (legacy) {
    localStorage.setItem(key, legacy);
    localStorage.removeItem(LEGACY_CART_KEY);
    return parseCart(legacy);
  }
  return [];
}

function parseCart(value: string): CartItem[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(nextItems: CartItem[]) {
  const key = getCartStorageKey();
  if (key) localStorage.setItem(key, JSON.stringify(nextItems));
}

function addProductToCart(current: CartItem[], product: Product | CartItem, quantity: number) {
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
  const existing = current.find((item) => (item.cartKey || item.slug) === cartKey);
  return (existing
    ? current.map((item) =>
        (item.cartKey || item.slug) === cartKey ? { ...item, quantity: Math.min(item.quantity + quantity, maxQuantity) } : item
      )
    : [...current, { ...product, cartKey, quantity: Math.min(quantity, maxQuantity) } as CartItem]
  ).filter((item) => item.quantity > 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    return readCart();
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((product: Product | CartItem, quantity = 1, openDrawer = true) => {
    if (!getCartStorageKey()) {
      const currentRoute = window.location.hash.slice(1).split("?")[0] || "/";
      const returnTo = openDrawer ? currentRoute : "/checkout";
      sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify({ product, quantity, openDrawer, returnTo }));
      window.location.hash = `/account?returnTo=${encodeURIComponent(returnTo)}`;
      return false;
    }

    setItems((current) => {
      const nextItems = addProductToCart(current, product, quantity);
      saveCart(nextItems);
      return nextItems;
    });

    if (openDrawer) setIsCartOpen(true);
    return true;
  }, []);

  const completePendingAdd = useCallback(() => {
    const saved = sessionStorage.getItem(PENDING_CART_KEY);
    const current = readCart();
    if (!saved) {
      setItems(current);
      return undefined;
    }
    try {
      const pending = JSON.parse(saved) as { product: Product | CartItem; quantity: number; openDrawer: boolean; returnTo?: string };
      const nextItems = addProductToCart(current, pending.product, pending.quantity || 1);
      saveCart(nextItems);
      setItems(nextItems);
      if (pending.openDrawer) setIsCartOpen(true);
      sessionStorage.removeItem(PENDING_CART_KEY);
      return pending.returnTo;
    } catch {
      sessionStorage.removeItem(PENDING_CART_KEY);
      setItems(current);
      return undefined;
    }
  }, []);

  const syncCartForCurrentUser = useCallback(() => {
    setItems(readCart());
    setIsCartOpen(false);
  }, []);

  const resetCartView = useCallback(() => {
    setItems([]);
    setIsCartOpen(false);
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
    () => ({ addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, completePendingAdd, syncCartForCurrentUser, resetCartView }),
    [addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, completePendingAdd, syncCartForCurrentUser, resetCartView]
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
