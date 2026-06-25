import { Request, Response } from "express";
import { PaymentMethod } from "../models/PaymentMethod.js";

const fallbackPaymentMethods = [
  {
    code: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order is delivered.",
    type: "cod",
    provider: "manual",
    instructions: "Keep exact cash ready at delivery.",
    fee: 0,
    active: true,
    sortOrder: 1
  },
  {
    code: "upi",
    label: "UPI",
    description: "Pay securely using any UPI app.",
    type: "online",
    provider: "mock",
    instructions: "Mock online payment for local development.",
    fee: 0,
    active: true,
    sortOrder: 2,
    apps: [
      { code: "gpay", label: "Google Pay", logoText: "GPay", brandColor: "#1a73e8" },
      { code: "phonepe", label: "PhonePe", logoText: "Pe", brandColor: "#5f259f" },
      { code: "paytm-upi", label: "Paytm UPI", logoText: "Paytm", brandColor: "#00baf2" }
    ]
  },
  {
    code: "card",
    label: "Credit or Debit Card",
    description: "Card gateway-ready payment method.",
    type: "online",
    provider: "mock",
    instructions: "Connect a real gateway before production.",
    fee: 0,
    active: true,
    sortOrder: 3
  },
  {
    code: "wallet",
    label: "Wallet",
    description: "Pay using a supported wallet app.",
    type: "online",
    provider: "mock",
    instructions: "Choose your wallet and approve the payment.",
    fee: 0,
    active: true,
    sortOrder: 4,
    apps: [
      { code: "amazon-pay", label: "Amazon Pay", logoText: "amazon pay", brandColor: "#ff9900" },
      { code: "paytm-wallet", label: "Paytm Wallet", logoText: "Paytm", brandColor: "#00baf2" }
    ]
  }
];

export async function listPaymentMethods(_req: Request, res: Response) {
  const methods = await PaymentMethod.find({ active: true }).sort({ sortOrder: 1, label: 1 });
  return res.json(methods.length ? methods : fallbackPaymentMethods);
}

export async function listAdminPaymentMethods(_req: Request, res: Response) {
  const methods = await PaymentMethod.find().sort({ sortOrder: 1, label: 1 });
  return res.json(methods);
}

export async function createPaymentMethod(req: Request, res: Response) {
  const method = await PaymentMethod.create({ ...req.body, code: String(req.body.code).toLowerCase() });
  return res.status(201).json(method);
}

export async function updatePaymentMethod(req: Request, res: Response) {
  const patch = { ...req.body };
  if (patch.code) patch.code = String(patch.code).toLowerCase();

  const method = await PaymentMethod.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!method) return res.status(404).json({ message: "Payment method not found" });
  return res.json(method);
}

export async function createMockPayment(req: Request, res: Response) {
  const { amount, methodCode, appCode } = req.body;
  const method =
    (await PaymentMethod.findOne({ code: methodCode, active: true })) ||
    fallbackPaymentMethods.find((item) => item.code === methodCode);

  if (!method) return res.status(404).json({ message: "Payment method not found" });
  if (method.type !== "online") {
    return res.status(400).json({ message: "Selected method does not need online payment" });
  }

  return res.status(201).json({
    provider: method.provider,
    methodCode,
    appCode,
    amount,
    paymentReference: `PAY-${Date.now().toString().slice(-8)}`,
    status: "created",
    message: "Mock payment created. Replace this with Razorpay/Cashfree/Stripe in production."
  });
}
