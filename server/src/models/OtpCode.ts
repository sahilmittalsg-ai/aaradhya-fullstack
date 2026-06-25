import mongoose, { InferSchemaType } from "mongoose";

const otpCodeSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["login"], default: "login" },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export type OtpCodeDocument = InferSchemaType<typeof otpCodeSchema>;
export const OtpCode = mongoose.model("OtpCode", otpCodeSchema);
