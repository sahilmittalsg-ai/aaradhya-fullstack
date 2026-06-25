import {
  coupons as fallbackCoupons,
  orders as fallbackOrders,
  products as fallbackProducts
} from "../data";
import type { AdminOrder, AdminProduct } from "../data";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const adminTokenKey = "aaradhya-admin-api-token";
let adminProductsCache: ApiProduct[] | undefined;
let adminProductsRequest: Promise<ApiProduct[]> | undefined;
let adminCategoriesCache: ApiCategory[] | undefined;
let adminCategoriesRequest: Promise<ApiCategory[]> | undefined;
let adminOrdersCache: ApiOrder[] | undefined;
let adminOrdersRequest: Promise<ApiOrder[]> | undefined;
let adminHomepageCache: ApiHomepage | undefined;

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
  status: "placed" | "packed" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  courierPartner?: string;
  adminNotes?: string;
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
  createdAt?: string;
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

export type ApiHomepageSection = {
  key: string;
  title: string;
  description: string;
  active: boolean;
  managePath: string;
};

export type ApiHomepage = {
  hero: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    slides: ApiHeroSlide[];
  };
  sections: ApiHomepageSection[];
};

export const fallbackHomepage: ApiHomepage = {
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
  sections: [
    { key: "announcement", title: "Announcement Bar", description: "Top black offer strip shown above navbar.", active: true, managePath: "/admin/website-settings" },
    { key: "navbar", title: "Navbar Categories", description: "Main menu categories shown in customer header.", active: true, managePath: "/admin/product-categories" },
    { key: "category-strip", title: "Category Strip", description: "Horizontal category image strip.", active: true, managePath: "/admin/product-categories" },
    { key: "hero-slider", title: "Hero Slider", description: "Homepage banner photos and autoplay.", active: true, managePath: "/admin/hero-slider" },
    { key: "latest-trending", title: "Latest & Trending", description: "Homepage product carousel and badges.", active: true, managePath: "/admin/latest-trending" },
    { key: "shop-collections", title: "Shop Our Collections", description: "Circular category carousel and filters.", active: true, managePath: "/admin/shop-collections" },
    { key: "shop-purpose", title: "Shop By Purpose", description: "Purpose cards like Wealth, Health, Love, Protection.", active: true, managePath: "/admin/shop-purpose" },
    { key: "tradition-gallery", title: "Rooted In Tradition Gallery", description: "Six-image lifestyle gallery section.", active: true, managePath: "/admin/website-settings" },
    { key: "footer", title: "Footer Content", description: "Footer links, support, policy and brand text.", active: true, managePath: "/admin/website-settings" }
  ]
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(adminTokenKey);
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

export async function getAdminHomepage() {
  if (adminHomepageCache) return adminHomepageCache;
  try {
    adminHomepageCache = await request<ApiHomepage>("/content/admin/homepage");
  } catch {
    adminHomepageCache = fallbackHomepage;
  }
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

export async function getAdminProducts() {
  if (adminProductsCache) return adminProductsCache;
  if (adminProductsRequest) return adminProductsRequest;

  adminProductsRequest = (async () => {
    try {
      adminProductsCache = await request<ApiProduct[]>("/products?all=true");
    } catch {
      adminProductsCache = fallbackProducts.map((product) => ({
        _id: String(product.id),
        title: product.name,
        subtitle: product.category,
        description: product.name,
        category: product.category,
        collection: product.category,
        price: product.price,
        compareAtPrice: product.oldPrice,
        stock: product.stock,
        rating: 4.8,
        images: [product.image],
        tags: [product.category.toLowerCase()],
        featured: product.status === "Active",
        active: product.status !== "Draft"
      }));
    } finally {
      adminProductsRequest = undefined;
    }
    return adminProductsCache;
  })();

  return adminProductsRequest;
}

export async function createAdminProduct(product: Partial<ApiProduct>) {
  const created = await request<ApiProduct>("/products", {
    method: "POST",
    body: JSON.stringify(product)
  });
  adminProductsCache = undefined;
  return created;
}

export async function updateAdminProduct(id: string, product: Partial<ApiProduct>) {
  const updated = await request<ApiProduct>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(product)
  });
  adminProductsCache = undefined;
  return updated;
}

export async function deleteAdminProduct(id: string) {
  const result = await request<{ message: string }>(`/products/${id}`, { method: "DELETE" });
  adminProductsCache = undefined;
  return result;
}

export async function getAdminCategories() {
  if (adminCategoriesCache) return adminCategoriesCache;
  if (adminCategoriesRequest) return adminCategoriesRequest;

  adminCategoriesRequest = (async () => {
    try {
      adminCategoriesCache = await request<ApiCategory[]>("/categories?all=true");
    } catch {
      adminCategoriesCache = Array.from(new Set(fallbackProducts.map((product) => product.category))).map((name) => ({
        _id: name,
        name,
        description: `${name} storefront category`,
        featured: true,
        active: true
      }));
    } finally {
      adminCategoriesRequest = undefined;
    }
    return adminCategoriesCache;
  })();

  return adminCategoriesRequest;
}

export async function createAdminCategory(category: Partial<ApiCategory>) {
  const created = await request<ApiCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(category)
  });
  adminCategoriesCache = undefined;
  return created;
}

export async function updateAdminCategory(id: string, category: Partial<ApiCategory>) {
  const updated = await request<ApiCategory>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(category)
  });
  adminCategoriesCache = undefined;
  return updated;
}

export async function deleteAdminCategory(id: string) {
  const result = await request<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
  adminCategoriesCache = undefined;
  return result;
}

export async function getAdminCoupons() {
  try {
    return await request<ApiCoupon[]>("/coupons");
  } catch {
    return fallbackCoupons.map((coupon) => ({
      _id: coupon.code,
      code: coupon.code,
      type: (coupon.discount.includes("%") ? "percent" : "flat") as ApiCoupon["type"],
      value: Number(coupon.discount.match(/\d+/)?.[0] || 0),
      minSubtotal: 0,
      active: coupon.status === "Active"
    }));
  }
}

export async function createAdminCoupon(coupon: Partial<ApiCoupon>) {
  return request<ApiCoupon>("/coupons", {
    method: "POST",
    body: JSON.stringify(coupon)
  });
}

export async function updateAdminCoupon(id: string, coupon: Partial<ApiCoupon>) {
  return request<ApiCoupon>(`/coupons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(coupon)
  });
}

export async function deleteAdminCoupon(id: string) {
  return request<{ message: string }>(`/coupons/${id}`, { method: "DELETE" });
}

export async function getAdminOrders(force = false) {
  if (force) {
    adminOrdersCache = undefined;
    adminOrdersRequest = undefined;
  }

  if (adminOrdersCache) return adminOrdersCache;
  if (adminOrdersRequest) return adminOrdersRequest;

  adminOrdersRequest = (async () => {
    try {
      adminOrdersCache = await request<ApiOrder[]>("/orders");
    } catch {
      adminOrdersCache = fallbackOrders.map(apiOrderFromFallback);
    } finally {
      adminOrdersRequest = undefined;
    }
    return adminOrdersCache;
  })();

  return adminOrdersRequest;
}

export async function updateAdminOrder(id: string, order: Partial<ApiOrder>) {
  const updated = await request<ApiOrder>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(order)
  });
  adminOrdersCache = undefined;
  return updated;
}

export async function getAdminSupportTickets(): Promise<ApiSupportTicket[]> {
  try {
    return await request<ApiSupportTicket[]>("/users/support");
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
        name: "Wholesale Buyer",
        email: "wholesale@example.com",
        phone: "9876543210",
        category: "bulk-wholesale",
        subject: "Wholesale Inquiry - Divine Gifts",
        message: "Company Name: Divine Gifts\nProduct Requirements: Rudraksha Malas\nQuantity Needed: 101 - 250 pieces\nPhone Number: 9876543210",
        status: "open",
        priority: "high",
        createdAt: "2026-06-24T10:30:00.000Z"
      }
    ];
  }
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
    image: product.images[0] || "/assets/products/rudraksha-bracelet.png"
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
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : ""
  };
}

export function apiStatusFromAdmin(status: AdminOrder["orderStatus"]): ApiOrder["status"] {
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
