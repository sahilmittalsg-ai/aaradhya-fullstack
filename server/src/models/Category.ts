import mongoose, { InferSchemaType } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type CategoryDocument = InferSchemaType<typeof categorySchema>;
export const Category = mongoose.model("Category", categorySchema);
