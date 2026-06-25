import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-[#211d33]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-[#f6e8ce]">
        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#211d33] px-3 py-1 text-xs font-semibold text-white">
            {discountPercent}% off
          </span>
        )}
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#f6e8ce] px-3 py-1 text-xs font-semibold italic text-[#17172a]">
            {product.collection}
          </span>
          <span className="flex items-center gap-0.5 text-[#d69b34]" aria-label={`${product.rating} star rating`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={13} fill="currentColor" />
            ))}
          </span>
        </div>

        <Link to={`/products/${product.slug}`} className="product-title line-clamp-2 min-h-12 text-[15px] font-semibold leading-6 hover:text-rudra">
          {product.title}
        </Link>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <span className="font-heading text-xl font-bold text-[#211d33]">Rs.{product.price}</span>
          {product.compareAtPrice > product.price && (
            <span className="pb-0.5 text-sm font-medium text-[#17172a]/45 line-through">Rs.{product.compareAtPrice}</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(product.purpose || []).slice(0, 2).map((item) => (
            <span key={item} className="rounded-full border border-[#211d33]/10 px-2.5 py-1 text-[11px] font-semibold text-[#17172a]/70">
              {item}
            </span>
          ))}
          {product.mukhi && (
            <span className="rounded-full border border-[#211d33]/10 px-2.5 py-1 text-[11px] font-semibold text-[#17172a]/70">
              {product.mukhi}
            </span>
          )}
        </div>

        <button
          onClick={() => addItem(product)}
          className="mt-4 w-full rounded-full bg-[#211d33] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#17172a]"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
