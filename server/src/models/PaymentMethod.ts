import mongoose, { InferSchemaType } from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    label: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["cod", "online"], required: true },
    provider: { type: String, default: "manual" },
    instructions: { type: String, default: "" },
    apps: [
      {
        code: { type: String, required: true },
        label: { type: String, required: true },
        logoText: { type: String, default: "" },
        brandColor: { type: String, default: "#1f1a17" },
        deepLink: { type: String, default: "" },
        instructions: { type: String, default: "" },
        active: { type: Boolean, default: true }
      }
    ],
    fee: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type PaymentMethodDocument = InferSchemaType<typeof paymentMethodSchema>;
export const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
