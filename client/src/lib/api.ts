import { fallbackOrders, fallbackProducts } from "../data/fallback";
import type { Address, ClientUser, ContentPage, Coupon, Order, PaymentMethod, Product, ProductReview, SupportTicket } from "../types";

function getApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window === "undefined") return "http://localhost:5000/api";
  if (["localhost", "127.0.0.1"].includes(window.location.hostname) || /^192\.168\./.test(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
}

const API_URL = getApiUrl();
const PRODUCTS_CACHE_MS = 300_000;
const HOMEPAGE_CACHE_MS = 300_000;
const PRODUCTS_STORAGE_KEY = "aaradhya-products-cache";
const HOMEPAGE_STORAGE_KEY = "aaradhya-homepage-cache";
let productsCache: Product[] | undefined;
let productsCacheAt = 0;
let productsRequest: Promise<Product[]> | undefined;
let homepageCache: HomepageContent | undefined;
let homepageCacheAt = 0;
let homepageRequest: Promise<HomepageContent> | undefined;

hydrateRuntimeCaches();

export type HomepageHeroSlide = {
  id: string;
  image: string;
  heading: string;
  subheading: string;
  cta: string;
  href: string;
  active: boolean;
};

export type HomepageTrendingProduct = {
  id: number;
  slug: string;
  image: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: string;
  badge: "New arrival";
  category: string;
  purpose: string;
  enabled: boolean;
};

export type HomepageTraditionGalleryItem = {
  image: string;
  label: string;
  href: string;
  className: string;
};

export type HomepageContent = {
  settings: HomepageSettings;
  hero: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    slides: HomepageHeroSlide[];
  };
  trending: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    products: HomepageTrendingProduct[];
  };
  traditionGallery: {
    enabled: boolean;
    heading: string;
    items: HomepageTraditionGalleryItem[];
  };
};

export type HomepageSettings = {
  brandName: string;
  brandTagline: string;
  logoText: string;
  footerDescription: string;
  supportCta: string;
  searchPlaceholders: string[];
  announcements: Array<{ text: string; href: string; active: boolean }>;
  navItems: Array<{ label: string; href: string; dropdown: boolean; active: boolean }>;
  categoryStrip: Array<{ name: string; value: string; image: string; active: boolean }>;
  collectionCircles: Array<{ name: string; value: string; href: string; image: string; active: boolean }>;
  purposeCards: Array<{ name: string; value: string; image: string; active: boolean }>;
};

export const fallbackHomepage: HomepageContent = {
  settings: {
    brandName: "Aaradhya",
    brandTagline: "Beads",
    logoText: "Jap",
    footerDescription: "A complete ecommerce build for spiritual bracelets, malas, crystals, orders, and admin operations.",
    supportCta: "Chat with Sevak",
    searchPlaceholders: ["Search for Rudraksha", "Search for Karungali", "Search for Pyrite"],
    announcements: [
      { text: "100% Cashback available upto Rs.500", href: "/pages/cashback-policy", active: true },
      { text: "Free delivery on orders over Rs.299", href: "/collections", active: true },
      { text: "Har Ghar Rudraksha - Claim Free 5 Mukhi", href: "/collections?collection=Rudraksha", active: true }
    ],
    navItems: [
      { label: "Rudraksha", href: "/collections?collection=Rudraksha", dropdown: true, active: true },
      { label: "Energy Stones", href: "/collections?collection=Energy%20Stones", dropdown: true, active: true },
      { label: "Karungali", href: "/collections?collection=Karungali", dropdown: false, active: true },
      { label: "Combos", href: "/collections?collection=Combos", dropdown: true, active: true },
      { label: "Spiritual Jewellery", href: "/collections?collection=Spiritual%20Jewellery", dropdown: true, active: true },
      { label: "Gift Hampers", href: "/collections?collection=Gift%20Hampers", dropdown: true, active: true },
      { label: "Bulk / Wholesale", href: "/pages/bulk-wholesale", dropdown: false, active: true },
      { label: "Support", href: "/support", dropdown: true, active: true }
    ],
    categoryStrip: [
      { name: "Rudraksha", value: "Rudraksha", image: "/assets/categories/rudraksha.png", active: true },
      { name: "Karungali", value: "Karungali", image: "/assets/categories/karungali.png", active: true },
      { name: "Pyrite", value: "Pyrite", image: "/assets/categories/pyrite.png", active: true },
      { name: "Sandalwood", value: "Sandalwood", image: "/assets/categories/sandalwood.png", active: true },
      { name: "Sphatik", value: "Sphatik", image: "/assets/categories/sphatik.png", active: true },
      { name: "Tiger Eye", value: "Tiger Eye", image: "/assets/categories/tiger-eye.png", active: true },
      { name: "Rose Quartz", value: "Rose Quartz", image: "/assets/categories/rose-quartz.png", active: true },
      { name: "Amethyst", value: "Amethyst", image: "/assets/categories/amethyst.png", active: true },
      { name: "Combos", value: "Combos", image: "/assets/products/hero-spiritual-shop.jpg", active: true },
      { name: "Gift Hampers", value: "Gift Hampers", image: "/assets/categories/gift-hampers.jpg", active: true }
    ],
    collectionCircles: [
      { name: "Rudraksha Bracelets", value: "Rudraksha Bracelets", href: "/collections?collection=Rudraksha%20Bracelets", image: "/assets/collections/rudraksha-bracelets.jpg", active: true },
      { name: "Rudraksha Malas", value: "Rudraksha Malas", href: "/collections?collection=Rudraksha%20Malas", image: "/assets/collections/rudraksha-malas.jpg", active: true },
      { name: "Nepali/Indian Rudraksha", value: "Rudraksha", href: "/collections?collection=Rudraksha", image: "/assets/collections/nepali-indian-rudraksha.jpg", active: true },
      { name: "Spiritual Jewellery", value: "Spiritual Jewellery", href: "/collections?collection=Spiritual%20Jewellery", image: "/assets/collections/spiritual-jewellery.jpg", active: true },
      { name: "Karungali Wearables", value: "Karungali", href: "/collections?collection=Karungali", image: "/assets/collections/karungali-wearables.jpg", active: true },
      { name: "Energy Stones", value: "Energy Stones", href: "/collections?collection=Energy%20Stones", image: "/assets/collections/energy-stones.jpg", active: true },
      { name: "Pyrite Wearables", value: "Pyrite", href: "/collections?bead=Pyrite", image: "/assets/collections/pyrite-wearables.jpg", active: true },
      { name: "Combo Deals", value: "Combos", href: "/collections?collection=Combos", image: "/assets/products/hero-spiritual-shop.jpg", active: true },
      { name: "Gift Hampers", value: "Gift Hampers", href: "/collections?collection=Gift%20Hampers", image: "/assets/categories/gift-hampers.jpg", active: true }
    ],
    purposeCards: [
      { name: "Wealth", value: "Wealth", image: "/assets/purpose/wealth.jpg", active: true },
      { name: "Health", value: "Health", image: "/assets/purpose/health.jpg", active: true },
      { name: "Love", value: "Love", image: "/assets/purpose/love.jpg", active: true },
      { name: "Luck", value: "Luck", image: "/assets/purpose/luck.jpg", active: true },
      { name: "Protection", value: "Protection", image: "/assets/purpose/protection.jpg", active: true },
      { name: "Peace", value: "Peace", image: "/assets/purpose/peace.jpg", active: true },
      { name: "Courage", value: "Courage", image: "/assets/purpose/courage.jpg", active: true },
      { name: "Balance", value: "Balance", image: "/assets/purpose/balance.jpg", active: true }
    ]
  },
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
  },
  trending: {
    enabled: true,
    autoplay: true,
    intervalMs: 4000,
    products: [
      { id: 1, slug: "gold-plated-modern-rudraksha-bracelet", image: "/assets/products/rudraksha-bracelet.jpg", name: "Gold Plated Modern Rudraksha Bracelet", price: 599, oldPrice: 999, discount: "40% OFF", badge: "New arrival", category: "Rudraksha", purpose: "Protection", enabled: true },
      { id: 2, slug: "brown-rudraksha-mala-108-1-beads", image: "/assets/products/meditation-mala.jpg", name: "Brown Rudraksha Mala - 108+1 Beads", price: 599, oldPrice: 999, discount: "40% OFF", badge: "New arrival", category: "Rudraksha", purpose: "Peace", enabled: true },
      { id: 3, slug: "pyrite-money-magnet-bracelet", image: "/assets/products/pyrite-tiger-eye.jpg", name: "Pyrite Money Magnet Bracelet", price: 999, oldPrice: 1599, discount: "38% OFF", badge: "New arrival", category: "Pyrite", purpose: "Wealth", enabled: true },
      { id: 4, slug: "rose-quartz-rudraksha-nazar-raksha-band", image: "/assets/home/rose-quartz.png", name: "Rose Quartz Rudraksha Nazar Raksha Band", price: 699, oldPrice: 1099, discount: "36% OFF", badge: "New arrival", category: "Rose Quartz", purpose: "Love", enabled: true },
      { id: 5, slug: "healing-sphatik-health-mala", image: "/assets/home/sphatik.png", name: "Healing Sphatik Health Mala", price: 899, oldPrice: 1399, discount: "36% OFF", badge: "New arrival", category: "Sphatik", purpose: "Health", enabled: true },
      { id: 6, slug: "tiger-eye-courage-bracelet", image: "/assets/home/tiger-eye.png", name: "Tiger Eye Courage Bracelet", price: 849, oldPrice: 1299, discount: "35% OFF", badge: "New arrival", category: "Tiger Eye", purpose: "Courage", enabled: true }
    ]
  },
  traditionGallery: {
    enabled: true,
    heading: "Rooted In Tradition, Made For Today",
    items: [
      { image: "/assets/tradition/mahakal-mala.jpg", label: "Mahakal Rudraksha Mala", href: "/collections?collection=Rudraksha%20Malas", className: "lg:col-span-1" },
      { image: "/assets/tradition/red-sandalwood.jpg", label: "Red Sandalwood Mala", href: "/collections?bead=Sandalwood", className: "lg:col-span-1" },
      { image: "/assets/tradition/dreamy-duo.jpg", label: "Dreamy Duo Bands", href: "/collections?collection=Energy%20Stones", className: "sm:col-span-2 lg:col-span-2" },
      { image: "/assets/tradition/silver-rudraksha-mala.jpg", label: "Silver Rudraksha Mala", href: "/collections?collection=Rudraksha%20Malas", className: "lg:col-span-1" },
      { image: "/assets/tradition/golden-beads-modern.jpg", label: "Modern Golden Beads", href: "/collections?collection=Rudraksha%20Bracelets", className: "lg:col-span-1" },
      { image: "/assets/tradition/lunar-karungali.jpg", label: "Lunar Karungali Bracelet", href: "/collections?collection=Karungali", className: "sm:col-span-2 lg:col-span-2" },
      { image: "/assets/tradition/pyrite-splash.jpg", label: "Pyrite Stone Splash", href: "/collections?bead=Pyrite", className: "lg:col-span-1" },
      { image: "/assets/tradition/tiger-eye-om.jpg", label: "Tiger Eye Om Band", href: "/products/natural-tiger-eye-om-band", className: "lg:col-span-1" },
      { image: "/assets/tradition/amethyst-band.jpg", label: "Amethyst Mystic Band", href: "/collections?bead=Amethyst", className: "sm:col-span-2 lg:col-span-2" }
    ]
  }
};

function hydrateRuntimeCaches() {
  if (typeof window === "undefined") return;

  const products = readStoredCache<Product[]>(PRODUCTS_STORAGE_KEY);
  if (products && Date.now() - products.at < PRODUCTS_CACHE_MS) {
    productsCache = products.value;
    productsCacheAt = products.at;
  }

  const homepage = readStoredCache<HomepageContent>(HOMEPAGE_STORAGE_KEY);
  if (homepage && Date.now() - homepage.at < HOMEPAGE_CACHE_MS) {
    homepageCache = homepage.value;
    homepageCacheAt = homepage.at;
  }
}

function readStoredCache<T>(key: string) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as { value: T; at: number };
  } catch {
    return undefined;
  }
}

function writeStoredCache<T>(key: string, value: T, at: number) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, at }));
  } catch {
    // Ignore storage quota and privacy-mode failures; memory cache still works.
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      cache: options?.method && options.method !== "GET" ? "no-store" : "default",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers
      }
    });
  } catch {
    throw new Error(`Backend API is not reachable at ${API_URL}. Please start the server and try again.`);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export async function getProducts(options: { force?: boolean } = {}): Promise<Product[]> {
  if (!options.force && productsCache && Date.now() - productsCacheAt < PRODUCTS_CACHE_MS) return productsCache;
  if (productsRequest) return productsRequest;

  productsRequest = (async () => {
    try {
      productsCache = await request<Product[]>("/products");
      productsCacheAt = Date.now();
      writeStoredCache(PRODUCTS_STORAGE_KEY, productsCache, productsCacheAt);
    } catch {
      productsCache = fallbackProducts;
      productsCacheAt = Date.now();
    } finally {
      productsRequest = undefined;
    }
    return productsCache || fallbackProducts;
  })();

  return productsRequest;
}

export function getProductsSnapshot(): Product[] {
  return productsCache || fallbackProducts;
}

export async function refreshProducts(): Promise<Product[]> {
  productsCache = undefined;
  productsCacheAt = 0;
  productsRequest = undefined;
  return getProducts({ force: true });
}

export async function getHomepage(options: { force?: boolean } = {}): Promise<HomepageContent> {
  if (!options.force && homepageCache && Date.now() - homepageCacheAt < HOMEPAGE_CACHE_MS) return homepageCache;
  if (homepageRequest) return homepageRequest;

  homepageRequest = (async () => {
    try {
      homepageCache = await request<HomepageContent>("/content/homepage");
      homepageCacheAt = Date.now();
      writeStoredCache(HOMEPAGE_STORAGE_KEY, homepageCache, homepageCacheAt);
    } catch {
      homepageCache = fallbackHomepage;
      homepageCacheAt = Date.now();
    } finally {
      homepageRequest = undefined;
    }
    return homepageCache || fallbackHomepage;
  })();

  return homepageRequest;
}

export function prefetchStorefrontData() {
  void getHomepage();
  void getProducts();
}

export type PincodeLocation = {
  pincode: string;
  city: string;
  district: string;
  state: string;
  postOffice: string;
};

export async function lookupPincode(pincode: string): Promise<PincodeLocation> {
  const digits = pincode.replace(/\D/g, "");
  if (!/^\d{6}$/.test(digits)) throw new Error("Enter a valid 6 digit PIN code.");
  return request<PincodeLocation>(`/content/pincode/${digits}`);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const cacheFresh = productsCache && Date.now() - productsCacheAt < PRODUCTS_CACHE_MS;
  const cachedProduct = cacheFresh ? productsCache?.find((product) => product.slug === slug) : undefined;
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

export async function requestOtp(email: string) {
  return request<{ message: string; email?: string; phone?: string; expiresInSeconds: number; smsSent?: boolean; devOtp?: string }>("/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function verifyOtp(payload: { email: string; code: string; name?: string }) {
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
    throw new Error("Please login with email OTP first.");
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
    if (!saved) throw new Error("Please login with email OTP first.");
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
    return await request<Array<{ _id: string; name: string; email: string; phone?: string; orders?: number; spent?: number; productCount?: number; segment?: string; createdAt?: string }>>(
      "/admin/customers"
    );
  } catch {
    return [
      { _id: "1", name: "Client User", email: "client@demo.com", phone: "8888888888", orders: 1, spent: 899, productCount: 1, segment: "New Customer", createdAt: "2026-06-22" },
      { _id: "2", name: "Asha Sharma", email: "asha@example.com", phone: "9876543210", orders: 4, spent: 5396, productCount: 6, segment: "VIP", createdAt: "2026-06-20" }
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

async function getOrdersBySavedAccount(): Promise<Order[] | undefined> {
  const saved = localStorage.getItem("user");
  if (!saved) return [];

  const user = JSON.parse(saved) as Partial<ClientUser>;
  const email = String(user.email || "").trim().toLowerCase();
  const phone = String(user.phone || "").trim();
  if (!email && !phone) return [];

  try {
    return await request<Order[]>("/users/assistant/orders", {
      method: "POST",
      body: JSON.stringify({ email, phone })
    });
  } catch {
    return undefined;
  }
}

export async function getMySupportTickets(): Promise<SupportTicket[]> {
  try {
    return await request<SupportTicket[]>("/users/support/my");
  } catch {
    return [];
  }
}

export async function getMyOrders(): Promise<Order[]> {
  try {
    return await request<Order[]>("/users/me/orders");
  } catch (error) {
    const savedAccountOrders = await getOrdersBySavedAccount();
    if (savedAccountOrders) return savedAccountOrders;
    throw error;
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
