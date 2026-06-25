import bcrypt from "bcryptjs";
import { Router, Request, Response, NextFunction } from "express";
import slugify from "slugify";
import { getHealth } from "../controller/healthController.js";
import { optionalAuth, requireAdmin, requireAuth, AuthRequest } from "../middleware/auth.js";
import { Banner, HomeSection, NewsletterSubscriber, Page, SiteSetting } from "../model/Content.js";
import { Category } from "../model/Category.js";
import { Coupon } from "../model/Coupon.js";
import { Order } from "../model/Order.js";
import { OtpCode } from "../model/OtpCode.js";
import { PaymentMethod } from "../model/PaymentMethod.js";
import { Product } from "../model/Product.js";
import { Review } from "../model/Review.js";
import { SupportTicket } from "../model/SupportTicket.js";
import { User } from "../model/User.js";
import { generateOtp, normalizePhone, signToken } from "../utils/token.js";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
const asyncHandler = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) =>
  handler(req, res, next).catch(next);

const router = Router();

function publicUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    phoneVerifiedAt: user.phoneVerifiedAt,
    addresses: user.addresses
  };
}

function addOnTotal(item: any) {
  return (item.selectedAddOns || []).reduce((sum: number, addOn: any) => sum + Number(addOn.price || 0), 0);
}

function calculateOrderTotals(items: any[], shippingMethod: string, paymentFee: number, couponDiscount: number) {
  const mrpTotal = items.reduce(
    (sum, item) => sum + (Number(item.compareAtPrice || item.price) + addOnTotal(item)) * Number(item.quantity),
    0
  );
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) + addOnTotal(item)) * Number(item.quantity),
    0
  );
  const productDiscount = Math.max(mrpTotal - subtotal, 0);
  const shipping = shippingMethod === "express" ? 149 : subtotal >= 1499 ? 0 : 99;
  const taxableAmount = Math.max(subtotal - couponDiscount, 0);
  const tax = Math.round(taxableAmount * Number(process.env.TAX_RATE || 0.05));
  const totalDiscount = productDiscount + couponDiscount;
  const total = Math.max(taxableAmount + tax + shipping + paymentFee, 0);

  return { mrpTotal, subtotal, productDiscount, shipping, tax, totalDiscount, total };
}

router.get("/health", getHealth);

router.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, role: "client" });
    const token = signToken({ id: user._id, role: user.role });
    return res.status(201).json({ token, user: publicUser(user) });
  })
);

router.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user: any = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({ id: user._id, role: user.role });
    return res.json({ token, user: publicUser(user) });
  })
);

router.post(
  "/auth/otp/request",
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    if (!phone) return res.status(400).json({ message: "Valid mobile number is required" });

    const code = process.env.NODE_ENV === "production" ? generateOtp() : process.env.OTP_DEV_CODE || "123456";
    const codeHash = await bcrypt.hash(code, 10);
    const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || 5);

    await OtpCode.deleteMany({ phone, purpose: "login", consumedAt: null });
    await OtpCode.create({
      phone,
      codeHash,
      purpose: "login",
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000)
    });

    return res.status(201).json({
      message: "OTP sent successfully",
      phone,
      expiresInSeconds: ttlMinutes * 60,
      devOtp: process.env.NODE_ENV === "production" ? undefined : code
    });
  })
);

router.post(
  "/auth/otp/verify",
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || "").trim();
    if (!phone || code.length !== 6) return res.status(400).json({ message: "Phone and 6 digit OTP are required" });

    const otp: any = await OtpCode.findOne({
      phone,
      purpose: "login",
      consumedAt: null,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    if (!otp) return res.status(401).json({ message: "OTP expired or not found" });
    if (otp.attempts >= 5) return res.status(429).json({ message: "Too many OTP attempts" });

    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      otp.attempts += 1;
      await otp.save();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    otp.consumedAt = new Date();
    await otp.save();

    let user: any = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: req.body.name || `Customer ${phone.slice(-4)}`,
        email: req.body.email || `${phone}@otp.local`,
        phone,
        phoneVerifiedAt: new Date(),
        password: `${phone}-${Date.now()}`,
        role: "client"
      });
    } else if (!user.phoneVerifiedAt) {
      user.phoneVerifiedAt = new Date();
      await user.save();
    }

    const token = signToken({ id: user._id, role: user.role });
    return res.json({ token, user: publicUser(user) });
  })
);

router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const query: Record<string, any> = { active: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.collection) query.collection = req.query.collection;
    if (req.query.featured) query.featured = req.query.featured === "true";
    if (req.query.search) query.$text = { $search: String(req.query.search) };

    const products = await Product.find(query).sort({ featured: -1, createdAt: -1 });
    return res.json(products);
  })
);

router.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, active: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  })
);

router.post(
  "/products",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = req.body.slug || slugify(req.body.title, { lower: true, strict: true });
    const product = await Product.create({ ...req.body, slug });
    return res.status(201).json(product);
  })
);

router.patch(
  "/products/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const patch = { ...req.body };
    if (patch.title && !patch.slug) patch.slug = slugify(patch.title, { lower: true, strict: true });
    const product = await Product.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  })
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => res.json(await Category.find({ active: true }).sort({ featured: -1, name: 1 })))
);

router.post(
  "/coupons/validate",
  asyncHandler(async (req, res) => {
    const subtotal = Number(req.body.subtotal || 0);
    const coupon = await Coupon.findOne({ code: String(req.body.code || "").toUpperCase(), active: true });
    if (!coupon || subtotal < coupon.minSubtotal) return res.status(404).json({ message: "Coupon not valid" });
    const discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    return res.json({ coupon, discount });
  })
);

router.get(
  "/payments/methods",
  asyncHandler(async (_req, res) => res.json(await PaymentMethod.find({ active: true }).sort({ sortOrder: 1 })))
);

router.post(
  "/payments/mock-intent",
  asyncHandler(async (req, res) => {
    const method = await PaymentMethod.findOne({ code: req.body.methodCode, active: true });
    if (!method) return res.status(404).json({ message: "Payment method not found" });
    if (method.type !== "online") return res.status(400).json({ message: "Selected method does not need online payment" });

    return res.status(201).json({
      provider: method.provider,
      methodCode: req.body.methodCode,
      appCode: req.body.appCode,
      amount: req.body.amount,
      paymentReference: `PAY-${Date.now().toString().slice(-8)}`,
      status: "created"
    });
  })
);

router.post(
  "/orders",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
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

    const selectedPayment: any = await PaymentMethod.findOne({ code: paymentMethod, active: true });
    if (!selectedPayment) return res.status(400).json({ message: "Selected payment method is not available" });

    let discount = 0;
    const preCouponSubtotal = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price) + addOnTotal(item)) * Number(item.quantity),
      0
    );
    if (couponCode) {
      const coupon: any = await Coupon.findOne({ code: String(couponCode).toUpperCase(), active: true });
      if (coupon && preCouponSubtotal >= coupon.minSubtotal) {
        discount = coupon.type === "percent" ? Math.round((preCouponSubtotal * coupon.value) / 100) : coupon.value;
      }
    }

    const totals = calculateOrderTotals(items, shippingMethod, selectedPayment.fee || 0, discount);
    const order = await Order.create({
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      user: req.user?.id,
      customer,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      items,
      ...totals,
      paymentFee: selectedPayment.fee || 0,
      discount,
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
  })
);

router.get(
  "/orders/track/:orderNumber",
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  })
);

router.get(
  "/reviews/product/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(await Review.find({ product: product._id, approved: true }).sort({ createdAt: -1 }));
  })
);

router.post(
  "/reviews/product/:slug",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });

    let verifiedPurchase = false;
    if (req.body.orderNumber) {
      verifiedPurchase = Boolean(await Order.findOne({ orderNumber: req.body.orderNumber, "items.product": product._id }));
    }

    const review = await Review.create({
      product: product._id,
      user: req.user?.id,
      name: req.body.name,
      rating: req.body.rating,
      comment: req.body.comment,
      orderNumber: req.body.orderNumber,
      verifiedPurchase
    });

    const reviews = await Review.find({ product: product._id, approved: true });
    const rating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product._id, { rating: Number(rating.toFixed(1)) });

    return res.status(201).json(review);
  })
);

router.get(
  "/content/storefront",
  asyncHandler(async (_req, res) => {
    const [settings, banners, sections, categories, featuredProducts] = await Promise.all([
      SiteSetting.findOne({ key: "default", active: true }),
      Banner.find({ active: true }).sort({ placement: 1, sortOrder: 1 }),
      HomeSection.find({ active: true }).sort({ sortOrder: 1 }),
      Category.find({ active: true }).sort({ featured: -1, name: 1 }),
      Product.find({ active: true, featured: true }).sort({ createdAt: -1 }).limit(8)
    ]);
    return res.json({ settings, banners, sections, categories, featuredProducts });
  })
);

router.get(
  "/content/pages/:slug",
  asyncHandler(async (req, res) => {
    const page = await Page.findOne({ slug: req.params.slug, active: true });
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  })
);

router.post(
  "/content/newsletter",
  asyncHandler(async (req, res) => {
    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email: req.body.email },
      { email: req.body.email, source: req.body.source || "website", active: true },
      { new: true, upsert: true }
    );
    return res.status(201).json(subscriber);
  })
);

router.get(
  "/users/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById(req.user?.id).select("-password").populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  })
);

router.get(
  "/users/me/orders",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => res.json(await Order.find({ user: req.user?.id }).sort({ createdAt: -1 })))
);

router.post(
  "/users/support",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const ticket = await SupportTicket.create({
      user: req.user?.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      orderNumber: req.body.orderNumber,
      category: req.body.category,
      subject: req.body.subject,
      message: req.body.message,
      priority: req.body.priority || "normal"
    });
    return res.status(201).json(ticket);
  })
);

router.get(
  "/users/support/my",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => res.json(await SupportTicket.find({ user: req.user?.id }).sort({ createdAt: -1 })))
);

router.get(
  "/admin/dashboard",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [orders, products, customers, tickets] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.find({ active: true }),
      User.find({ role: "client" }),
      SupportTicket.find({ status: { $ne: "resolved" } })
    ]);
    const revenue = orders.reduce((sum, order: any) => sum + order.total, 0);
    return res.json({
      revenue,
      orders: orders.length,
      pendingOrders: orders.filter((order: any) => order.status !== "delivered").length,
      products: products.length,
      customers: customers.length,
      openTickets: tickets.length,
      lowStock: products.filter((product: any) => product.stock <= 5).length,
      recentOrders: orders.slice(0, 6)
    });
  })
);

router.get(
  "/admin/customers",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await User.find({ role: "client" }).select("-password").sort({ createdAt: -1 })))
);

router.get(
  "/admin/orders",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await Order.find().sort({ createdAt: -1 }).populate("user", "name email")))
);

router.get(
  "/admin/support",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await SupportTicket.find().populate("user", "name email").sort({ createdAt: -1 })))
);

router.patch(
  "/admin/support/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const patch: Record<string, unknown> = {};
    const set: Record<string, unknown> = {};
    if (req.body.status) set.status = req.body.status;
    if (req.body.priority) set.priority = req.body.priority;
    if (Object.keys(set).length) patch.$set = set;
    if (req.body.reply) patch.$push = { replies: { message: req.body.reply, authorRole: "admin" } };

    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.json(ticket);
  })
);

router.get(
  "/admin/coupons",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await Coupon.find().sort({ createdAt: -1 })))
);

router.get(
  "/admin/payment-methods",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await PaymentMethod.find().sort({ sortOrder: 1 })))
);

export const apiRoutes = router;
