import mongoose, { InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String, default: "" },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    collection: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    images: [{ type: String, required: true }],
    tags: [{ type: String }],
    purpose: [{ type: String }],
    bead: { type: String, default: "" },
    mukhi: { type: String, default: "" },
    plating: { type: String, default: "" },
    audience: { type: String, default: "" },
    benefits: [{ type: String }],
    materials: [{ type: String }],
    sizeOptions: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        stock: { type: Number, default: 0 }
      }
    ],
    addOnServices: [
      {
        code: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        price: { type: Number, default: 0 },
        active: { type: Boolean, default: true }
      }
    ],
    delivery: {
      minDays: { type: Number, default: 3 },
      maxDays: { type: Number, default: 7 },
      expressMinDays: { type: Number, default: 2 },
      expressMaxDays: { type: Number, default: 4 }
    },
    careInstructions: { type: String, default: "" },
    sku: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", tags: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const Product = mongoose.model("Product", productSchema);
