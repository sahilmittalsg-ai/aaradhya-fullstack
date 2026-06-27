import { orders as fallbackOrders } from "../data";
import type { AdminOrder, AdminProduct } from "../data";

function getApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window === "undefined") return "http://localhost:5000/api";
  if (["localhost", "127.0.0.1"].includes(window.location.hostname) || /^192\.168\./.test(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
}

const API_URL = getApiUrl();
const adminTokenKey = "aaradhya-admin-api-token";
const ADMIN_CATALOG_CACHE_MS = 60_000;
const ADMIN_ORDERS_CACHE_MS = 15_000;
const ADMIN_GENERAL_CACHE_MS = 45_000;
let adminProductsCache: ApiProduct[] | undefined;
let adminProductsCacheAt = 0;
let adminProductsRequest: Promise<ApiProduct[]> | undefined;
let adminCategoriesCache: ApiCategory[] | undefined;
let adminCategoriesCacheAt = 0;
let adminCategoriesRequest: Promise<ApiCategory[]> | undefined;
let adminOrdersCache: ApiOrder[] | undefined;
let adminOrdersCacheAt = 0;
let adminOrdersRequest: Promise<ApiOrder[]> | undefined;
let adminHomepageCache: ApiHomepage | undefined;
let adminCustomersCache: ApiCustomer[] | undefined;
let adminCustomersCacheAt = 0;
let adminCustomersRequest: Promise<ApiCustomer[]> | undefined;
let adminCouponsCache: ApiCoupon[] | undefined;
let adminCouponsCacheAt = 0;
let adminCouponsRequest: Promise<ApiCoupon[]> | undefined;
let adminSupportCache: ApiSupportTicket[] | undefined;
let adminSupportCacheAt = 0;
let adminSupportRequest: Promise<ApiSupportTicket[]> | undefined;
let adminSiteSettingsCache: ApiSiteSettings | undefined;
let adminSiteSettingsCacheAt = 0;
let adminSiteSettingsRequest: Promise<ApiSiteSettings> | undefined;

export type ApiProduct = {
  _id?: string;
  title: string;
  slug?: string;
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
  featured: boolean;
  active?: boolean;
};

export type ApiCategory = {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  featured?: boolean;
  active?: boolean;
};

export type ApiCoupon = {
  _id?: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minSubtotal: number;
  active: boolean;
};

export type ApiOrder = {
  _id?: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    product?: string;
    title: string;
    image: string;
    quantity: number;
    selectedSizeLabel?: string;
    price: number;
  }>;
  total: number;
  paymentMethod: "cod" | "upi" | "card" | "netbanking" | "wallet";
  paymentStatus: "pending" | "paid" | "failed";
  paymentProvider?: string;
  paymentReference?: string;
  status: "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  courierPartner?: string;
  adminNotes?: string;
  customerSummary?: {
    id?: string;
    _id?: string;
    orders?: number;
    spent?: number;
    productCount?: number;
    segment?: string;
  };
  createdAt?: string;
};

export type ApiSupportTicket = {
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
    createdAt?: string;
  }>;
  createdAt?: string;
};

export type ApiShippingZone = {
  id: string;
  zone: string;
  fee: number;
  cod: boolean;
  eta: string;
};

export type ApiSiteSettings = {
  _id?: string;
  key?: string;
  freeShippingThreshold?: number;
  shippingZones?: ApiShippingZone[];
};

export type ApiCustomer = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  orders?: number;
  spent?: number;
  productCount?: number;
  segment?: string;
  createdAt?: string;
  lastOrderAt?: string;
};

export type ApiHeroSlide = {
  id: string;
  image: string;
  heading: string;
  subheading: string;
  cta: string;
  href: string;
  active: boolean;
};

export type ApiTrendingProduct = {
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

export type ApiTraditionGalleryItem = {
  image: string;
  label: string;
  href: string;
  className: string;
};

export type ApiHomepageSection = {
  key: string;
  title: string;
  description: string;
  active: boolean;
  managePath: string;
};

export type ApiHomepage = {
  settings: ApiHomepageSettings;
  hero: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    slides: ApiHeroSlide[];
  };
  trending: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    products: ApiTrendingProduct[];
  };
  traditionGallery: {
    enabled: boolean;
    heading: string;
    items: ApiTraditionGalleryItem[];
  };
  sections: ApiHomepageSection[];
};

export type ApiHomepageSettings = {
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

export const fallbackHomepage: ApiHomepage = {
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
  },
  sections: [
    { key: "announcement", title: "Announcement Bar", description: "Top black offer strip shown above navbar.", active: true, managePath: "/admin/homepage/announcement" },
    { key: "navbar", title: "Navbar Categories", description: "Main menu categories shown in customer header.", active: true, managePath: "/admin/homepage/navbar" },
    { key: "category-strip", title: "Category Strip", description: "Horizontal category image strip.", active: true, managePath: "/admin/homepage/category-strip" },
    { key: "hero-slider", title: "Hero Slider", description: "Homepage banner photos and autoplay.", active: true, managePath: "/admin/homepage/hero-slider" },
    { key: "latest-trending", title: "Latest & Trending", description: "Homepage product carousel and badges.", active: true, managePath: "/admin/homepage/latest-trending" },
    { key: "shop-collections", title: "Shop Our Collections", description: "Circular category carousel and filters.", active: true, managePath: "/admin/homepage/shop-collections" },
    { key: "shop-purpose", title: "Shop By Purpose", description: "Purpose cards like Wealth, Health, Love, Protection.", active: true, managePath: "/admin/homepage/shop-purpose" },
    { key: "tradition-gallery", title: "Rooted In Tradition Gallery", description: "Six-image lifestyle gallery section.", active: true, managePath: "/admin/homepage/tradition-gallery" },
    { key: "footer", title: "Footer Content", description: "Footer links, support, policy and brand text.", active: true, managePath: "/admin/homepage/footer" }
  ]
};

async function request<T>(path: string, options?: RequestInit, retryAuth = true): Promise<T> {
  const token = localStorage.getItem(adminTokenKey);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: options?.method && options.method !== "GET" ? "no-store" : "default",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers
    }
  });

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && retryAuth && path !== "/auth/login") {
      clearAdminApiSession();
      await loginAdminApi();
      return request<T>(path, options, false);
    }

    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export async function loginAdminApi(email = "admin@demo.com", password = "admin123") {
  const result = await request<{ token: string; user: { role?: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  if (result.user?.role !== "admin") {
    throw new Error("Backend login is not an admin account.");
  }

  localStorage.setItem(adminTokenKey, result.token);
  return result;
}

export function clearAdminApiSession() {
  localStorage.removeItem(adminTokenKey);
}

function clearAdminCatalogCache() {
  adminProductsCache = undefined;
  adminProductsCacheAt = 0;
  adminProductsRequest = undefined;
  adminCategoriesCache = undefined;
  adminCategoriesCacheAt = 0;
  adminCategoriesRequest = undefined;
}

export async function getAdminHomepage() {
  if (adminHomepageCache) return adminHomepageCache;
  adminHomepageCache = await request<ApiHomepage>("/content/admin/homepage");
  return adminHomepageCache;
}

export async function updateAdminHomepage(homepage: ApiHomepage) {
  const updated = await request<ApiHomepage>("/content/admin/homepage", {
    method: "PATCH",
    body: JSON.stringify(homepage)
  });
  adminHomepageCache = updated;
  return updated;
}

export async function getAdminProducts(force = false) {
  if (!force && adminProductsCache && Date.now() - adminProductsCacheAt < ADMIN_CATALOG_CACHE_MS) return adminProductsCache;
  if (adminProductsRequest) return adminProductsRequest;

  adminProductsRequest = (async () => {
    try {
      adminProductsCache = await request<ApiProduct[]>("/products?all=true");
      adminProductsCacheAt = Date.now();
    } finally {
      adminProductsRequest = undefined;
    }
    return adminProductsCache || [];
  })();

  return adminProductsRequest;
}

export async function createAdminProduct(product: Partial<ApiProduct>) {
  const created = await request<ApiProduct>("/products", {
    method: "POST",
    body: JSON.stringify(product)
  });
  clearAdminCatalogCache();
  return created;
}

export async function updateAdminProduct(id: string, product: Partial<ApiProduct>) {
  const updated = await request<ApiProduct>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(product)
  });
  clearAdminCatalogCache();
  return updated;
}

export async function deleteAdminProduct(id: string) {
  const result = await request<{ message: string }>(`/products/${id}`, { method: "DELETE" });
  clearAdminCatalogCache();
  return result;
}

export async function getAdminCategories(force = false) {
  if (!force && adminCategoriesCache && Date.now() - adminCategoriesCacheAt < ADMIN_CATALOG_CACHE_MS) return adminCategoriesCache;
  if (adminCategoriesRequest) return adminCategoriesRequest;

  adminCategoriesRequest = (async () => {
    try {
      adminCategoriesCache = await request<ApiCategory[]>("/categories?all=true");
      adminCategoriesCacheAt = Date.now();
    } finally {
      adminCategoriesRequest = undefined;
    }
    return adminCategoriesCache || [];
  })();

  return adminCategoriesRequest;
}

export async function createAdminCategory(category: Partial<ApiCategory>) {
  const created = await request<ApiCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(category)
  });
  clearAdminCatalogCache();
  return created;
}

export async function updateAdminCategory(id: string, category: Partial<ApiCategory>) {
  const updated = await request<ApiCategory>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(category)
  });
  clearAdminCatalogCache();
  return updated;
}

export async function deleteAdminCategory(id: string) {
  const result = await request<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
  clearAdminCatalogCache();
  return result;
}

export async function getAdminCoupons() {
  if (adminCouponsCache && Date.now() - adminCouponsCacheAt < ADMIN_GENERAL_CACHE_MS) return adminCouponsCache;
  if (adminCouponsRequest) return adminCouponsRequest;

  adminCouponsRequest = (async () => {
    try {
      adminCouponsCache = await request<ApiCoupon[]>("/coupons");
      adminCouponsCacheAt = Date.now();
    } finally {
      adminCouponsRequest = undefined;
    }
    return adminCouponsCache || [];
  })();

  return adminCouponsRequest;
}

export async function createAdminCoupon(coupon: Partial<ApiCoupon>) {
  const created = await request<ApiCoupon>("/coupons", {
    method: "POST",
    body: JSON.stringify(coupon)
  });
  adminCouponsCache = undefined;
  return created;
}

export async function updateAdminCoupon(id: string, coupon: Partial<ApiCoupon>) {
  const updated = await request<ApiCoupon>(`/coupons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(coupon)
  });
  adminCouponsCache = undefined;
  return updated;
}

export async function deleteAdminCoupon(id: string) {
  const result = await request<{ message: string }>(`/coupons/${id}`, { method: "DELETE" });
  adminCouponsCache = undefined;
  return result;
}

export async function getAdminOrders(force = false) {
  if (force) {
    adminOrdersCache = undefined;
    adminOrdersCacheAt = 0;
    adminOrdersRequest = undefined;
  }

  if (!force && adminOrdersCache && Date.now() - adminOrdersCacheAt < ADMIN_ORDERS_CACHE_MS) return adminOrdersCache;
  if (adminOrdersRequest) return adminOrdersRequest;

  adminOrdersRequest = (async () => {
    try {
      adminOrdersCache = await request<ApiOrder[]>("/orders");
      adminOrdersCacheAt = Date.now();
      return adminOrdersCache;
    } finally {
      adminOrdersRequest = undefined;
    }
  })();

  return adminOrdersRequest;
}

export async function updateAdminOrder(id: string, order: Partial<ApiOrder>) {
  const updated = await request<ApiOrder>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(order)
  });
  adminOrdersCache = undefined;
  adminOrdersCacheAt = 0;
  return updated;
}

export async function getAdminSupportTickets(): Promise<ApiSupportTicket[]> {
  if (adminSupportCache && Date.now() - adminSupportCacheAt < ADMIN_GENERAL_CACHE_MS) return adminSupportCache;
  if (adminSupportRequest) return adminSupportRequest;

  adminSupportRequest = (async () => {
    try {
      adminSupportCache = await request<ApiSupportTicket[]>("/users/support");
      adminSupportCacheAt = Date.now();
    } finally {
      adminSupportRequest = undefined;
    }
    return adminSupportCache || [];
  })();

  return adminSupportRequest;
}

export async function updateAdminSupportTicket(id: string, payload: Partial<ApiSupportTicket> & { reply?: string }): Promise<ApiSupportTicket> {
  const updated = await request<ApiSupportTicket>(`/users/support/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  adminSupportCache = undefined;
  return updated;
}

export async function getAdminSiteSettings(): Promise<ApiSiteSettings> {
  if (adminSiteSettingsCache && Date.now() - adminSiteSettingsCacheAt < ADMIN_GENERAL_CACHE_MS) return adminSiteSettingsCache;
  if (adminSiteSettingsRequest) return adminSiteSettingsRequest;

  adminSiteSettingsRequest = (async () => {
    try {
      adminSiteSettingsCache = (await request<ApiSiteSettings | null>("/content/admin/settings")) || {};
      adminSiteSettingsCacheAt = Date.now();
    } finally {
      adminSiteSettingsRequest = undefined;
    }
    return adminSiteSettingsCache || {};
  })();

  return adminSiteSettingsRequest;
}

export async function updateAdminSiteSettings(settings: Partial<ApiSiteSettings>): Promise<ApiSiteSettings> {
  const updated = await request<ApiSiteSettings>("/content/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(settings)
  });
  adminSiteSettingsCache = updated;
  adminSiteSettingsCacheAt = Date.now();
  return updated;
}

export async function getAdminCustomers(): Promise<ApiCustomer[]> {
  if (adminCustomersCache && Date.now() - adminCustomersCacheAt < ADMIN_GENERAL_CACHE_MS) return adminCustomersCache;
  if (adminCustomersRequest) return adminCustomersRequest;

  adminCustomersRequest = (async () => {
    try {
      adminCustomersCache = await request<ApiCustomer[]>("/admin/customers");
      adminCustomersCacheAt = Date.now();
    } finally {
      adminCustomersRequest = undefined;
    }
    return adminCustomersCache || [];
  })();

  return adminCustomersRequest;
}

export function prefetchAdminRoute(href: string) {
  if (href.includes("/admin/products") || href.includes("/admin/product-categories") || href.includes("/admin/shop-collections") || href.includes("/admin/shop-purpose")) {
    void getAdminProducts();
    void getAdminCategories();
  }
  if (href.includes("/admin/orders") || href.includes("/admin/cod-orders") || href.includes("/admin/prepaid-orders") || href.includes("/admin/dashboard") || href.includes("/admin/analytics")) {
    void getAdminOrders();
  }
  if (href.includes("/admin/customers")) void getAdminCustomers();
  if (href.includes("/admin/coupons")) void getAdminCoupons();
  if (href.includes("/admin/support") || href.includes("/admin/dashboard") || href.includes("/admin/analytics")) void getAdminSupportTickets();
  if (href.includes("/admin/homepage") || href.includes("/admin/hero-slider") || href.includes("/admin/latest-trending") || href.includes("/admin/website-settings")) void getAdminHomepage();
  if (href.includes("/admin/shipping-settings") || href.includes("/admin/website-settings")) void getAdminSiteSettings();
}

export function adminProductFromApi(product: ApiProduct): AdminProduct {
  const status = product.stock <= 10 ? "Low Stock" : product.active === false ? "Draft" : "Active";

  return {
    id: Number(product._id?.slice(-6).replace(/\D/g, "") || 0),
    name: product.title,
    category: product.category,
    price: product.price,
    oldPrice: product.compareAtPrice,
    stock: product.stock,
    status,
    image: product.images[0] || "/assets/products/rudraksha-bracelet.jpg"
  };
}

export function adminOrderFromApi(order: ApiOrder): AdminOrder {
  const paymentType = order.paymentMethod === "cod" ? "COD" : "Prepaid";
  const address = order.shippingAddress
    ? `${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`
    : "Address not available";

  return {
    id: order.orderNumber,
    customer: order.customer.name,
    phone: order.customer.phone,
    email: order.customer.email,
    address,
    products: order.items.map((item, index) => ({
      id: index + 1,
      name: item.title,
      image: item.image,
      quantity: item.quantity,
      size: item.selectedSizeLabel,
      price: item.price
    })),
    total: order.total,
    paymentType,
    paymentStatus: order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "failed" ? "Failed" : "Pending",
    orderStatus: apiStatusToAdmin(order.status),
    trackingId: order.trackingId || "",
    courierPartner: order.courierPartner || "",
    adminNotes: order.adminNotes || "",
    provider: order.paymentProvider ? paymentProviderLabel(order.paymentProvider) : undefined,
    walletTransactionId: order.paymentReference,
    customerSegment: order.customerSummary?.segment,
    customerOrderCount: order.customerSummary?.orders,
    customerSpent: order.customerSummary?.spent,
    customerProductCount: order.customerSummary?.productCount,
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : ""
  };
}

export function apiStatusFromAdmin(status: AdminOrder["orderStatus"]): ApiOrder["status"] {
  if (status === "Confirmed") return "confirmed";
  if (status === "Packed") return "packed";
  if (status === "Shipped" || status === "Out for Delivery") return "shipped";
  if (status === "Delivered") return "delivered";
  if (status === "Cancelled" || status === "Returned") return "cancelled";
  return "placed";
}

function apiOrderFromFallback(order: AdminOrder): ApiOrder {
  return {
    _id: order.id,
    orderNumber: order.id,
    customer: { name: order.customer, email: order.email, phone: order.phone },
    items: order.products.map((product) => ({
      title: product.name,
      image: product.image,
      quantity: product.quantity,
      selectedSizeLabel: product.size,
      price: product.price
    })),
    total: order.total,
    paymentMethod: order.paymentType === "COD" ? "cod" : "upi",
    paymentStatus: order.paymentStatus === "Paid" ? "paid" : order.paymentStatus === "Failed" ? "failed" : "pending",
    paymentProvider: order.provider,
    paymentReference: order.walletTransactionId,
    status: apiStatusFromAdmin(order.orderStatus),
    trackingId: order.trackingId,
    courierPartner: order.courierPartner,
    adminNotes: order.adminNotes,
    createdAt: order.createdAt
  };
}

function apiStatusToAdmin(status: ApiOrder["status"]): AdminOrder["orderStatus"] {
  if (status === "confirmed") return "Confirmed";
  if (status === "packed") return "Packed";
  if (status === "shipped") return "Shipped";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

function paymentProviderLabel(provider: string): AdminOrder["provider"] {
  if (provider.toLowerCase().includes("cashfree")) return "Cashfree";
  if (provider.toLowerCase().includes("wallet")) return "Wallet";
  if (provider.toLowerCase().includes("upi")) return "UPI";
  return "Razorpay";
}
