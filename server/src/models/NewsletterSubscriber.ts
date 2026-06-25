import mongoose, { InferSchemaType } from "mongoose";

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "website" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type NewsletterSubscriberDocument = InferSchemaType<typeof newsletterSubscriberSchema>;
export const NewsletterSubscriber = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);
