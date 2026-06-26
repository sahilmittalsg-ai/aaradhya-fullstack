import { createCollectionModel } from "../db/documentModel.js";

export const Coupon = createCollectionModel("coupons", {
  defaults: () => ({ type: "flat", minSubtotal: 0, active: true })
});
