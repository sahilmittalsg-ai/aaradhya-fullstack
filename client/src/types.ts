export type Product = {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  collection: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  rating: number;
  images: string[];
  tags: string[];
  purpose?: string[];
  bead?: string;
  mukhi?: string;
  plating?: string;
  audience?: string;
  benefits?: string[];
  materials?: string[];
  careInstructions?: string;
  sizeOptions?: Array<{
    label: string;
    value: string;
    stock: number;
  }>;
  addOnServices?: Array<{
    code: string;
    title: string;
    description: string;
    price: number;
    active: boolean;
  }>;
  delivery?: {
    minDays: number;
    maxDays: number;
    expressMinDays: number;
    expressMaxDays: number;
  };
  featured: boolean;
};

export type CartItem = Product & {
  cartKey?: string;
  quantity: number;
  selectedSize?: string;
  selectedSizeLabel?: string;
  selectedAddOns?: Array<{
    code: string;
    title: string;
    price: number;
  }>;
};

export type ProductReview = {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  orderNumber?: string;
  verifiedPurchase: boolean;
  createdAt?: string;
};

export type Order = {
  _id?: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  customerSummary?: {
    id?: string;
    _id?: string;
    orders?: number;
    spent?: number;
    productCount?: number;
    segment?: string;
  };
  status: "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  mrpTotal?: number;
  productDiscount?: number;
  subtotal?: number;
  shipping?: number;
  paymentFee?: number;
  discount?: number;
  totalDiscount?: number;
  tax?: number;
  total: number;
  createdAt?: string;
  items: CartItem[];
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
  };
  paymentMethod?: "cod" | "upi" | "card" | "netbanking" | "wallet";
  paymentApp?: string;
  paymentProvider?: string;
  paymentReference?: string;
  trackingId?: string;
  courierPartner?: string;
  adminNotes?: string;
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
};

export type ClientUser = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "client";
  phone?: string;
  phoneVerifiedAt?: string;
  addresses?: Address[];
};

export type PaymentMethod = {
  _id?: string;
  code: "cod" | "upi" | "card" | "netbanking" | "wallet";
  label: string;
  description: string;
  type: "cod" | "online";
  provider: string;
  instructions: string;
  apps?: PaymentApp[];
  fee: number;
};

export type PaymentApp = {
  code: string;
  label: string;
  logoText: string;
  brandColor: string;
  deepLink: string;
  instructions: string;
  active?: boolean;
};

export type SupportTicket = {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  category: "order-tracking" | "returns-exchange" | "cancellation" | "product-info" | "bulk-wholesale" | "something-else";
  subject: string;
  message: string;
  priority?: "low" | "normal" | "high";
  status: "open" | "in-progress" | "resolved";
  replies?: Array<{
    message: string;
    authorRole: "admin" | "client";
    createdAt: string;
  }>;
  createdAt?: string;
};

export type Coupon = {
  _id?: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minSubtotal: number;
  active: boolean;
};

export type ContentPage = {
  _id?: string;
  title: string;
  slug: string;
  type: "policy" | "landing" | "support" | "about";
  excerpt: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "client";
  phone?: string;
};
