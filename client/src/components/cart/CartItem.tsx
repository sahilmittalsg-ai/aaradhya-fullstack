import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { CartItem as CartLineItem } from "../../types";

type CartItemProps = {
  item: CartLineItem;
  maxQuantity: number;
  onChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartItem({ item, maxQuantity, onChange, onRemove }: CartItemProps) {
  const addOnTotal = (item.selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0);
  const canIncrease = item.quantity < maxQuantity;

  return (
    <article className="grid grid-cols-[92px_1fr] gap-4 border-b border-[#211d33]/10 pb-5">
      <Link to={`/products/${item.slug}`} className="overflow-hidden rounded-none bg-[#f6e8ce]">
        <img src={item.images[0]} alt={item.title} className="aspect-square h-full w-full object-cover" />
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${item.slug}`} className="line-clamp-2 text-[15px] font-bold leading-5 text-[#211d33] hover:text-[#b86b2b]">
              {item.title}
            </Link>
            {item.selectedSizeLabel && <p className="mt-1 text-xs font-semibold text-[#b86b2b]">Size: {item.selectedSizeLabel}</p>}
            {(item.selectedAddOns || []).map((addOn) => (
              <p key={addOn.code} className="mt-1 text-xs font-semibold text-green-700">
              {addOn.title}: ₹{addOn.price}
              </p>
            ))}
          </div>

          <button onClick={onRemove} className="rounded-full p-1.5 text-[#211d33] hover:bg-[#f6e8ce]" aria-label="Delete item">
            <Trash2 size={19} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-[#211d33]">
              ₹ {item.price + addOnTotal}<sup className="ml-0.5 text-[10px]">00</sup>
              {item.compareAtPrice > item.price && (
                <span className="ml-2 text-xs font-medium text-[#17172a]/45 line-through">₹ {item.compareAtPrice}</span>
              )}
            </p>
            <p className={`mt-1 text-[11px] font-semibold ${maxQuantity > 0 ? "text-[#17172a]/50" : "text-red-700"}`}>
              {maxQuantity > 0 ? `${maxQuantity} available` : "Out of stock"}
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-[#211d33]/15 bg-[#fff7ec]">
            <button className="px-3 py-2.5" onClick={() => onChange(item.quantity - 1)} aria-label="Decrease quantity">
              <Minus size={16} />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              className="px-3 py-2.5 disabled:cursor-not-allowed disabled:opacity-35"
              onClick={() => onChange(item.quantity + 1)}
              disabled={!canIncrease}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
