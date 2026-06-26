import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useLiveProducts } from "../../hooks/useLiveProducts";
import { calculatePriceSummary } from "../../lib/pricing";
import type { CartItem as CartLineItem, Product } from "../../types";
import { CartItem } from "./CartItem";
import { CartRecommendations } from "./CartRecommendations";
import { CheckoutBar } from "./CheckoutBar";

export function CartDrawer() {
  const { items, subtotal, isCartOpen, closeCart, addItem, updateQuantity, removeItem } = useCart();
  const products = useLiveProducts();
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const summary = calculatePriceSummary(items, shipping);
  const recommendedProducts = useMemo(
    () => products.filter((product) => !items.some((item) => item.slug === product.slug)),
    [items, products]
  );
  const hasUnavailableQuantity = items.some((item) => item.quantity > getMaxQuantity(item, products));

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  useEffect(() => {
    if (!products.length) return;
    items.forEach((item) => {
      const maxQuantity = getMaxQuantity(item, products);
      if (maxQuantity > 0 && item.quantity > maxQuantity) {
        updateQuantity(item.cartKey || item.slug, maxQuantity);
      }
    });
  }, [items, products, updateQuantity]);

  if (!isCartOpen) return null;

  function changeQuantity(item: CartLineItem, nextQuantity: number) {
    const maxQuantity = getMaxQuantity(item, products);
    updateQuantity(item.cartKey || item.slug, Math.max(0, Math.min(nextQuantity, maxQuantity)));
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/45" role="dialog" aria-modal="true" aria-label="Cart drawer">
      <button className="absolute inset-0 h-full w-full cursor-default" onClick={closeCart} aria-label="Close cart overlay" />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col bg-white font-sans text-[#17172a] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#211d33]/10 px-5 py-6">
          <h1 className="text-2xl font-bold text-[#211d33]">Your cart</h1>
          <button onClick={closeCart} className="rounded-full p-2 text-[#211d33] transition hover:bg-[#f6e8ce]" aria-label="Close cart">
            <X size={27} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-[#211d33]/10 bg-[#fff7ec] p-8 text-center">
              <p className="text-lg font-bold text-[#211d33]">Your cart is empty.</p>
              <Link to="/collections" onClick={closeCart} className="btn-primary mt-5">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-5">
                {items.map((item) => (
                  <CartItem
                    key={item.cartKey || item.slug}
                    item={item}
                    maxQuantity={getMaxQuantity(item, products)}
                    onChange={(quantity) => changeQuantity(item, quantity)}
                    onRemove={() => removeItem(item.cartKey || item.slug)}
                  />
                ))}
              </div>

              {hasUnavailableQuantity && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  Some quantities were adjusted to match available admin stock.
                </p>
              )}

              <CartRecommendations title="Japam Bestsellers" product={recommendedProducts[0]} onAdd={(product) => addItem(product)} />
              <CartRecommendations title="You may also like..." product={recommendedProducts[1] || recommendedProducts[0]} onAdd={(product) => addItem(product)} />

              <div className="mt-7 rounded-xl bg-gradient-to-r from-[#ffe370] via-[#ffbadb] to-[#d59bff] px-4 py-4 text-center text-sm font-bold text-[#211d33]">
                Get FREE 5 Mukhi Rudraksha & Discount
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <CheckoutBar total={summary.total} disabled={hasUnavailableQuantity} onCheckout={closeCart} />
        )}
      </aside>
    </div>
  );
}

function getMaxQuantity(item: CartLineItem, products: Product[]) {
  const liveProduct = products.find((product) => product.slug === item.slug);
  const product = liveProduct || item;
  const selectedSize = item.selectedSize
    ? product.sizeOptions?.find((size) => size.value === item.selectedSize)
    : undefined;

  return Math.max(selectedSize?.stock ?? product.stock ?? 0, 0);
}
