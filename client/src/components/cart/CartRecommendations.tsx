import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../types";

type CartRecommendationsProps = {
  title: string;
  product?: Product;
  onAdd: (product: Product) => void;
};

export function CartRecommendations({ title, product, onAdd }: CartRecommendationsProps) {
  if (!product) return null;

  return (
    <section className="mt-7">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#211d33]">{title}</h2>
        <div className="flex items-center gap-4 text-[#211d33]/45">
          <ChevronLeft size={24} />
          <ChevronRight size={24} />
        </div>
      </div>

      <div className="grid grid-cols-[84px_1fr_auto] items-center gap-4 rounded-lg bg-[#f5f5f5] p-4">
        <Link to={`/products/${product.slug}`} className="overflow-hidden rounded-lg bg-[#f6e8ce]">
          <img src={product.images[0]} alt={product.title} className="aspect-square h-full w-full object-cover" />
        </Link>
        <div className="min-w-0">
          <Link to={`/products/${product.slug}`} className="line-clamp-2 text-sm font-bold leading-5 text-[#211d33] hover:text-[#b86b2b]">
            {product.title}
          </Link>
          <p className="mt-2 text-lg font-bold text-[#211d33]">
            ₹ {product.price}<sup className="ml-0.5 text-[10px]">00</sup>
            {product.compareAtPrice > product.price && (
              <span className="ml-2 text-xs font-medium text-[#17172a]/45 line-through">₹ {product.compareAtPrice}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="rounded-lg border border-[#211d33] px-3 py-2 text-xs font-semibold text-[#211d33] transition hover:bg-[#211d33] hover:text-white"
        >
          ADD
        </button>
      </div>
    </section>
  );
}
