import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: 0 },
    selectedSize: { type: String, default: "" },
    selectedSizeLabel: { type: String, default: "" },
    selectedAddOns: [
      {
        code: String,
        title: String,
        price: Number
      }
    ],
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    billingAddress: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" }
    },
    items: [orderItemSchema],
    mrpTotal: { type: Number, default: 0 },
    productDiscount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    paymentFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingMethod: { type: String, enum: ["standard", "express"], default: "standard" },
    paymentMethod: { type: String, enum: ["cod", "upi", "card", "netbanking", "wallet"], default: "cod" },
    paymentApp: { type: String, default: "" },
    paymentProvider: { type: String, default: "manual" },
    paymentReference: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    status: {
      type: String,
      enum: ["placed", "packed", "shipped", "delivered", "cancelled"],
      default: "placed"
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
