import mongoose, { InferSchemaType } from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["flat", "percent"], default: "flat" },
    value: { type: Number, required: true },
    minSubtotal: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type CouponDocument = InferSchemaType<typeof couponSchema>;
export const Coupon = mongoose.model("Coupon", couponSchema);
