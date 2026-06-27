export type AdminProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  stock: number;
  status: "Active" | "Draft" | "Low Stock";
  image: string;
};

export type OrderItem = {
  id: number;
  name: string;
  image: string;
  quantity: number;
  size?: string;
  price: number;
};

export type AdminOrder = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  products: OrderItem[];
  total: number;
  paymentType: "COD" | "Prepaid";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  orderStatus: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";
  trackingId: string;
  courierPartner: string;
  adminNotes: string;
  provider?: "Razorpay" | "UPI" | "Wallet" | "Cashfree";
  walletTransactionId?: string;
  customerSegment?: string;
  customerOrderCount?: number;
  customerSpent?: number;
  customerProductCount?: number;
  createdAt: string;
};

export type WalletTransaction = {
  id: string;
  orderId: string;
  customer: string;
  wallet: string;
  amount: number;
  status: "Success" | "Pending" | "Failed" | "Refunded";
  type: "Payment" | "Refund" | "Cashback";
  date: string;
};

export type TrendingProduct = {
  id: number;
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

export const products: AdminProduct[] = [
  { id: 1, name: "5 Mukhi Rudraksha Mala", category: "Rudraksha", price: 899, oldPrice: 1299, stock: 42, status: "Active", image: "/assets/products/meditation-mala.jpg" },
  { id: 2, name: "Karungali Protection Bracelet", category: "Karungali", price: 699, oldPrice: 999, stock: 18, status: "Active", image: "/assets/home/karungali.png" },
  { id: 3, name: "Pyrite Prosperity Bracelet", category: "Pyrite", price: 799, oldPrice: 1199, stock: 6, status: "Low Stock", image: "/assets/products/pyrite-tiger-eye.jpg" },
  { id: 4, name: "Rose Quartz Love Band", category: "Rose Quartz", price: 749, oldPrice: 1099, stock: 26, status: "Active", image: "/assets/home/rose-quartz.png" },
  { id: 5, name: "Sphatik Health Mala", category: "Sphatik", price: 999, oldPrice: 1499, stock: 12, status: "Active", image: "/assets/home/sphatik.png" },
  { id: 6, name: "Tiger Eye Courage Bracelet", category: "Tiger Eye", price: 849, oldPrice: 1299, stock: 5, status: "Low Stock", image: "/assets/home/tiger-eye.png" }
];

export const orders: AdminOrder[] = [
  {
    id: "ORD-24062001",
    customer: "Asha Sharma",
    phone: "9876543210",
    email: "asha@example.com",
    address: "Bani Park, Jaipur, Rajasthan 302016",
    products: [
      { id: 1, name: "5 Mukhi Rudraksha Mala", image: "/assets/products/meditation-mala.jpg", quantity: 1, size: "108+1 beads", price: 899 },
      { id: 2, name: "Karungali Protection Bracelet", image: "/assets/home/karungali.png", quantity: 1, size: "Medium - 7 inch", price: 699 }
    ],
    total: 1598,
    paymentType: "COD",
    paymentStatus: "Pending",
    orderStatus: "Packed",
    trackingId: "DLV24062001",
    courierPartner: "Delhivery",
    adminNotes: "Call before delivery. Customer asked for gift packing.",
    createdAt: "2026-06-23"
  },
  {
    id: "ORD-24062002",
    customer: "Rahul Mehta",
    phone: "9988776655",
    email: "rahul@example.com",
    address: "Andheri West, Mumbai, Maharashtra 400053",
    products: [
      { id: 3, name: "Pyrite Prosperity Bracelet", image: "/assets/products/pyrite-tiger-eye.jpg", quantity: 1, size: "Large - 7.5 inch", price: 799 }
    ],
    total: 799,
    paymentType: "Prepaid",
    paymentStatus: "Paid",
    orderStatus: "Confirmed",
    trackingId: "SRK24062002",
    courierPartner: "Shiprocket",
    adminNotes: "Payment captured through UPI.",
    provider: "UPI",
    walletTransactionId: "TXN-UPI-82391",
    createdAt: "2026-06-23"
  },
  {
    id: "ORD-24062003",
    customer: "Neha Verma",
    phone: "9090909090",
    email: "neha@example.com",
    address: "Arera Colony, Bhopal, Madhya Pradesh 462016",
    products: [
      { id: 4, name: "Rose Quartz Love Band", image: "/assets/home/rose-quartz.png", quantity: 2, size: "Small - 6.5 inch", price: 749 },
      { id: 5, name: "Sphatik Health Mala", image: "/assets/home/sphatik.png", quantity: 1, size: "Standard", price: 999 }
    ],
    total: 2497,
    paymentType: "Prepaid",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    trackingId: "BD24062003",
    courierPartner: "Blue Dart",
    adminNotes: "Priority dispatch. Include care card.",
    provider: "Wallet",
    walletTransactionId: "WALLET-558812",
    createdAt: "2026-06-22"
  },
  {
    id: "ORD-24062004",
    customer: "Dev Patel",
    phone: "8888888888",
    email: "dev@example.com",
    address: "Satellite, Ahmedabad, Gujarat 380015",
    products: [
      { id: 6, name: "Tiger Eye Courage Bracelet", image: "/assets/home/tiger-eye.png", quantity: 1, size: "Medium - 7 inch", price: 849 }
    ],
    total: 849,
    paymentType: "COD",
    paymentStatus: "Pending",
    orderStatus: "Out for Delivery",
    trackingId: "ECM24062004",
    courierPartner: "Ecom Express",
    adminNotes: "COD confirmation completed on WhatsApp.",
    createdAt: "2026-06-22"
  },
  {
    id: "ORD-24062005",
    customer: "Pooja Nair",
    phone: "7777888899",
    email: "pooja@example.com",
    address: "Kakkanad, Kochi, Kerala 682030",
    products: [
      { id: 1, name: "5 Mukhi Rudraksha Mala", image: "/assets/products/meditation-mala.jpg", quantity: 1, size: "Long", price: 899 }
    ],
    total: 899,
    paymentType: "Prepaid",
    paymentStatus: "Refunded",
    orderStatus: "Returned",
    trackingId: "XBS24062005",
    courierPartner: "Xpressbees",
    adminNotes: "Refund initiated after return QC.",
    provider: "Razorpay",
    walletTransactionId: "REF-24062005",
    createdAt: "2026-06-21"
  }
];

export const walletTransactions: WalletTransaction[] = [
  { id: "TXN-UPI-82391", orderId: "ORD-24062002", customer: "Rahul Mehta", wallet: "UPI", amount: 799, status: "Success", type: "Payment", date: "23 Jun 2026, 11:05 AM" },
  { id: "WALLET-558812", orderId: "ORD-24062003", customer: "Neha Verma", wallet: "Aaradhya Wallet", amount: 2497, status: "Success", type: "Payment", date: "22 Jun 2026, 7:15 PM" },
  { id: "REF-24062005", orderId: "ORD-24062005", customer: "Pooja Nair", wallet: "Razorpay", amount: 899, status: "Refunded", type: "Refund", date: "23 Jun 2026, 4:10 PM" },
  { id: "CBK-24062003", orderId: "ORD-24062003", customer: "Neha Verma", wallet: "Aaradhya Wallet", amount: 120, status: "Success", type: "Cashback", date: "23 Jun 2026, 11:20 AM" }
];

export const customers = [
  { id: 1, name: "Asha Sharma", email: "asha@example.com", phone: "9876543210", orders: 4, spent: 5396, segment: "Repeat buyer" },
  { id: 2, name: "Rahul Mehta", email: "rahul@example.com", phone: "9988776655", orders: 2, spent: 1598, segment: "New prepaid" },
  { id: 3, name: "Neha Verma", email: "neha@example.com", phone: "9090909090", orders: 6, spent: 8794, segment: "VIP" },
  { id: 4, name: "Dev Patel", email: "dev@example.com", phone: "8888888888", orders: 1, spent: 849, segment: "COD buyer" }
];

export const tickets = [
  { id: 1, subject: "Need order delivery update", customer: "Asha Sharma", priority: "Normal", status: "Open" },
  { id: 2, subject: "Size help for bracelet", customer: "Rahul Mehta", priority: "Low", status: "In Progress" },
  { id: 3, subject: "Wrong payment status", customer: "Neha Verma", priority: "High", status: "Open" }
];

export const coupons = [
  { code: "FIRST10", discount: "10% off", usage: 124, status: "Active" },
  { code: "DIVINE150", discount: "Rs.150 off", usage: 48, status: "Active" },
  { code: "FREESHIP", discount: "Free shipping", usage: 220, status: "Active" }
];

export const shippingSettings = [
  { zone: "Metro cities", fee: 0, cod: true, eta: "2-4 days" },
  { zone: "Rest of India", fee: 79, cod: true, eta: "4-7 days" },
  { zone: "Remote pincodes", fee: 149, cod: false, eta: "7-10 days" }
];

export const homepageControls = [
  "Announcement bar text",
  "Logo",
  "Navbar categories",
  "Category strip images",
  "Hero slider images",
  "Latest & Trending products",
  "Shop Our Collections circles",
  "Shop By Purpose cards",
  "Rooted In Tradition gallery images",
  "Footer content"
];

export const trendingProducts: TrendingProduct[] = [
  { id: 1, image: "/assets/products/rudraksha-bracelet.jpg", name: "Gold Plated Modern Rudraksha Bracelet", price: 599, oldPrice: 999, discount: "40% OFF", badge: "New arrival", category: "Rudraksha", purpose: "Protection", enabled: true },
  { id: 2, image: "/assets/products/meditation-mala.jpg", name: "Brown Rudraksha Mala - 108+1 Beads", price: 599, oldPrice: 999, discount: "40% OFF", badge: "New arrival", category: "Rudraksha", purpose: "Peace", enabled: true },
  { id: 3, image: "/assets/products/pyrite-tiger-eye.jpg", name: "Pyrite Money Magnet Bracelet", price: 999, oldPrice: 1599, discount: "38% OFF", badge: "New arrival", category: "Pyrite", purpose: "Wealth", enabled: true },
  { id: 4, image: "/assets/home/rose-quartz.png", name: "Rose Quartz Rudraksha Nazar Raksha Band", price: 699, oldPrice: 1099, discount: "36% OFF", badge: "New arrival", category: "Rose Quartz", purpose: "Love", enabled: true }
];
