import { ChevronLeft, ChevronRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useLiveProducts } from "../../hooks/useLiveProducts";
import { calculatePriceSummary } from "../../lib/pricing";
import type { CartItem, Product } from "../../types";

export function Cart() {
  const { items, subtotal, addItem, updateQuantity, removeItem } = useCart();
  const products = useLiveProducts();
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const summary = calculatePriceSummary(items, shipping);
  const bestseller = products.find((product) => !items.some((item) => item.slug === product.slug));
  const suggestions = products
    .filter((product) => !items.some((item) => item.slug === product.slug))
    .slice(0, 6);
  const hasUnavailableQuantity = items.some((item) => item.quantity > getMaxQuantity(item, products));

  useEffect(() => {
    if (!products.length) return;

    items.forEach((item) => {
      const maxQuantity = getMaxQuantity(item, products);
      if (maxQuantity === 0) return;
      if (item.quantity > maxQuantity) {
        updateQuantity(item.cartKey || item.slug, maxQuantity);
      }
    });
  }, [items, products, updateQuantity]);

  function changeQuantity(item: CartItem, nextQuantity: number) {
    const maxQuantity = getMaxQuantity(item, products);
    const safeQuantity = Math.max(0, Math.min(nextQuantity, maxQuantity));
    updateQuantity(item.cartKey || item.slug, safeQuantity);
  }

  return (
    <section className="min-h-screen bg-[#fff7ec] py-6 md:py-10">
      <div className="container-pad">
        <div className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[18px] border border-[#211d33]/10 bg-white shadow-[0_24px_70px_rgba(33,29,51,0.13)]">
          <header className="flex items-center justify-between border-b border-[#211d33]/10 px-4 py-5 md:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b86b2b]">Shopping Bag</p>
              <h1 className="font-heading text-2xl font-bold text-[#211d33] md:text-3xl">Your cart</h1>
            </div>
            <Link to="/collections" className="rounded-full p-2 text-[#211d33] transition hover:bg-[#f6e8ce]" aria-label="Close cart">
              <X size={26} />
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-[#211d33]/10 bg-[#fff7ec] p-10 text-center">
              <p className="text-xl font-bold text-[#211d33]">Your cart is empty.</p>
              <Link to="/collections" className="btn-primary mt-6">Start Shopping</Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {items.map((item) => (
                  <CartLine
                    key={item.cartKey || item.slug}
                    item={item}
                    maxQuantity={getMaxQuantity(item, products)}
                    onChange={(nextQuantity) => changeQuantity(item, nextQuantity)}
                    onRemove={() => removeItem(item.cartKey || item.slug)}
                  />
                ))}
              </div>

              <div className="mt-6 border-t border-[#211d33]/10 pt-6">
                {bestseller && (
                  <RecommendationBlock
                    title="Japam Bestsellers"
                    product={bestseller}
                    onAdd={() => addItem(bestseller)}
                  />
                )}

                {suggestions.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-[#211d33]">You may also like...</h2>
                      <div className="flex gap-4 text-[#211d33]/55">
                        <ChevronLeft />
                        <ChevronRight />
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {suggestions.slice(0, 3).map((product) => (
                        <MiniProduct key={product.slug} product={product} onAdd={() => addItem(product)} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-xl bg-gradient-to-r from-[#fbe177] via-[#ffc0d9] to-[#c696ff] p-3 text-center text-sm font-bold text-[#211d33]">
                  Get Free Rudraksha & Discount on prepaid orders
                </div>

                <div className="mt-5 rounded-2xl border border-[#211d33]/10 bg-[#fff7ec] p-5">
                  <h2 className="text-xl font-bold text-[#211d33]">Order Summary</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    <SummaryRow label="MRP Total" value={summary.mrpTotal} />
                    <SummaryRow label="Discount on MRP" value={-summary.productDiscount} highlight />
                    <SummaryRow label="Subtotal" value={summary.subtotal} />
                    <SummaryRow label="Shipping" value={summary.shipping} freeWhenZero />
                    <SummaryRow label="Tax" value={summary.tax} />
                    <div className="flex justify-between border-t border-[#211d33]/10 pt-3 text-lg">
                      <span>To Pay</span>
                      <b>Rs.{summary.total}</b>
                    </div>
                  </div>
                  {hasUnavailableQuantity && (
                    <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      Some quantities were adjusted to match available admin stock.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

          {items.length > 0 && (
            <footer className="sticky bottom-0 border-t border-[#211d33]/10 bg-white px-4 py-4 shadow-2xl md:px-8">
              <Link
                to="/checkout"
                className={`flex w-full items-center justify-center gap-3 rounded-lg bg-[#211d33] px-5 py-4 text-base font-bold text-white transition hover:bg-[#b86b2b] md:text-lg ${
                  hasUnavailableQuantity ? "pointer-events-none opacity-60" : ""
                }`}
              >
                Checkout - Rs.{summary.total}
                <span className="hidden text-xs font-medium sm:inline">Get Extra Rs20 off on prepaid</span>
                <ChevronRight size={20} />
              </Link>
            </footer>
          )}
        </div>
      </div>
    </section>
  );
}

function CartLine({
  item,
  maxQuantity,
  onChange,
  onRemove
}: {
  item: CartItem;
  maxQuantity: number;
  onChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const addOnTotal = (item.selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0);
  const canIncrease = item.quantity < maxQuantity;

  return (
    <article className="grid grid-cols-[76px_1fr] gap-3 rounded-xl border border-[#211d33]/10 bg-white p-3 shadow-sm sm:grid-cols-[92px_1fr] sm:gap-4 sm:p-4">
      <Link to={`/products/${item.slug}`} className="block overflow-hidden rounded-lg bg-[#f6e8ce]">
        <img src={item.images[0]} alt={item.title} className="aspect-square h-full w-full object-cover" />
      </Link>
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/products/${item.slug}`} className="line-clamp-2 font-heading text-sm font-bold leading-5 text-[#211d33] hover:text-[#b86b2b] sm:text-base">
              {item.title}
            </Link>
            {item.selectedSizeLabel && <p className="mt-2 text-xs font-bold text-[#b86b2b]">Size: {item.selectedSizeLabel}</p>}
            {(item.selectedAddOns || []).map((addOn) => (
              <p key={addOn.code} className="mt-1 text-xs font-bold text-green-700">{addOn.title}: Rs.{addOn.price}</p>
            ))}
          </div>
          <button onClick={onRemove} className="rounded-full p-1.5 text-[#211d33] hover:bg-[#f6e8ce]" aria-label="Remove item">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-heading text-lg font-bold text-[#211d33]">
              Rs.{item.price + addOnTotal}
              <sup className="ml-0.5 text-xs">00</sup>
              {item.compareAtPrice > item.price && (
                <span className="ml-3 text-sm font-medium text-[#17172a]/45 line-through">Rs.{item.compareAtPrice}</span>
              )}
            </p>
            <p className={`mt-1 text-xs font-bold ${maxQuantity > 0 ? "text-[#17172a]/55" : "text-red-700"}`}>
              {maxQuantity > 0 ? `${maxQuantity} available` : "Out of stock"}
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-[#211d33]/15 bg-[#fff7ec]">
            <button className="px-3 py-2.5" onClick={() => onChange(item.quantity - 1)} aria-label="Decrease quantity">
              <Minus size={17} />
            </button>
            <span className="min-w-9 text-center font-bold">{item.quantity}</span>
            <button
              className="px-3 py-2.5 disabled:cursor-not-allowed disabled:opacity-35"
              onClick={() => onChange(item.quantity + 1)}
              disabled={!canIncrease}
              aria-label="Increase quantity"
            >
              <Plus size={17} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function RecommendationBlock({ title, product, onAdd }: { title: string; product: Product; onAdd: () => void }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#211d33]">{title}</h2>
        <div className="flex gap-4 text-[#211d33]/55">
          <ChevronLeft />
          <ChevronRight />
        </div>
      </div>
      <MiniProduct product={product} onAdd={onAdd} />
    </div>
  );
}

function MiniProduct({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <div className="grid grid-cols-[84px_1fr_auto] items-center gap-4 rounded-lg bg-[#f5f4f4] p-4">
      <Link to={`/products/${product.slug}`} className="overflow-hidden rounded-lg bg-[#f6e8ce]">
        <img src={product.images[0]} alt={product.title} className="aspect-square object-cover" />
      </Link>
      <div className="min-w-0">
        <Link to={`/products/${product.slug}`} className="line-clamp-2 font-heading text-sm font-bold leading-5 text-[#211d33]">
          {product.title}
        </Link>
        <p className="mt-2 font-heading text-lg font-bold text-[#211d33]">
          Rs.{product.price}
          <sup className="ml-0.5 text-xs">00</sup>
          {product.compareAtPrice > product.price && (
            <span className="ml-2 text-sm font-medium text-[#17172a]/45 line-through">Rs.{product.compareAtPrice}</span>
          )}
        </p>
      </div>
      <button onClick={onAdd} className="rounded-lg border border-[#211d33] px-3 py-2 text-sm font-semibold text-[#211d33] hover:bg-[#211d33] hover:text-white">
        ADD
      </button>
    </div>
  );
}

function getMaxQuantity(item: CartItem, products: Product[]) {
  const liveProduct = products.find((product) => product.slug === item.slug);
  const product = liveProduct || item;
  const selectedSize = item.selectedSize
    ? product.sizeOptions?.find((size) => size.value === item.selectedSize)
    : undefined;

  return Math.max(selectedSize?.stock ?? product.stock ?? 0, 0);
}

function SummaryRow({
  label,
  value,
  highlight = false,
  freeWhenZero = false
}: {
  label: string;
  value: number;
  highlight?: boolean;
  freeWhenZero?: boolean;
}) {
  return (
    <div className={`flex justify-between ${highlight ? "text-green-700" : ""}`}>
      <span>{label}</span>
      <b>{freeWhenZero && value === 0 ? "Free" : `${value < 0 ? "- " : ""}Rs.${Math.abs(value)}`}</b>
    </div>
  );
}
