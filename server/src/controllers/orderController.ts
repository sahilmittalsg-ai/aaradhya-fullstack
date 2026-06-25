import { Response } from "express";
import mongoose from "mongoose";
import { newId, readStore, writeStore } from "../data/fileStore.js";
import { AuthRequest } from "../middleware/auth.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { PaymentMethod } from "../models/PaymentMethod.js";
import { Product } from "../models/Product.js";

const fallbackPaymentMethods = [
  { code: "cod", type: "cod", provider: "manual", fee: 0 },
  { code: "upi", type: "online", provider: "mock", fee: 0 },
  { code: "card", type: "online", provider: "mock", fee: 0 },
  { code: "netbanking", type: "online", provider: "mock", fee: 0 },
  { code: "wallet", type: "online", provider: "mock", fee: 0 }
];

export async function createOrder(req: AuthRequest, res: Response) {
  const {
    items,
    customer,
    shippingAddress,
    billingAddress,
    shippingMethod = "standard",
    paymentMethod = "cod",
    paymentApp = "",
    paymentReference = "",
    couponCode
} = req.body;
  if (!items?.length) return res.status(400).json({ message: "Order items are required" });

  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum +
        (Number(item.price) +
          (item.selectedAddOns || []).reduce((addOnSum: number, addOn: any) => addOnSum + Number(addOn.price || 0), 0)) *
          Number(item.quantity),
      0
    );
    const mrpTotal = items.reduce((sum: number, item: any) => sum + Number(item.compareAtPrice || item.price) * Number(item.quantity), 0);
    const productDiscount = Math.max(mrpTotal - subtotal, 0);
    const shipping = shippingMethod === "express" ? 149 : subtotal >= 1499 ? 0 : 99;
    let discount = 0;

    if (couponCode) {
      const coupon = store.coupons.find((item) => item.code === String(couponCode).toUpperCase() && item.active);
      if (coupon && subtotal >= coupon.minSubtotal) {
        discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
      }
    }

    const taxableAmount = Math.max(subtotal - discount, 0);
    const tax = Math.round(taxableAmount * 0.05);
    const selectedPaymentType = paymentMethod === "cod" ? "cod" : "online";
    const order = {
      _id: newId("local-order"),
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      user: req.user?.id,
      customer,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      items,
      mrpTotal,
      productDiscount,
      subtotal,
      shipping,
      paymentFee: 0,
      discount,
      totalDiscount: productDiscount + discount,
      tax,
      total: Math.max(taxableAmount + tax + shipping, 0),
      shippingMethod,
      paymentMethod,
      paymentApp,
      paymentProvider: selectedPaymentType === "cod" ? "manual" : "mock",
      paymentReference,
      paymentStatus: selectedPaymentType === "cod" ? "pending" : paymentReference ? "paid" : "pending",
      trackingId: "",
      courierPartner: "",
      adminNotes: "",
      status: "placed",
      createdAt: new Date().toISOString()
    };

    items.forEach((item: any) => {
      const product = store.products.find((product) => product._id === item.product);
      if (product) product.stock = Math.max(Number(product.stock || 0) - Number(item.quantity || 0), 0);
    });

    store.orders.unshift(order);
    await writeStore(store);
    return res.status(201).json(order);
  }

  const selectedPayment =
    (await PaymentMethod.findOne({ code: paymentMethod, active: true })) ||
    fallbackPaymentMethods.find((method) => method.code === paymentMethod);
  if (!selectedPayment) return res.status(400).json({ message: "Selected payment method is not available" });

  const mrpTotal = items.reduce(
    (sum: number, item: any) =>
      sum +
      (Number(item.compareAtPrice || item.price) +
        (item.selectedAddOns || []).reduce((addOnSum: number, addOn: any) => addOnSum + Number(addOn.price || 0), 0)) *
        Number(item.quantity),
    0
  );
  const subtotal = items.reduce(
    (sum: number, item: any) =>
      sum +
      (Number(item.price) +
        (item.selectedAddOns || []).reduce((addOnSum: number, addOn: any) => addOnSum + Number(addOn.price || 0), 0)) *
        Number(item.quantity),
    0
  );
  const productDiscount = Math.max(mrpTotal - subtotal, 0);
  const shipping = shippingMethod === "express" ? 149 : subtotal >= 1499 ? 0 : 99;
  const paymentFee = selectedPayment.fee || 0;
  let discount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), active: true });
    if (coupon && subtotal >= coupon.minSubtotal) {
      discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    }
  }

  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxableAmount * 0.05);
  const totalDiscount = productDiscount + discount;

  const order = await Order.create({
    orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
    user: req.user?.id,
    customer,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    items,
    mrpTotal,
    productDiscount,
    subtotal,
    shipping,
    paymentFee,
    discount,
    totalDiscount,
    tax,
    total: Math.max(taxableAmount + tax + shipping + paymentFee, 0),
    shippingMethod,
    paymentMethod,
    paymentApp,
    paymentProvider: selectedPayment.provider,
    paymentReference,
    paymentStatus: selectedPayment.type === "cod" ? "pending" : paymentReference ? "paid" : "pending"
  });

  await Promise.all(
    items
      .filter((item: any) => item.product)
      .map((item: any) => Product.findByIdAndUpdate(item.product, { $inc: { stock: -Number(item.quantity) } }))
  );

  return res.status(201).json(order);
}

export async function listOrders(_req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    return res.json(store.orders);
  }

  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
  return res.json(orders);
}

export async function trackOrder(req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const order = store.orders.find((item) => item.orderNumber === req.params.orderNumber);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  }

  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json(order);
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const index = store.orders.findIndex((order) => order._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Order not found" });
    ["status", "paymentStatus", "trackingId", "courierPartner", "adminNotes"].forEach((field) => {
      if (req.body[field] !== undefined) store.orders[index][field] = req.body[field];
    });
    store.orders[index].updatedAt = new Date().toISOString();
    await writeStore(store);
    return res.json(store.orders[index]);
  }

  const patch: Record<string, unknown> = {};
  ["status", "paymentStatus", "trackingId", "courierPartner", "adminNotes"].forEach((field) => {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  });

  const order = await Order.findByIdAndUpdate(req.params.id, patch, { new: true });

  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json(order);
}

export async function cancelOrder(req: AuthRequest, res: Response) {
  const reason = String(req.body.reason || "Customer requested cancellation").trim();
  const orderId = String(req.params.id);

  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const order = store.orders.find((item) => item._id === orderId || item.orderNumber === orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canCancelOrder(req, order)) return res.status(403).json({ message: "You cannot cancel this order" });
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(409).json({ message: "This order can no longer be cancelled" });
    }

    order.status = "cancelled";
    order.adminNotes = [order.adminNotes, `Cancellation reason: ${reason}`].filter(Boolean).join("\n");
    order.updatedAt = new Date().toISOString();
    await writeStore(store);
    return res.json(order);
  }

  const criteria = [{ orderNumber: orderId }, ...(isObjectId(orderId) ? [{ _id: orderId }] : [])];
  const order = await Order.findOne({ $or: criteria });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (!canCancelOrder(req, order)) return res.status(403).json({ message: "You cannot cancel this order" });
  if (["shipped", "delivered", "cancelled"].includes(order.status)) {
    return res.status(409).json({ message: "This order can no longer be cancelled" });
  }

  order.status = "cancelled";
  order.adminNotes = [order.adminNotes, `Cancellation reason: ${reason}`].filter(Boolean).join("\n");
  await order.save();
  return res.json(order);
}

function canCancelOrder(req: AuthRequest, order: any) {
  if (req.user?.role === "admin") return true;
  if (req.user?.id && order.user && String(order.user) === req.user.id) return true;

  const phone = normalizePhone(req.body.phone);
  const email = String(req.body.email || "").trim().toLowerCase();
  const orderPhone = normalizePhone(order.customer?.phone);
  const orderEmail = String(order.customer?.email || "").trim().toLowerCase();

  return Boolean((phone && orderPhone.endsWith(phone.slice(-10))) || (email && email === orderEmail));
}

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function normalizePhone(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}
