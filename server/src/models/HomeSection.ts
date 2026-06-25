import mongoose, { InferSchemaType } from "mongoose";

const homeSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    eyebrow: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    type: {
      type: String,
      enum: ["featured-products", "collections", "benefits", "testimonials", "story"],
      required: true
    },
    items: [
      {
        title: String,
        subtitle: String,
        image: String,
        href: String
      }
    ],
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type HomeSectionDocument = InferSchemaType<typeof homeSectionSchema>;
export const HomeSection = mongoose.model("HomeSection", homeSectionSchema);
