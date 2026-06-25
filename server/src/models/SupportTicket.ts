import mongoose, { InferSchemaType } from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    orderNumber: { type: String, default: "" },
    category: {
      type: String,
      enum: ["order-tracking", "returns-exchange", "cancellation", "product-info", "bulk-wholesale", "something-else"],
      default: "something-else"
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
    replies: [
      {
        message: { type: String, required: true },
        authorRole: { type: String, enum: ["admin", "client"], default: "admin" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export type SupportTicketDocument = InferSchemaType<typeof supportTicketSchema>;
export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
