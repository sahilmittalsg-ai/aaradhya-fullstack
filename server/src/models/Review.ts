import mongoose, { InferSchemaType } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    orderNumber: { type: String, default: "" },
    verifiedPurchase: { type: Boolean, default: false },
    approved: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;
export const Review = mongoose.model("Review", reviewSchema);
