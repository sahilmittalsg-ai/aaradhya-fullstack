import { Link } from "react-router-dom";
import { memo } from "react";
import type { HomepageTrendingProduct } from "../../lib/api";

export const ProductCard = memo(function ProductCard({ product }: { product: HomepageTrendingProduct }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative block overflow-hidden rounded-lg border border-[#211d33]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f6e8ce]">
        <div className="absolute left-3 top-3 z-10 grid gap-1.5">
          <span className="w-max rounded bg-[#c8222c] px-2.5 py-1 text-[11px] font-bold uppercase text-white">
            {product.discount}
          </span>
          <span className="w-max rounded bg-[#ffd84d] px-2.5 py-1 text-[11px] font-bold text-[#17172a]">
            {product.badge}
          </span>
        </div>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold italic text-[#8d4b25]">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-12 text-[15px] font-semibold leading-6 text-[#17172a]">
          {product.name}
        </h3>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-bold text-[#211d33]">Rs.{product.price}</span>
          <span className="pb-0.5 text-sm font-medium text-[#17172a]/40 line-through">Rs.{product.oldPrice}</span>
        </div>
      </div>
    </Link>
  );
});
