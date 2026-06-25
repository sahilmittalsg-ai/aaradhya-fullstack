import type { CartItem } from "../types";

export const TAX_RATE = 0.05;

export function calculatePriceSummary(items: CartItem[], shipping = 0, paymentFee = 0, couponDiscount = 0) {
  const addOnTotal = (item: CartItem) => (item.selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0);
  const mrpTotal = items.reduce((sum, item) => sum + ((item.compareAtPrice || item.price) + addOnTotal(item)) * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price + addOnTotal(item)) * item.quantity, 0);
  const productDiscount = Math.max(mrpTotal - subtotal, 0);
  const taxableAmount = Math.max(subtotal - couponDiscount, 0);
  const tax = Math.round(taxableAmount * TAX_RATE);
  const totalDiscount = productDiscount + couponDiscount;
  const total = Math.max(taxableAmount + tax + shipping + paymentFee, 0);

  return {
    mrpTotal,
    productDiscount,
    subtotal,
    couponDiscount,
    totalDiscount,
    shipping,
    paymentFee,
    tax,
    total
  };
}
