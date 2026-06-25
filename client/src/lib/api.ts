import { fallbackOrders, fallbackProducts } from "../data/fallback";
import type { Address, ClientUser, ContentPage, Coupon, Order, PaymentMethod, Product, ProductReview, SupportTicket } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
let productsCache: Product[] | undefined;
let productsRequest: Promise<Product[]> | undefined;
let homepageCache: HomepageContent | undefined;
let homepageRequest: Promise<HomepageContent> | undefined;

export type HomepageHeroSlide = {
  id: string;
  image: string;
  heading: string;
  subheading: string;
  cta: string;
  href: string;
  active: boolean;
};

export type HomepageContent = {
  hero: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    slides: HomepageHeroSlide[];
  };
};

export const fallbackHomepage: HomepageContent = {
  hero: {
    enabled: true,
    autoplay: true,
    intervalMs: 5000,
    slides: [
      {
        id: "hero-rudraksha",
        image: "/assets/banners/rudraksha.jpg",
        heading: "Rudraksha Collection Banner",
        subheading: "Certified rudraksha wearables crafted for modern, everyday devotion.",
        cta: "Explore Rudraksha",
        href: "/collections?collection=Rudraksha",
        active: true
      },
      {
        id: "hero-karungali",
        image: "/assets/banners/karungali.jpg",
        heading: "Karungali Collection Banner",
        subheading: "Grounded Karungali-inspired bracelets and malas for protection styling.",
        cta: "Shop Karungali",
        href: "/collections?collection=Karungali",
        active: true
      },
      {
        id: "hero-energy-stones",
        image: "/assets/banners/energy-stones.jpg",
        heading: "Energy Stones Collection Banner",
        subheading: "Pyrite, rose quartz, tiger eye, sphatik, and more energy stone essentials.",
        cta: "Discover Stones",
        href: "/collections?collection=Energy%20Stones",
        active: true
      },
      {
        id: "hero-spiritual-jewellery",
        image: "/assets/banners/spiritual-jewellery.jpg",
        heading: "Spiritual Jewellery Banner",
        subheading: "Sacred jewellery pieces with premium finishes for rituals and gifting.",
        cta: "View Jewellery",
        href: "/collections?collection=Spiritual%20Jewellery",
        active: true
      }
    ]
  }
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export async function getProducts(): Promise<Product[]> {
  if (productsCache) return productsCache;
  if (productsRequest) return productsRequest;

  productsRequest = (async () => {
    try {
      productsCache = await request<Product[]>("/products");
    } catch {
      productsCache = fallbackProducts;
    } finally {
      productsRequest = undefined;
    }
    return productsCache;
  })();

  return productsRequest;
}

export async function refreshProducts(): Promise<Product[]> {
  productsCache = undefined;
  productsRequest = undefined;
  return getProducts();
}

export async function getHomepage(): Promise<HomepageContent> {
  if (homepageCache) return homepageCache;
  if (homepageRequest) return homepageRequest;

  homepageRequest = (async () => {
    try {
      homepageCache = await request<HomepageContent>("/content/homepage");
    } catch {
      homepageCache = fallbackHomepage;
    } finally {
      homepageRequest = undefined;
    }
    return homepageCache;
  })();

  return homepageRequest;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const cachedProduct = productsCache?.find((product) => product.slug === slug);
  if (cachedProduct) return cachedProduct;

  try {
    return await request<Product>(`/products/${slug}`);
  } catch {
    return fallbackProducts.find((product) => product.slug === slug);
  }
}

export async function getProductReviews(slug: string): Promise<ProductReview[]> {
  try {
    return await request<ProductReview[]>(`/reviews/product/${slug}`);
  } catch {
    return [
      {
        name: "Client User",
        rating: 5,
        comment: "Beautiful finishing and the packaging feels premium.",
        orderNumber: "ORD-24062001",
        verifiedPurchase: true,
        createdAt: "2026-06-22T09:00:00.000Z"
      },
      {
        name: "Asha Sharma",
        rating: 4,
        comment: "Good quality and delivery estimate was accurate for my pincode.",
        orderNumber: "ORD-24062002",
        verifiedPurchase: true,
        createdAt: "2026-06-20T09:00:00.000Z"
      }
    ];
  }
}

export async function getPage(slug: string): Promise<ContentPage | undefined> {
  const fallbackPages: ContentPage[] = [
    {
      title: "Refund & Return Policy",
      slug: "refund-return-policy",
      type: "policy",
      excerpt: "Return and replacement rules for orders.",
      body: "Returns and replacements can be requested from customer support with your order number. The item must be unused, safely packed, and reviewed by the support team before approval.\n\nRefunds are processed after quality inspection. Shipping charges, COD fees, and payment gateway charges may be non-refundable depending on the case.\n\nFor damaged, wrong, or missing items, contact support with photos and unboxing details as soon as possible."
    },
    {
      title: "Shipping Policy",
      slug: "shipping-policy",
      type: "policy",
      excerpt: "Dispatch, delivery, and shipping charges.",
      body: "Orders are usually packed within 24-48 working hours. Standard delivery timelines depend on pincode and courier availability.\n\nFree shipping applies above the configured cart value. Express shipping may be available for selected addresses with an additional fee.\n\nTracking details are shared after dispatch and can be checked from the Track Order page."
    },
    {
      title: "Cancellation Policy",
      slug: "cancellation-policy",
      type: "policy",
      excerpt: "How cancellations work before dispatch.",
      body: "Cancellation requests can be accepted before the order is packed or dispatched. Once an order is shipped, the customer can use the return or exchange process instead.\n\nFor prepaid orders, approved cancellations are refunded to the original payment source or store credit based on your business configuration."
    },
    {
      title: "Cashback Policy",
      slug: "cashback-policy",
      type: "policy",
      excerpt: "Rules for promotional cashback offers.",
      body: "Cashback offers are promotional and may be limited by order value, product category, date, and customer eligibility.\n\nCashback is not transferable and cannot be exchanged for cash unless your business policy explicitly allows it. Fraudulent or cancelled orders are not eligible."
    },
    {
      title: "Terms of Service",
      slug: "terms-of-service",
      type: "policy",
      excerpt: "General terms for using the website.",
      body: "By using this website, customers agree to the listed prices, policies, checkout process, and support terms. Product images and descriptions are provided for shopping guidance.\n\nThe business may update prices, offers, inventory, and policies as required. Final production terms should be reviewed legally before launch."
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      type: "policy",
      excerpt: "Customer data and privacy handling.",
      body: "Customer information is used for order processing, delivery, support, and account services. Sensitive payment information should be handled only by a compliant payment gateway.\n\nBefore launch, configure cookie consent, analytics consent, data retention, and regional privacy requirements."
    },
    {
      title: "Bulk / Wholesale",
      slug: "bulk-wholesale",
      type: "landing",
      excerpt: "Bulk order support for gifts and wholesale.",
      body: "For corporate gifting, festival hampers, wholesale pricing, or custom product bundles, contact support with your quantity, delivery city, and timeline.\n\nThe admin team can manage bulk requests through support tickets and custom order notes."
    },
    {
      title: "Contact Us",
      slug: "contact-us",
      type: "support",
      excerpt: "Get help with orders, returns, cancellations, and product information.",
      body: "Our support team can help with order tracking, returns and exchanges, cancellations, product information, and general shopping questions.\n\nFor faster help, include your order number, phone number, and a clear description of the issue. You can create a support ticket from the Customer Support page.\n\nBusiness hours are Monday to Saturday, 10 AM to 5 PM. Most replies are handled within 24 working hours."
    },
    {
      title: "Aaradhya on Amazon",
      slug: "marketplace-store",
      type: "landing",
      excerpt: "Marketplace store link placeholder.",
      body: "Use this page for your marketplace or Amazon store link once your seller account is ready.\n\nIn production, replace this placeholder with your real marketplace URL, product collections, trust badges, and customer support notes for marketplace orders."
    },
    {
      title: "Returns / Exchange",
      slug: "returns-exchange",
      type: "support",
      excerpt: "Start a return or exchange request.",
      body: "To request a return or exchange, create a support ticket with your order number, issue type, and photos if applicable.\n\nThe support team will review your request and guide you through pickup, replacement, refund, or store credit options."
    }
  ];

  try {
    return await request<ContentPage>(`/content/pages/${slug}`);
  } catch {
    return fallbackPages.find((page) => page.slug === slug);
  }
}

export async function placeOrder(payload: unknown): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    return await request<PaymentMethod[]>("/payments/methods");
  } catch {
    return [
      {
        code: "cod",
        label: "Cash on Delivery",
        description: "Pay when your order is delivered.",
        type: "cod",
        provider: "manual",
        instructions: "Keep exact cash ready at delivery.",
        fee: 0
      },
      {
        code: "upi",
        label: "UPI",
        description: "Pay securely using any UPI app.",
        type: "online",
        provider: "razorpay",
        instructions: "Mock online payment for local development.",
        apps: [
          { code: "gpay", label: "Google Pay", logoText: "GPay", brandColor: "#1a73e8", deepLink: "upi://pay", instructions: "Open Google Pay and approve payment." },
          { code: "phonepe", label: "PhonePe", logoText: "Pe", brandColor: "#5f259f", deepLink: "phonepe://pay", instructions: "Open PhonePe and approve payment." },
          { code: "paytm-upi", label: "Paytm UPI", logoText: "Paytm", brandColor: "#00baf2", deepLink: "paytmmp://pay", instructions: "Open Paytm and approve payment." },
          { code: "bhim", label: "BHIM", logoText: "BHIM", brandColor: "#f58220", deepLink: "upi://pay", instructions: "Open BHIM or any UPI app." }
        ],
        fee: 0
      },
      {
        code: "card",
        label: "Credit or Debit Card",
        description: "Card gateway-ready payment method.",
        type: "online",
        provider: "razorpay",
        instructions: "Connect a real gateway before production.",
        fee: 0
      },
      {
        code: "netbanking",
        label: "Net Banking",
        description: "Pay through your bank account.",
        type: "online",
        provider: "cashfree",
        instructions: "Connect a real gateway before production.",
        fee: 0
      },
      {
        code: "wallet",
        label: "Wallet",
        description: "Pay using a supported wallet app.",
        type: "online",
        provider: "cashfree",
        instructions: "Choose your wallet and approve the payment.",
        apps: [
          { code: "amazon-pay", label: "Amazon Pay", logoText: "amazon pay", brandColor: "#ff9900", deepLink: "amazonpay://pay", instructions: "Continue to Amazon Pay." },
          { code: "mobikwik", label: "MobiKwik", logoText: "MobiKwik", brandColor: "#0078ff", deepLink: "mobikwik://pay", instructions: "Continue to MobiKwik." },
          { code: "paytm-wallet", label: "Paytm Wallet", logoText: "Paytm", brandColor: "#00baf2", deepLink: "paytmmp://wallet", instructions: "Continue to Paytm Wallet." },
          { code: "freecharge", label: "Freecharge", logoText: "Freecharge", brandColor: "#e31e24", deepLink: "freecharge://pay", instructions: "Continue to Freecharge." }
        ],
        fee: 0
      }
    ];
  }
}

export async function createMockPayment(payload: { methodCode: string; amount: number; appCode?: string }) {
  return request<{ paymentReference: string; status: string; provider: string }>("/payments/mock-intent", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function validateCoupon(code: string, subtotal: number) {
  return request<{ coupon: unknown; discount: number }>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal })
  });
}

export async function getPublicCoupons(): Promise<Coupon[]> {
  try {
    return await request<Coupon[]>("/coupons/public");
  } catch {
    return [
      { code: "FIRST10", type: "percent", value: 10, minSubtotal: 799, active: true },
      { code: "DIVINE150", type: "flat", value: 150, minSubtotal: 1499, active: true }
    ];
  }
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: unknown }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function requestOtp(phone: string) {
  return request<{ message: string; phone: string; expiresInSeconds: number; devOtp?: string }>("/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export async function verifyOtp(payload: { phone: string; code: string; name?: string }) {
  return request<{ token: string; user: ClientUser }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getProfile(): Promise<ClientUser> {
  try {
    return await request<ClientUser>("/users/me");
  } catch {
    const saved = localStorage.getItem("user");
    if (saved) return JSON.parse(saved) as ClientUser;
    throw new Error("Please login with mobile OTP first.");
  }
}

export async function updateProfile(payload: Partial<ClientUser> & { addresses?: Address[] }): Promise<ClientUser> {
  try {
    const user = await request<ClientUser>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch {
    const saved = localStorage.getItem("user");
    if (!saved) throw new Error("Please login with mobile OTP first.");
    const user = { ...(JSON.parse(saved) as ClientUser), ...payload };
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }
}

export async function getAdminDashboard() {
  try {
    return await request<{
      revenue: number;
      orders: number;
      pendingOrders: number;
      products: number;
      customers: number;
      lowStock: number;
      recentOrders: Order[];
    }>("/admin/dashboard");
  } catch {
    return {
      revenue: 78450,
      orders: 128,
      pendingOrders: 16,
      products: fallbackProducts.length,
      customers: 86,
      lowStock: 1,
      recentOrders: fallbackOrders
    };
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    return await request<Order[]>("/orders");
  } catch {
    return fallbackOrders;
  }
}

export async function getCustomers() {
  try {
    return await request<Array<{ _id: string; name: string; email: string; phone?: string; createdAt?: string }>>(
      "/admin/customers"
    );
  } catch {
    return [
      { _id: "1", name: "Client User", email: "client@demo.com", phone: "8888888888", createdAt: "2026-06-22" },
      { _id: "2", name: "Asha Sharma", email: "asha@example.com", phone: "9876543210", createdAt: "2026-06-20" }
    ];
  }
}

export async function createSupportTicket(payload: unknown): Promise<SupportTicket> {
  return request<SupportTicket>("/users/support", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAssistantOrders(phone: string): Promise<Order[]> {
  try {
    return await request<Order[]>("/users/assistant/orders", {
      method: "POST",
      body: JSON.stringify({ phone })
    });
  } catch {
    const normalized = phone.replace(/\D/g, "").slice(-10);
    return fallbackOrders.filter((order) => order.customer.phone.replace(/\D/g, "").endsWith(normalized));
  }
}

export async function getMySupportTickets(): Promise<SupportTicket[]> {
  try {
    return await request<SupportTicket[]>("/users/support/my");
  } catch {
    return [
      {
        _id: "ticket-1",
        name: "Client User",
        email: "client@demo.com",
        phone: "8888888888",
        orderNumber: "ORD-24062001",
        category: "order-tracking",
        subject: "Need delivery update",
        message: "Please share the expected delivery date for my order.",
        status: "open",
        priority: "normal",
        createdAt: "2026-06-22T09:00:00.000Z"
      }
    ];
  }
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    return await request<SupportTicket[]>("/users/support");
  } catch {
    return [
      {
        _id: "ticket-1",
        name: "Client User",
        email: "client@demo.com",
        phone: "8888888888",
        orderNumber: "ORD-24062001",
        category: "order-tracking",
        subject: "Need delivery update",
        message: "Please share the expected delivery date for my order.",
        status: "open",
        priority: "normal",
        createdAt: "2026-06-22T09:00:00.000Z"
      },
      {
        _id: "ticket-2",
        name: "Asha Sharma",
        email: "asha@example.com",
        phone: "9876543210",
        category: "product-info",
        subject: "Need bracelet size help",
        message: "Which size is best for daily wear?",
        status: "in-progress",
        priority: "low",
        createdAt: "2026-06-21T10:30:00.000Z"
      }
    ];
  }
}

export async function updateSupportTicket(id: string, payload: unknown): Promise<SupportTicket> {
  return request<SupportTicket>(`/users/support/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function trackOrder(orderNumber: string): Promise<Order | undefined> {
  try {
    return await request<Order>(`/orders/track/${orderNumber}`);
  } catch {
    return fallbackOrders.find((order) => order.orderNumber === orderNumber);
  }
}
