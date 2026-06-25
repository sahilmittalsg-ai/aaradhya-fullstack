import mongoose, { InferSchemaType } from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["policy", "landing", "support", "about"],
      default: "landing"
    },
    excerpt: { type: String, default: "" },
    body: { type: String, required: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type PageDocument = InferSchemaType<typeof pageSchema>;
export const Page = mongoose.model("Page", pageSchema);
