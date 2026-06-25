import mongoose, { InferSchemaType } from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    eyebrow: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
    ctaLabel: { type: String, default: "Shop now" },
    ctaUrl: { type: String, default: "/collections" },
    placement: { type: String, enum: ["home-hero", "collection", "promo"], default: "home-hero" },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type BannerDocument = InferSchemaType<typeof bannerSchema>;
export const Banner = mongoose.model("Banner", bannerSchema);
