import { createCollectionModel } from "../db/documentModel.js";

export type CouponDocument = Record<string, any>;

export const Coupon = createCollectionModel("coupons", {
  defaults: () => ({ type: "flat", minSubtotal: 0, active: true })
});
