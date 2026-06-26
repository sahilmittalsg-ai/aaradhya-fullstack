import {
  Ban,
  Boxes,
  ChartLine,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Flame,
  GitBranch,
  Headphones,
  Home,
  Image,
  Images,
  IndianRupee,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MessageCircle,
  PackageCheck,
  PackagePlus,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tag,
  TicketPercent,
  Truck,
  UserRound,
  Users,
  Wallet,
  X
} from "lucide-react";
import type { ReactNode } from "react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { AdminTraditionGalleryManager } from "./components/AdminTraditionGalleryManager";
import { AdminHeroSliderManager } from "./components/AdminHeroSliderManager";
import { AdminTrendingManager } from "./components/AdminTrendingManager";
import {
  customers,
  homepageControls,
  orders as initialOrders,
  products,
  shippingSettings,
  walletTransactions
} from "./data";
import type { AdminOrder } from "./data";
import {
  adminOrderFromApi,
  apiStatusFromAdmin,
  clearAdminApiSession,
  createAdminCategory,
  createAdminCoupon,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminCoupon,
  deleteAdminProduct,
  getAdminCategories,
  getAdminCustomers,
  getAdminCoupons,
  getAdminOrders,
  getAdminProducts,
  getAdminSupportTickets,
  updateAdminSupportTicket,
  loginAdminApi,
  updateAdminCategory,
  updateAdminCoupon,
  updateAdminOrder,
  updateAdminProduct
} from "./lib/api";
import type { ApiCategory, ApiCoupon, ApiCustomer, ApiOrder, ApiProduct, ApiSupportTicket } from "./lib/api";

const navLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: ChartLine },
  { label: "Products", href: "/admin/products", icon: Boxes },
  { label: "Product Categories", href: "/admin/product-categories", icon: Tag },
  { label: "Homepage Sections", href: "/admin/homepage", icon: Home },
  { label: "Hero Slider", href: "/admin/hero-slider", icon: Image },
  { label: "Latest & Trending", href: "/admin/latest-trending", icon: Flame },
  { label: "Shop Our Collections", href: "/admin/shop-collections", icon: Images },
  { label: "Shop By Purpose", href: "/admin/shop-purpose", icon: ShieldCheck },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "COD Orders", href: "/admin/cod-orders", icon: IndianRupee },
  { label: "Prepaid Orders", href: "/admin/prepaid-orders", icon: CreditCard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { label: "Shipping Settings", href: "/admin/shipping-settings", icon: Truck },
  { label: "Website Settings", href: "/admin/website-settings", icon: Settings },
  { label: "Support", href: "/admin/support", icon: Headphones }
];

const statusFlow: AdminOrder["orderStatus"][] = ["Confirmed", "Packed", "Shipped", "Delivered"];
const adminCredentialsKey = "aaradhya-admin-credentials";
const adminSessionKey = "aaradhya-admin-session";
const legacyAdminRoleKey = "aaradhya-admin-role";
const defaultAdminCredentials = {
  username: import.meta.env.VITE_ADMIN_USERNAME || "admin",
  password: import.meta.env.VITE_ADMIN_PASSWORD || "admin123"
};
const hasEnvAdminCredentials = Boolean(import.meta.env.VITE_ADMIN_USERNAME || import.meta.env.VITE_ADMIN_PASSWORD);

function getAdminCredentials() {
  if (hasEnvAdminCredentials) {
    return defaultAdminCredentials;
  }

  const storedCredentials = localStorage.getItem(adminCredentialsKey);

  if (!storedCredentials) {
    return defaultAdminCredentials;
  }

  try {
    const parsedCredentials = JSON.parse(storedCredentials) as Partial<typeof defaultAdminCredentials>;
    return {
      username: parsedCredentials.username?.trim() || defaultAdminCredentials.username,
      password: parsedCredentials.password || defaultAdminCredentials.password
    };
  } catch {
    return defaultAdminCredentials;
  }
}

function saveAdminCredentials(credentials: typeof defaultAdminCredentials) {
  localStorage.setItem(adminCredentialsKey, JSON.stringify(credentials));
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    localStorage.removeItem(legacyAdminRoleKey);
    return localStorage.getItem(adminSessionKey) === "active";
  });

  if (!isAdmin) {
    return <AdminLogin onLogin={() => setIsAdmin(true)} />;
  }

  return <AdminLayout onLogout={() => setIsAdmin(false)} />;
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [syncNote, setSyncNote] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigningIn(true);
    setSyncNote("");
    const credentials = getAdminCredentials();

    if (username.trim() !== credentials.username || password !== credentials.password) {
      setError("Invalid username or password.");
      setSigningIn(false);
      return;
    }

    try {
      await loginAdminApi();
    } catch (loginError) {
      clearAdminApiSession();
      setError(loginError instanceof Error ? loginError.message : "Backend login failed. Start API and try again.");
      setSyncNote("Admin panel requires live backend sync before opening.");
      setSigningIn(false);
      return;
    }

    localStorage.setItem(adminSessionKey, "active");
    onLogin();
    setSigningIn(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8ff] px-4 py-10">
      <form onSubmit={signIn} className="w-full max-w-md rounded-[28px] border border-[#e8ecff] bg-white p-8 shadow-[0_24px_60px_rgba(59,79,166,0.12)]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5b6cff] text-white shadow-[0_12px_28px_rgba(91,108,255,0.28)]">
          <LockKeyhole size={24} />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[#8a91ad]">Admin access only</p>
        <h1 className="mt-3 text-3xl font-extrabold text-[#23233c]">Aaradhya Commerce Admin</h1>
        <p className="mt-3 text-sm leading-6 text-[#727994]">
          Enter admin username and password to manage storefront content, orders, payments, and customer support.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[#23233c]">
            Username
            <input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              className="admin-input"
              placeholder="Enter admin username"
              autoComplete="username"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#23233c]">
            Password
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              className="admin-input"
              placeholder="Enter admin password"
              type="password"
              autoComplete="current-password"
            />
          </label>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        {syncNote && <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{syncNote}</p>}

        <button disabled={signingIn} className="admin-button mt-6 w-full disabled:opacity-60">
          {signingIn ? "Opening..." : "Login to Admin Panel"}
        </button>
        <p className="mt-4 text-center text-xs text-[#8a91ad]">
          Admin login: {defaultAdminCredentials.username} / {defaultAdminCredentials.password}
        </p>
      </form>
    </div>
  );
}

function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem(legacyAdminRoleKey);
    clearAdminApiSession();
    localStorage.removeItem(adminSessionKey);
    onLogout();
  }

  return (
    <div className="min-h-screen bg-[#f6f8ff] text-[#23233c]">
      <header className="sticky top-0 z-40 border-b border-[#e8ecff] bg-white/92 backdrop-blur">
        <div className="admin-container flex h-20 items-center justify-between gap-4">
          <button className="rounded-xl border border-[#e0e5ff] bg-white p-2.5 lg:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5b6cff] text-white shadow-[0_12px_28px_rgba(91,108,255,0.28)]">
              <GitBranch size={21} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a91ad]">Ecommerce control</p>
              <h1 className="text-xl font-bold text-[#23233c]">Aaradhya Admin</h1>
            </div>
          </div>
          <div className="hidden flex-1 justify-end gap-3 md:flex">
            <label className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa0b8]" size={17} />
              <input className="w-full rounded-2xl border border-[#e0e5ff] bg-[#f8faff] py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#5b6cff] focus:bg-white focus:ring-4 focus:ring-[#5b6cff]/10" placeholder="Search orders, products, customers" />
            </label>
            <button className="admin-button gap-2" onClick={() => navigate("/admin/products")}>
              <PackagePlus size={17} /> Add Product
            </button>
            <button onClick={logout} className="rounded-xl border border-[#e0e5ff] bg-white px-4 py-2 text-sm font-semibold text-[#23233c] transition hover:border-[#5b6cff] hover:text-[#5b6cff]">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${mobileOpen ? "block" : "hidden"} h-max rounded-[28px] border border-[#e8ecff] bg-white p-4 shadow-[0_24px_60px_rgba(59,79,166,0.10)] lg:sticky lg:top-24 lg:block`}>
          <div className="mb-5 flex items-center gap-3 border-b border-[#edf0ff] pb-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1ff] text-[#5b6cff]">
              <GitBranch size={22} />
            </span>
            <div>
              <p className="text-lg font-bold text-[#23233c]">Base</p>
              <p className="text-xs font-semibold text-[#9aa0b8]">Store command</p>
            </div>
          </div>
          <nav className="grid max-h-[calc(100vh-210px)] gap-1 overflow-y-auto pr-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-[#eef1ff] text-[#5b6cff]" : "text-[#8a91ad] hover:bg-[#f8faff] hover:text-[#23233c]"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <link.icon size={17} />
                  {link.label}
                </span>
                <ChevronRight size={14} className="opacity-35" />
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/product-categories" element={<ProductCategoriesPage />} />
            <Route path="/admin/homepage" element={<HomepagePage />} />
            <Route path="/admin/hero-slider" element={<HeroSliderPage />} />
            <Route path="/admin/latest-trending" element={<LatestTrendingPage />} />
            <Route path="/admin/shop-collections" element={<ShopCollectionsPage />} />
            <Route path="/admin/shop-purpose" element={<ShopPurposePage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/cod-orders" element={<OrderListPage type="COD" />} />
            <Route path="/admin/prepaid-orders" element={<OrderListPage type="Prepaid" />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/coupons" element={<CouponsPage />} />
            <Route path="/admin/shipping-settings" element={<ShippingSettingsPage />} />
            <Route path="/admin/website-settings" element={<WebsiteSettingsPage />} />
            <Route path="/admin/support" element={<SupportPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const [dashboardOrders, setDashboardOrders] = useState<AdminOrder[]>(initialOrders);
  const [dashboardProducts, setDashboardProducts] = useState<ApiProduct[]>([]);
  const [supportCount, setSupportCount] = useState(0);

  useEffect(() => {
    refreshDashboardOrders();
    const interval = window.setInterval(refreshDashboardOrders, 5000);
    getAdminProducts(true).then(setDashboardProducts);
    getAdminSupportTickets().then((tickets) => setSupportCount(tickets.length)).catch(() => setSupportCount(0));
    return () => window.clearInterval(interval);
  }, []);

  async function refreshDashboardOrders() {
    const rows = await getAdminOrders(true);
    setDashboardOrders(rows.map(adminOrderFromApi));
  }

  const today = new Date().toLocaleDateString("en-IN");
  const todayOrders = dashboardOrders.filter((order) => order.createdAt === today).length;
  const codOrders = dashboardOrders.filter((order) => order.paymentType === "COD");
  const prepaidOrders = dashboardOrders.filter((order) => order.paymentType === "Prepaid");
  const pendingDispatch = dashboardOrders.filter((order) => ["Pending", "Confirmed", "Packed"].includes(order.orderStatus)).length;
  const revenue = dashboardOrders.filter((order) => order.paymentStatus === "Paid").reduce((sum, order) => sum + order.total, 0);
  const lowStock = dashboardProducts.filter((product) => product.stock <= 10).length || products.filter((product) => product.stock <= 10).length;
  const activeProducts = dashboardProducts.filter((product) => product.active !== false);
  const chartPoints = buildProfitPoints(dashboardOrders);
  const deliveredOrders = dashboardOrders.filter((order) => order.orderStatus === "Delivered").length;
  const cancelledOrders = dashboardOrders.filter((order) => order.orderStatus === "Cancelled").length;

  return (
    <Page eyebrow="Dashboard" title="Store Overview" subtitle="Live admin dashboard connected to products, orders, fulfilment, payments, and client support.">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Saved Products" value={`${activeProducts.length}+`} icon={CheckCircle2} />
        <Metric label="Stock Products" value={`${dashboardProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0)}+`} icon={Boxes} />
        <Metric label="Sales Products" value={`${dashboardOrders.length}+`} icon={ShoppingCart} />
        <Metric label="Support Requests" value={`${supportCount}+`} icon={Headphones} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Panel title="Reports">
          <ProfitLineChart points={chartPoints} />
        </Panel>
        <Panel title="Analytics">
          <DashboardDonut
            delivered={deliveredOrders}
            pending={pendingDispatch}
            cancelled={cancelledOrders}
            total={Math.max(dashboardOrders.length, 1)}
          />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <OrderTable compact rows={dashboardOrders} />
        <Panel title="Top Selling Products">
          <TopSellingProducts products={dashboardProducts} orders={dashboardOrders} />
        </Panel>
      </div>
    </Page>
  );
}

type ProfitPoint = {
  label: string;
  revenue: number;
  profit: number;
};

const analyticsBaselineOrders = initialOrders;
const analyticsBaselineProducts = products;

function AnalyticsPage() {
  const reportOrders = analyticsBaselineOrders;
  const reportProducts = analyticsBaselineProducts;
  const paidOrders = reportOrders.filter((order) => order.paymentStatus === "Paid");
  const refundOrders = reportOrders.filter((order) => ["Refunded"].includes(order.paymentStatus) || ["Cancelled", "Returned"].includes(order.orderStatus));
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingCod = reportOrders.filter((order) => order.paymentType === "COD" && order.paymentStatus === "Pending").reduce((sum, order) => sum + order.total, 0);
  const productCost = Math.round(revenue * 0.55);
  const shippingCost = Math.round(revenue * 0.08 + reportOrders.length * 70);
  const paymentCost = Math.round(revenue * 0.03);
  const refundLoss = refundOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCost = productCost + shippingCost + paymentCost + refundLoss;
  const netProfit = revenue - totalCost;
  const profitMargin = revenue ? Math.round((netProfit / revenue) * 100) : 0;
  const lowStock = reportProducts.filter((product) => product.stock <= 10).length;
  const chartPoints = buildProfitPoints(reportOrders);

  return (
    <Page
      eyebrow="Company Analytics"
      title="Profit & Loss"
      subtitle="Track company revenue flow, estimated expenses, net profit, pending COD, and loss from cancelled or returned orders."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <Metric compact label="Paid Revenue" value={formatAdminMoney(revenue)} icon={Wallet} />
        <Metric compact label="Estimated Cost" value={formatAdminMoney(totalCost)} icon={CreditCard} />
        <Metric compact label={netProfit >= 0 ? "Net Profit" : "Net Loss"} value={formatAdminMoney(Math.abs(netProfit))} icon={ChartLine} />
        <Metric compact label="Pending COD" value={formatAdminMoney(pendingCod)} icon={IndianRupee} />
        <Metric compact label="Low Stock Risk" value={lowStock} icon={Boxes} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Profit / Loss Line Chart">
          <ProfitLineChart points={chartPoints} />
          <div className="mt-5 grid gap-3 text-sm text-[#17172a]/65 sm:grid-cols-3">
            <div className="rounded-xl bg-[#fff7ec] p-4">
              <p className="font-semibold text-[#211d33]">Profit margin</p>
              <p className={`mt-2 text-2xl font-bold ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{profitMargin}%</p>
            </div>
            <div className="rounded-xl bg-[#fff7ec] p-4">
              <p className="font-semibold text-[#211d33]">Orders counted</p>
              <p className="mt-2 text-2xl font-bold text-[#211d33]">{reportOrders.length}</p>
            </div>
            <div className="rounded-xl bg-[#fff7ec] p-4">
              <p className="font-semibold text-[#211d33]">Status</p>
              <p className={`mt-2 text-2xl font-bold ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{netProfit >= 0 ? "Profit" : "Loss"}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Company Money Flow Chart">
          <div className="grid gap-3">
            <FlowNode label="Customer Orders" value={`${reportOrders.length} orders`} tone="dark" />
            <FlowConnector />
            <FlowNode label="Paid Revenue" value={formatAdminMoney(revenue)} tone="green" />
            <FlowConnector />
            <div className="grid gap-3 sm:grid-cols-2">
              <FlowNode label="Product Cost" value={formatAdminMoney(productCost)} tone="amber" />
              <FlowNode label="Shipping + Payment" value={formatAdminMoney(shippingCost + paymentCost)} tone="amber" />
            </div>
            <FlowConnector />
            <FlowNode label="Returns / Cancel Loss" value={formatAdminMoney(refundLoss)} tone="red" />
            <FlowConnector />
            <FlowNode label={netProfit >= 0 ? "Final Net Profit" : "Final Net Loss"} value={formatAdminMoney(Math.abs(netProfit))} tone={netProfit >= 0 ? "green" : "red"} />
          </div>
          <p className="mt-5 rounded-xl bg-[#f6e8ce] px-4 py-3 text-xs font-semibold leading-5 text-[#211d33]/70">
            Product, shipping, and payment costs are estimated from live order totals. Add purchase cost fields later for exact accounting.
          </p>
        </Panel>
      </div>
    </Page>
  );
}

function ProfitLineChart({ points }: { points: ProfitPoint[] }) {
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.revenue, Math.max(0, point.profit)]));
  const revenuePath = buildSvgPath(points, "revenue", maxValue);
  const profitPath = buildSvgPath(points, "profit", maxValue);

  return (
    <div className="rounded-2xl bg-white">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#8a91ad]">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#58b8ff]" /> Sales</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#cf6cff]" /> Profit</span>
      </div>
      <svg viewBox="0 0 720 280" className="h-72 w-full overflow-visible" role="img" aria-label="Profit and revenue line chart">
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="44" x2="690" y1={42 + line * 58} y2={42 + line * 58} stroke="#dfe4fb" strokeWidth="1" />
        ))}
        <defs>
          <linearGradient id="salesLine" x1="0" x2="1">
            <stop offset="0%" stopColor="#58b8ff" />
            <stop offset="100%" stopColor="#5b6cff" />
          </linearGradient>
          <linearGradient id="profitLine" x1="0" x2="1">
            <stop offset="0%" stopColor="#745bff" />
            <stop offset="100%" stopColor="#e66bff" />
          </linearGradient>
        </defs>
        <path d={revenuePath} fill="none" stroke="url(#salesLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={profitPath} fill="none" stroke="url(#profitLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => {
          const x = chartX(index, points.length);
          const revenueY = chartY(point.revenue, maxValue);
          const profitY = chartY(point.profit, maxValue);
          return (
            <g key={point.label}>
              <circle cx={x} cy={revenueY} r="6" fill="#fff" stroke="#58b8ff" strokeWidth="3" />
              <circle cx={x} cy={profitY} r="6" fill="#fff" stroke="#cf6cff" strokeWidth="3" />
              <text x={x} y="262" textAnchor="middle" fontSize="12" fill="#8a91ad">{point.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DashboardDonut({ delivered, pending, cancelled, total }: { delivered: number; pending: number; cancelled: number; total: number }) {
  const deliveredPercent = Math.round((delivered / total) * 100);
  const pendingPercent = Math.round((pending / total) * 100);
  const cancelledPercent = Math.max(0, 100 - deliveredPercent - pendingPercent);

  return (
    <div className="grid place-items-center gap-5 py-2">
      <div
        className="relative grid h-52 w-52 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#5b8cff 0 ${deliveredPercent}%, #ffd76b ${deliveredPercent}% ${deliveredPercent + pendingPercent}%, #ff8a6b ${deliveredPercent + pendingPercent}% 100%)`
        }}
      >
        <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(232,236,255,1)]">
          <div>
            <p className="text-3xl font-extrabold text-[#23233c]">{deliveredPercent || 0}%</p>
            <p className="text-xs font-semibold text-[#8a91ad]">Delivered</p>
          </div>
        </div>
      </div>
      <div className="grid w-full gap-3 text-sm font-semibold text-[#5f6683] sm:grid-cols-3">
        <span className="inline-flex items-center justify-center gap-2"><span className="h-3 w-3 rounded-full bg-[#5b8cff]" /> Delivered {delivered}</span>
        <span className="inline-flex items-center justify-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ffd76b]" /> Pending {pending}</span>
        <span className="inline-flex items-center justify-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ff8a6b]" /> Return {cancelled || cancelledPercent}</span>
      </div>
    </div>
  );
}

function TopSellingProducts({ products: catalog, orders }: { products: ApiProduct[]; orders: AdminOrder[] }) {
  const soldCount = new Map<string, number>();
  orders.forEach((order) => {
    order.products.forEach((item) => {
      soldCount.set(item.name, (soldCount.get(item.name) || 0) + item.quantity);
    });
  });

  const rows = [...(catalog.length ? catalog : [])]
    .map((product) => ({ product, sold: soldCount.get(product.title) || 0 }))
    .sort((left, right) => right.sold - left.sold || Number(right.product.featured) - Number(left.product.featured) || right.product.rating - left.product.rating)
    .slice(0, 4);

  if (!rows.length) {
    return <p className="rounded-2xl bg-[#f8faff] p-4 text-sm font-semibold text-[#8a91ad]">Products will appear here after catalog sync.</p>;
  }

  return (
    <div className="grid gap-4">
      {rows.map(({ product, sold }) => (
        <div key={product._id || product.title} className="flex items-center gap-4 rounded-2xl bg-[#f8faff] p-3">
          <img src={product.images[0] || "/assets/products/rudraksha-bracelet.png"} alt={product.title} className="h-16 w-16 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#23233c]">{product.title}</p>
            <p className="mt-1 text-xs font-semibold text-[#8a91ad]">{product.collection} / {sold} sold</p>
            <div className="mt-2 flex text-xs text-[#ffc947]">*****</div>
          </div>
          <p className="text-lg font-extrabold text-[#23233c]">Rs.{product.price}</p>
        </div>
      ))}
    </div>
  );
}

function FlowNode({ label, value, tone }: { label: string; value: string; tone: "dark" | "green" | "amber" | "red" }) {
  const toneClass = {
    dark: "border-[#211d33]/15 bg-[#211d33] text-white",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800"
  }[tone];

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="flex items-center justify-center text-[#b86b2b]">
      <span className="h-7 border-l border-dashed border-[#b86b2b]/60" />
      <span className="-ml-[5px] mt-7 text-sm font-bold">v</span>
    </div>
  );
}

function buildProfitPoints(orders: AdminOrder[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dateKey(date);
    const dayOrders = orders.filter((order) => dateKey(parseAdminDate(order.createdAt)) === key);
    const dayRevenue = dayOrders.filter((order) => order.paymentStatus === "Paid").reduce((sum, order) => sum + order.total, 0);
    const dayLoss = dayOrders
      .filter((order) => order.paymentStatus === "Refunded" || order.orderStatus === "Cancelled" || order.orderStatus === "Returned")
      .reduce((sum, order) => sum + order.total, 0);
    const dayCost = Math.round(dayRevenue * 0.66 + dayOrders.length * 70 + dayLoss);
    return {
      label: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      revenue: dayRevenue,
      profit: dayRevenue - dayCost
    };
  });
}

function buildSvgPath(points: ProfitPoint[], key: "revenue" | "profit", maxValue: number) {
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${chartX(index, points.length)} ${chartY(point[key], maxValue)}`;
    })
    .join(" ");
}

function chartX(index: number, count: number) {
  return 54 + (index * 626) / Math.max(1, count - 1);
}

function chartY(value: number, maxValue: number) {
  const clamped = Math.max(0, value);
  return 226 - (clamped / maxValue) * 184;
}

function parseAdminDate(value: string) {
  if (!value) return new Date();
  const isoDate = new Date(value);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;
  const [day, month, year] = value.split("/").map(Number);
  if (day && month && year) return new Date(year, month - 1, day);
  return new Date();
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatAdminMoney(value: number) {
  return `Rs.${Math.round(value).toLocaleString("en-IN")}`;
}

function ProductsPage() {
  const emptyProduct: Partial<ApiProduct> = {
    title: "",
    subtitle: "",
    description: "",
    category: "Rudraksha",
    collection: "Rudraksha",
    price: 599,
    compareAtPrice: 999,
    stock: 10,
    rating: 4.8,
    images: ["/assets/products/rudraksha-bracelet.png"],
    tags: ["rudraksha"],
    purpose: ["Peace"],
    featured: true,
    active: true
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [form, setForm] = useState<Partial<ApiProduct>>(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const selectedCategory = searchParams.get("category") || "All";

  useEffect(() => {
    refreshProducts(true);
    const refresh = () => {
      void refreshProducts(true);
    };
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, 20_000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
    };
  }, []);

  async function refreshProducts(force = false) {
    const [productRows, categoryRows] = await Promise.all([getAdminProducts(force), getAdminCategories(force)]);
    setCatalog(productRows);
    setCategories(categoryRows);
  }

  function updateField(name: keyof ApiProduct, value: string | number | boolean | string[]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateDiscountPercent(percent: number) {
    const mrp = Number(form.compareAtPrice || 0);
    if (!mrp) return;
    const safePercent = Math.max(0, Math.min(percent, 95));
    setForm((current) => ({ ...current, price: Math.round(mrp - (mrp * safePercent) / 100) }));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title?.trim()) {
      setError("Product name is required.");
      return;
    }

    if (Number(form.compareAtPrice || 0) < Number(form.price || 0)) {
      setError("MRP / old price should be greater than or equal to sale price.");
      return;
    }

    const payload = {
      ...form,
      title: form.title?.trim(),
      subtitle: form.subtitle || form.title,
      description: form.description || form.title,
      images: form.images?.length ? form.images : ["/assets/products/rudraksha-bracelet.png"],
      tags: form.tags?.length ? form.tags : [String(form.category || "").toLowerCase()],
      purpose: form.purpose?.length ? form.purpose : ["Peace"]
    };

    try {
      if (editingId) {
        await updateAdminProduct(editingId, payload);
        setMessage("Product updated. Client site will show the change after refresh.");
      } else {
        await createAdminProduct(payload);
        setMessage("Product added to client catalogue.");
      }

      setEditingId("");
      setForm(emptyProduct);
      await refreshProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Product could not be saved.");
    }
  }

  function editProduct(product: ApiProduct) {
    setEditingId(product._id || "");
    setForm(product);
    setMessage(`Editing: ${product.title}`);
    setError("");
    window.setTimeout(() => document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  async function toggleProduct(product: ApiProduct) {
    if (!product._id) return;
    if (product.active === false) {
      await updateAdminProduct(product._id, { active: true });
      setMessage("Product is active again on client site.");
    } else {
      await deleteAdminProduct(product._id);
      setMessage("Product hidden from client site. It still remains manageable in admin.");
    }
    await refreshProducts();
  }

  const filteredCatalog = catalog.filter((product) => {
    const matchesSearch = !searchText.trim() || `${product.title} ${product.category} ${product.collection}`.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory || product.collection === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const discountPercent = calculateDiscountPercent(Number(form.price || 0), Number(form.compareAtPrice || 0));
  const categoryNames = Array.from(new Set([...categories.map((category) => category.name), ...catalog.map((product) => product.category), ...catalog.map((product) => product.collection)])).filter(Boolean);

  return (
    <Page eyebrow="Catalog" title="Products" subtitle="Manage product pricing, stock, category, and storefront visibility.">
      <Panel title="Manage Product Catalogue">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <input className="admin-input" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search product name, category, collection" />
          <select
            className="admin-input"
            value={selectedCategory}
            onChange={(event) => event.target.value === "All" ? setSearchParams({}) : setSearchParams({ category: event.target.value })}
          >
            <option value="All">All Categories</option>
            {categoryNames.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <button
            type="button"
            onClick={() => {
              setEditingId("");
              setForm(emptyProduct);
              setMessage("Ready to add a new product.");
              document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="admin-button"
          >
            Add New Product
          </button>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#17172a]/55">
          Showing {filteredCatalog.length} of {catalog.length} products. Hidden products stay visible here for admin management.
        </p>
      </Panel>

      <div id="product-editor" className="mt-6 scroll-mt-24">
        <Panel title={editingId ? "Edit Product Details" : "Add Product"}>
          <form onSubmit={saveProduct} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Product Name">
              <input className="admin-input" value={form.title || ""} onChange={(event) => updateField("title", event.target.value)} placeholder="Product name" required />
            </Field>
            <Field label="Category">
              <select className="admin-input" value={form.category || ""} onChange={(event) => updateField("category", event.target.value)} required>
                {categoryNames.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Collection">
              <select className="admin-input" value={form.collection || ""} onChange={(event) => updateField("collection", event.target.value)} required>
                {categoryNames.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Image URL">
              <input className="admin-input" value={form.images?.[0] || ""} onChange={(event) => updateField("images", [event.target.value])} placeholder="Image URL" required />
            </Field>
            <Field label="Sale Price">
              <input className="admin-input" type="number" value={form.price || 0} onChange={(event) => updateField("price", Number(event.target.value))} placeholder="Sale price" required />
            </Field>
            <Field label="MRP / Old Price">
              <input className="admin-input" type="number" value={form.compareAtPrice || 0} onChange={(event) => updateField("compareAtPrice", Number(event.target.value))} placeholder="MRP" />
            </Field>
            <Field label="Discount %">
              <input className="admin-input" type="number" value={discountPercent} onChange={(event) => updateDiscountPercent(Number(event.target.value))} placeholder="Discount percent" />
            </Field>
            <Field label="Available Quantity / Stock">
              <input className="admin-input" type="number" value={form.stock || 0} onChange={(event) => updateField("stock", Number(event.target.value))} placeholder="Stock" required />
            </Field>
            <Field label="Purpose Tags" className="xl:col-span-2">
              <input className="admin-input" value={(form.purpose || []).join(", ")} onChange={(event) => updateField("purpose", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Wealth, Peace, Protection" />
            </Field>
            <Field label="Product Description" className="md:col-span-2">
              <textarea className="admin-input min-h-28" value={form.description || ""} onChange={(event) => updateField("description", event.target.value)} placeholder="Product description" />
            </Field>
            <div className="flex flex-wrap items-center gap-4 xl:col-span-4">
              <label className="flex items-center gap-2 rounded-lg bg-[#fff7ec] px-4 py-3 text-sm font-semibold"><input type="checkbox" checked={form.featured !== false} onChange={(event) => updateField("featured", event.target.checked)} /> Show as featured</label>
              <label className="flex items-center gap-2 rounded-lg bg-[#fff7ec] px-4 py-3 text-sm font-semibold"><input type="checkbox" checked={form.active !== false} onChange={(event) => updateField("active", event.target.checked)} /> Visible on client site</label>
              <Badge value={`Current discount: ${discountPercent}%`} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2 xl:col-span-4">{error}</p>}
            {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 md:col-span-2 xl:col-span-4">{message}</p>}
            <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-4">
              <button className="admin-button">{editingId ? "Update Product" : "Add Product"}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(""); setForm(emptyProduct); setMessage("Edit cancelled."); }} className="mini-button">Cancel Edit</button>}
            </div>
          </form>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Product Catalogue">
          <ResponsiveTable>
            <thead className="table-head">
              <tr>
                <th>Product</th>
                <th>Category / Collection</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Status & Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredCatalog.map((product) => {
                const isHidden = product.active === false;

                return (
                <tr key={product._id || product.slug} className={isHidden ? "bg-[#fff7ec] opacity-70" : ""}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.title} className={`h-14 w-14 rounded-lg object-cover ${isHidden ? "grayscale" : ""}`} />
                      <div>
                        <p className={`font-semibold ${isHidden ? "text-[#211d33]/45 line-through" : "text-[#211d33]"}`}>{product.title}</p>
                        <p className="text-xs text-[#17172a]/45">{isHidden ? "Hidden from client storefront" : product.slug || product._id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-semibold">{product.category}</p>
                    <p className="text-xs text-[#17172a]/45">{product.collection}</p>
                  </td>
                  <td>
                    <p className="font-bold">Rs.{product.price}</p>
                    <p className="text-xs text-[#17172a]/40 line-through">MRP Rs.{product.compareAtPrice}</p>
                  </td>
                  <td><Badge value={`${calculateDiscountPercent(product.price, product.compareAtPrice)}% off`} /></td>
                  <td className="font-bold">{product.stock}</td>
                  <td>
                    <div className="flex min-w-56 flex-wrap gap-2">
                      {isHidden ? (
                        <>
                          <Badge value="Hidden from client" />
                          <button type="button" onClick={() => toggleProduct(product)} className="mini-button">
                            Unhide on Client
                          </button>
                        </>
                      ) : (
                        <>
                          <Badge value={product.stock <= 10 ? "Low Stock" : "Active on client"} />
                          <button type="button" onClick={() => editProduct(product)} className="mini-button">Edit</button>
                          <button type="button" onClick={() => toggleProduct(product)} className="mini-button danger">
                            Hide
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </ResponsiveTable>
        </Panel>
      </div>
    </Page>
  );
}

function calculateDiscountPercent(price: number, mrp: number) {
  return mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-[#211d33] ${className}`}>
      {label}
      {children}
    </label>
  );
}

function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [catalog, setCatalog] = useState<ApiProduct[]>([]);
  const [form, setForm] = useState<Partial<ApiCategory>>({ name: "", description: "", active: true, featured: true });
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    refreshCategories(true);
    const refresh = () => {
      void refreshCategories(true);
    };
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, 20_000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
    };
  }, []);

  async function refreshCategories(force = false) {
    const [categoryRows, productRows] = await Promise.all([getAdminCategories(force), getAdminProducts(force)]);
    setCategories(categoryRows);
    setCatalog(productRows);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      await updateAdminCategory(editingId, form);
      setMessage("Category updated. Client filters will use the new category setup.");
    } else {
      await createAdminCategory({ ...form, featured: true, active: form.active !== false });
      setMessage("Category added for storefront filters.");
    }

    setEditingId("");
    setForm({ name: "", description: "", active: true, featured: true });
    await refreshCategories();
  }

  function editCategory(category: ApiCategory) {
    setEditingId(category._id || "");
    setForm(category);
    setMessage(`Editing category: ${category.name}`);
    window.setTimeout(() => document.getElementById("category-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  async function toggleCategory(category: ApiCategory) {
    if (!category._id) return;
    await updateAdminCategory(category._id, { active: !category.active });
    setMessage(category.active === false ? "Category is visible on client site." : "Category hidden from client site.");
    await refreshCategories();
  }

  async function removeCategory(category: ApiCategory) {
    if (!category._id) return;
    await deleteAdminCategory(category._id);
    setMessage("Category hidden from storefront.");
    await refreshCategories();
  }

  return (
    <Page eyebrow="Catalog" title="Product Categories" subtitle="Organize storefront filters and navigation labels.">
      <Panel title="How Category Management Works">
        <p className="text-sm leading-6 text-[#17172a]/65">
          Category ko yahan edit/show/hide karo. Kisi category ke products change karne ke liye <b>Manage Products</b> dabao, phir products page par product ka Category/Collection edit karo.
        </p>
      </Panel>

      <div id="category-editor" className="mt-6 scroll-mt-24">
      <Panel title={editingId ? "Edit Category" : "Add Category"}>
        <form onSubmit={saveCategory} className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
          <Field label="Category Name">
            <input className="admin-input" value={form.name || ""} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" required />
          </Field>
          <Field label="Description">
            <input className="admin-input" value={form.description || ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
          </Field>
          <div className="flex items-end gap-2">
            <button className="admin-button">{editingId ? "Update Category" : "Add Category"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(""); setForm({ name: "", description: "", active: true, featured: true }); }} className="mini-button">Cancel</button>}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold md:col-span-3">
            <input type="checkbox" checked={form.active !== false} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
            Visible on client site
          </label>
        </form>
        {message && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
      </Panel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const isHidden = category.active === false;

          return (
          <div key={category._id || category.name} className={`admin-card p-5 transition ${isHidden ? "bg-[#fff7ec] opacity-70" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`font-semibold ${isHidden ? "text-[#211d33]/45 line-through" : "text-[#211d33]"}`}>{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#17172a]/60">{isHidden ? "Hidden from client navigation and filters." : category.description || "No description added."}</p>
              </div>
              <Badge value={isHidden ? "Hidden from client" : "Visible on client"} />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#17172a]/55">
              {catalog.filter((product) => product.category === category.name || product.collection === category.name).length} products assigned
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {isHidden ? (
                <button onClick={() => toggleCategory(category)} className="mini-button">Unhide on Client</button>
              ) : (
                <>
                  <button onClick={() => editCategory(category)} className="mini-button">Edit</button>
                  <button onClick={() => navigate(`/admin/products?category=${encodeURIComponent(category.name)}`)} className="mini-button">Manage Products</button>
                  <button onClick={() => toggleCategory(category)} className="mini-button danger">Hide</button>
                  <button onClick={() => removeCategory(category)} className="mini-button danger">Delete</button>
                </>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </Page>
  );
}

function HomepagePage() {
  const items = homepageControls.map((item) => ({
    title: item,
    text: "Connected to homepage layout",
    status: "Editable",
    actionPath: homepageManagePath(item)
  }));

  return (
    <SimpleGridPage
      eyebrow="Website Control"
      title="Homepage Sections"
      subtitle="Update announcement, navbar, category strip, hero, trending, purpose cards, tradition gallery, and footer."
      items={items}
    />
  );
}

function HeroSliderPage() {
  return (
    <Page eyebrow="Homepage" title="Hero Slider" subtitle="Change only the banner photos used by the homepage slider.">
      <AdminHeroSliderManager />
    </Page>
  );
}

function LatestTrendingPage() {
  return (
    <Page eyebrow="Homepage" title="Latest & Trending" subtitle="Control carousel products, badges, image upload, and auto-slide timing.">
      <AdminTrendingManager />
    </Page>
  );
}

function ShopCollectionsPage() {
  const [catalog, setCatalog] = useState<ApiProduct[]>([]);
  const collections = ["Rudraksha Bracelets", "Rudraksha Malas", "Nepali/Indian Rudraksha", "Spiritual Jewellery", "Karungali Wearables", "Energy Stones", "Pyrite", "Sphatik", "Rose Quartz", "Tiger Eye", "Amethyst", "Combos", "Gift Hampers"];

  useEffect(() => {
    getAdminProducts(true).then(setCatalog);
  }, []);

  return (
    <SimpleGridPage
      eyebrow="Homepage"
      title="Shop Our Collections"
      subtitle="Manage collection circle labels, images, and product filters."
      items={collections.map((item) => ({
        title: item,
        text: `${catalog.filter((product) => productMatchesCollection(product, item)).length} connected products on client collection filter`,
        status: "Connected"
      }))}
    />
  );
}

function ShopPurposePage() {
  const [catalog, setCatalog] = useState<ApiProduct[]>([]);
  const purposes = ["Wealth", "Health", "Love", "Luck", "Protection", "Peace", "Courage", "Balance"];

  useEffect(() => {
    getAdminProducts(true).then(setCatalog);
  }, []);

  return (
    <SimpleGridPage
      eyebrow="Homepage"
      title="Shop By Purpose"
      subtitle="Manage purpose cards, icons, active filters, and product mapping."
      items={purposes.map((item) => ({
        title: item,
        text: `${catalog.filter((product) => product.purpose?.includes(item)).length} connected products on client purpose filter`,
        status: "Connected"
      }))}
    />
  );
}

function productMatchesCollection(product: ApiProduct, collection: string) {
  if (collection === "Rudraksha Bracelets") return product.category === "Rudraksha" && product.title.toLowerCase().includes("bracelet");
  if (collection === "Rudraksha Malas") return product.category === "Rudraksha" && product.title.toLowerCase().includes("mala");
  if (collection === "Nepali/Indian Rudraksha") return product.collection === "Nepali/Indian Rudraksha" || product.tags.includes("nepali-indian-rudraksha") || product.title.toLowerCase().includes("nepali");
  if (collection === "Karungali Wearables") return product.category === "Karungali";
  if (collection === "Energy Stones") return ["Energy Stones", "Pyrite", "Sphatik", "Tiger Eye", "Rose Quartz", "Amethyst"].includes(product.category);
  if (collection === "Combos") return product.category === "Combos" || product.collection === "Combos" || product.tags.includes("combo");
  if (collection === "Gift Hampers") return product.category === "Gift Hampers" || product.collection === "Gift Hampers" || product.tags.includes("gift-hampers");
  return product.collection === collection || product.category === collection;
}

function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    refreshOrders(true);
    const interval = window.setInterval(() => refreshOrders(true), 5000);
    return () => window.clearInterval(interval);
  }, []);

  async function refreshOrders(force = false) {
    try {
      const rows = await getAdminOrders(force);
      setSyncError("");
      setApiOrders(rows);
      setOrders(rows.map(adminOrderFromApi));
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Could not sync live orders.");
    }
  }

  async function updateLiveOrder(orderId: string, patch: Partial<ApiOrder>) {
    const apiOrder = apiOrders.find((order) => order.orderNumber === orderId || order._id === orderId);
    if (!apiOrder?._id) return;
    const updated = await updateAdminOrder(apiOrder._id, patch);
    setApiOrders((current) => current.map((order) => (order._id === updated._id ? updated : order)));
    setOrders((current) => current.map((order) => (order.id === orderId ? adminOrderFromApi(updated) : order)));
  }

  return (
    <Page eyebrow="Fulfilment" title="Orders" subtitle="Review products ordered, payment status, shipping, tracking, and admin actions.">
      <OrderActionPanel orders={orders} />
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={() => refreshOrders(true)} className="admin-button">
          Refresh Orders
        </button>
      </div>
      {syncError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{syncError}</p>}
      <div className="mt-6">
        <OrderTable rows={orders} onStatusChange={setOrders} onLiveUpdate={updateLiveOrder} />
      </div>
    </Page>
  );
}

function OrderListPage({ type }: { type: "COD" | "Prepaid" }) {
  const [orders, setOrders] = useState(initialOrders.filter((order) => order.paymentType === type));
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    refreshOrders(true);
    const interval = window.setInterval(() => refreshOrders(true), 5000);
    return () => window.clearInterval(interval);
  }, [type]);

  async function refreshOrders(force = false) {
    try {
      const rows = await getAdminOrders(force);
      setSyncError("");
      setApiOrders(rows);
      setOrders(rows.map(adminOrderFromApi).filter((order) => order.paymentType === type));
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Could not sync live orders.");
    }
  }

  async function updateLiveOrder(orderId: string, patch: Partial<ApiOrder>) {
    const apiOrder = apiOrders.find((order) => order.orderNumber === orderId || order._id === orderId);
    if (!apiOrder?._id) return;
    const updated = await updateAdminOrder(apiOrder._id, patch);
    setApiOrders((current) => current.map((order) => (order._id === updated._id ? updated : order)));
    setOrders((current) => current.map((order) => (order.id === orderId ? adminOrderFromApi(updated) : order)).filter((order) => order.paymentType === type));
  }

  return (
    <Page
      eyebrow="Fulfilment"
      title={type === "COD" ? "COD Orders" : "Prepaid Orders"}
      subtitle={type === "COD" ? "Collectable cash orders with confirmation and courier controls." : "Paid online orders with payment provider and transaction details."}
    >
      <OrderActionPanel orders={orders} />
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={() => refreshOrders(true)} className="admin-button">
          Refresh Orders
        </button>
      </div>
      {syncError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{syncError}</p>}
      <div className="mt-6">
        <OrderTable rows={orders} onStatusChange={setOrders} onLiveUpdate={updateLiveOrder} />
      </div>
    </Page>
  );
}

function CustomersPage() {
  const [customerRows, setCustomerRows] = useState<ApiCustomer[]>(
    customers.map((customer) => ({ ...customer, id: String(customer.id) }))
  );
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    refreshCustomers();
    const interval = window.setInterval(refreshCustomers, 5000);
    return () => window.clearInterval(interval);
  }, []);

  async function refreshCustomers() {
    try {
      const rows = await getAdminCustomers();
      setSyncError("");
      setCustomerRows(rows);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Could not sync live customers.");
    }
  }

  return (
    <Page eyebrow="CRM" title="Customers" subtitle="Customer profiles, order counts, spending, and buyer segment.">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {syncError ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{syncError}</p> : <span />}
        <button type="button" onClick={refreshCustomers} className="admin-button">
          Refresh Customers
        </button>
      </div>
      <Panel title="Customer Directory">
        <div className="grid gap-3">
          {customerRows.map((customer) => (
            <div key={customer._id || customer.id || customer.email} className="grid gap-3 rounded-xl border border-[#211d33]/10 bg-white p-4 md:grid-cols-[1fr_130px_130px_140px] md:items-center">
              <div>
                <p className="font-semibold text-[#211d33]">{customer.name}</p>
                <p className="text-sm text-[#17172a]/55">{customer.email} | {customer.phone}</p>
              </div>
              <p className="text-sm font-semibold">{customer.orders || 0} orders</p>
              <p className="text-sm font-semibold">Rs.{customer.spent || 0}</p>
              <Badge value={customer.segment || "New"} />
            </div>
          ))}
        </div>
      </Panel>
    </Page>
  );
}

function CouponsPage() {
  const emptyCoupon: Partial<ApiCoupon> = { code: "", type: "percent", value: 10, minSubtotal: 799, active: true };
  const [couponRows, setCouponRows] = useState<ApiCoupon[]>([]);
  const [form, setForm] = useState<Partial<ApiCoupon>>(emptyCoupon);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    refreshCoupons();
  }, []);

  async function refreshCoupons() {
    setCouponRows(await getAdminCoupons());
  }

  function updateField(name: keyof ApiCoupon, value: string | number | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.code?.trim()) {
      setError("Coupon code is required.");
      return;
    }

    if (Number(form.value || 0) <= 0) {
      setError("Discount value must be greater than 0.");
      return;
    }

    try {
      if (editingId) {
        await updateAdminCoupon(editingId, form);
        setMessage("Coupon updated. Product page and checkout will use the new rule.");
      } else {
        await createAdminCoupon(form);
        setMessage("Coupon created for product page and checkout.");
      }

      setEditingId("");
      setForm(emptyCoupon);
      await refreshCoupons();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Coupon could not be saved.");
    }
  }

  function editCoupon(coupon: ApiCoupon) {
    setEditingId(coupon._id || "");
    setForm(coupon);
    setMessage(`Editing coupon: ${coupon.code}`);
    setError("");
    window.setTimeout(() => document.getElementById("coupon-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  async function toggleCoupon(coupon: ApiCoupon) {
    if (!coupon._id) return;
    if (coupon.active) {
      await deleteAdminCoupon(coupon._id);
      setMessage("Coupon hidden from product page and disabled at checkout.");
    } else {
      await updateAdminCoupon(coupon._id, { active: true });
      setMessage("Coupon is active again on product page and checkout.");
    }
    await refreshCoupons();
  }

  return (
    <Page eyebrow="Marketing" title="Coupons" subtitle="Manage active discounts, checkout validation, and campaign rules.">
      <Panel title="Coupon Connection">
        <p className="text-sm leading-6 text-[#17172a]/65">
          Active = Yes ka matlab coupon product page ke Exclusive Offers me dikhega aur checkout me apply hoga. Active = No ka matlab coupon client site par hidden/disabled hoga.
        </p>
      </Panel>
      <div id="coupon-editor" className="mt-6 scroll-mt-24">
      <Panel title={editingId ? "Edit Coupon" : "Add Coupon"}>
        <form onSubmit={saveCoupon} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Coupon Code">
            <input className="admin-input" value={form.code || ""} onChange={(event) => updateField("code", event.target.value.toUpperCase())} placeholder="FIRST10" required />
          </Field>
          <Field label="Discount Type">
            <select className="admin-input" value={form.type || "percent"} onChange={(event) => updateField("type", event.target.value as ApiCoupon["type"])}>
              <option value="percent">Percent</option>
              <option value="flat">Flat Rs.</option>
            </select>
          </Field>
          <Field label="Discount Value">
            <input className="admin-input" type="number" value={form.value || 0} onChange={(event) => updateField("value", Number(event.target.value))} placeholder="Discount value" required />
          </Field>
          <Field label="Minimum Cart Value">
            <input className="admin-input" type="number" value={form.minSubtotal || 0} onChange={(event) => updateField("minSubtotal", Number(event.target.value))} placeholder="Minimum cart" />
          </Field>
          <Field label="Active on Client?">
            <select className="admin-input" value={form.active === false ? "no" : "yes"} onChange={(event) => updateField("active", event.target.value === "yes")}>
              <option value="yes">Yes - show and allow</option>
              <option value="no">No - hide and disable</option>
            </select>
          </Field>
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2 xl:col-span-5">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 md:col-span-2 xl:col-span-5">{message}</p>}
          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-5">
            <button className="admin-button">{editingId ? "Update Coupon" : "Add Coupon"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(""); setForm(emptyCoupon); setMessage("Edit cancelled."); }} className="mini-button">Cancel Edit</button>}
          </div>
        </form>
      </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Coupon Codes">
          <ResponsiveTable>
            <thead className="table-head">
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Minimum Cart</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {couponRows.map((coupon) => (
                <tr key={coupon._id || coupon.code}>
                  <td className="font-bold text-[#211d33]">{coupon.code}</td>
                  <td>{coupon.type === "percent" ? `${coupon.value}% off` : `Rs.${coupon.value} off`}</td>
                  <td>Rs.{coupon.minSubtotal}</td>
                  <td><Badge value={coupon.active ? "Active" : "Disabled"} /></td>
                  <td>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editCoupon(coupon)} className="mini-button">Edit</button>
                      <button type="button" onClick={() => toggleCoupon(coupon)} className={coupon.active ? "mini-button danger" : "mini-button"}>
                        {coupon.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </Panel>
      </div>
    </Page>
  );
}

function ShippingSettingsPage() {
  return (
    <SimpleGridPage
      eyebrow="Operations"
      title="Shipping Settings"
      subtitle="Configure delivery fees, COD availability, and delivery timelines."
      items={shippingSettings.map((setting) => ({ title: setting.zone, text: `Rs.${setting.fee} shipping | ${setting.eta}`, status: setting.cod ? "COD enabled" : "Prepaid only" }))}
    />
  );
}

function WebsiteSettingsPage() {
  return (
    <Page eyebrow="Website" title="Website Settings" subtitle="Brand identity, logo, footer, policies, tracking, and storefront preferences.">
      <AdminCredentialSettings />
      <AdminTraditionGalleryManager />
    </Page>
  );
}

function AdminCredentialSettings() {
  const credentials = getAdminCredentials();
  const [username, setUsername] = useState(credentials.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeCredentials = getAdminCredentials();
    const nextUsername = username.trim();

    setMessage("");
    setError("");

    if (!nextUsername) {
      setError("Username cannot be empty.");
      return;
    }

    if (currentPassword !== activeCredentials.password) {
      setError("Current password is incorrect.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    saveAdminCredentials({
      username: nextUsername,
      password: newPassword || activeCredentials.password
    });
    setUsername(nextUsername);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Admin login details updated. Use the new details from next login.");
  }

  return (
    <form onSubmit={updateCredentials} className="admin-security-card mb-6 overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
        <aside className="bg-[#211d33] p-6 text-white md:p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6e8ce] text-[#211d33]">
            <LockKeyhole size={21} />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#d99a58]">Security</p>
          <h3 className="mt-2 text-2xl font-bold leading-tight">Admin Login Details</h3>
          <p className="mt-3 text-sm font-light leading-6 text-white/68">
            Update the private credentials used for opening the admin dashboard.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f6e8ce]/70">Current Username</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6e8ce] text-[#211d33]">
                <UserRound size={17} />
              </span>
              <span className="text-lg font-semibold">{credentials.username}</span>
            </div>
          </div>

          <p className="mt-5 rounded-xl bg-[#f6e8ce] px-4 py-3 text-xs font-semibold leading-5 text-[#211d33]">
            Active login: {defaultAdminCredentials.username} / {defaultAdminCredentials.password}
          </p>
        </aside>

        <div className="bg-[#fffdf8] p-5 md:p-7">
          <div className="flex flex-col gap-3 border-b border-[#211d33]/10 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b86b2b]">Credential Control</p>
              <h4 className="mt-2 text-xl font-bold text-[#211d33]">Change Username & Password</h4>
              <p className="mt-1 text-sm leading-6 text-[#17172a]/58">Enter your current password before saving new login details.</p>
            </div>
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-[#b86b2b]/20 bg-[#f6e8ce] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#211d33]">
              <KeyRound size={14} /> Protected
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#211d33]">
              Admin Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="admin-input"
                placeholder="admin"
                autoComplete="username"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#211d33]">
              Current Password
              <input
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="admin-input"
                placeholder="Enter current password"
                type="password"
                autoComplete="current-password"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#211d33]">
              New Password
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="admin-input"
                placeholder="Leave blank to keep same password"
                type="password"
                autoComplete="new-password"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#211d33]">
              Confirm New Password
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="admin-input"
                placeholder="Confirm new password"
                type="password"
                autoComplete="new-password"
              />
            </label>
          </div>

          {error && <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          {message && <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="admin-button">Save Login Details</button>
            <p className="text-xs font-medium text-[#17172a]/50">The new details apply from the next admin login.</p>
          </div>
        </div>
      </div>
    </form>
  );
}

function SupportPage() {
  const [supportTickets, setSupportTickets] = useState<ApiSupportTicket[]>([]);
  const [supportMessage, setSupportMessage] = useState("");

  useEffect(() => {
    refreshSupportTickets();
  }, []);

  async function refreshSupportTickets() {
    setSupportTickets(await getAdminSupportTickets());
  }

  async function updateTicket(ticket: ApiSupportTicket, payload: Partial<ApiSupportTicket> & { reply?: string }) {
    if (!ticket._id) return;
    const updated = await updateAdminSupportTicket(ticket._id, payload);
    setSupportTickets((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    setSupportMessage("Ticket updated. Client panel will show the latest status/reply.");
  }

  async function replyToTicket(ticket: ApiSupportTicket) {
    const reply = window.prompt("Reply for client", "");
    if (!reply?.trim()) return;
    await updateTicket(ticket, { status: "in-progress", reply: reply.trim() });
  }

  return (
    <Page
      eyebrow="Customer Care"
      title="Support"
      subtitle="Support inbox for order tracking, returns, product questions, wholesale enquiries, and payment issues."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {supportMessage ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{supportMessage}</p> : <span />}
        <button type="button" onClick={refreshSupportTickets} className="admin-button">
          Refresh Support
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {supportTickets.map((ticket) => (
          <div key={ticket._id || ticket.subject} className="admin-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#211d33]">{ticket.subject}</h3>
                <p className="mt-2 text-sm leading-6 text-[#17172a]/60">
                  {ticket.name} {ticket.phone ? `| ${ticket.phone}` : ""}
                </p>
              </div>
              <Badge value={supportStatusLabel(ticket.status)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge value={supportCategoryLabel(ticket.category)} />
              <Badge value={(ticket.priority || "normal").toUpperCase()} />
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#17172a]/65">{ticket.message}</p>
            {!!ticket.replies?.length && (
              <div className="mt-4 rounded-xl bg-[#fff7ec] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b86b2b]">Replies</p>
                <div className="mt-3 grid gap-2">
                  {ticket.replies.map((reply, index) => (
                    <p key={`${ticket._id}-reply-${index}`} className="text-sm leading-6 text-[#17172a]/65">
                      <b className="capitalize text-[#211d33]">{reply.authorRole}:</b> {reply.message}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 border-t border-[#211d33]/10 pt-4 text-xs font-semibold text-[#17172a]/45">
              <p>{ticket.email}</p>
              {ticket.orderNumber && <p className="mt-1">{ticket.orderNumber}</p>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => replyToTicket(ticket)} className="mini-button">
                Reply
              </button>
              <button type="button" onClick={() => updateTicket(ticket, { status: "in-progress" })} className="mini-button">
                In Progress
              </button>
              <button type="button" onClick={() => updateTicket(ticket, { status: "resolved" })} className="mini-button">
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

function supportCategoryLabel(category: ApiSupportTicket["category"]) {
  if (category === "bulk-wholesale") return "Bulk / Wholesale";
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function supportStatusLabel(status: ApiSupportTicket["status"]) {
  if (status === "in-progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function OrderActionPanel({ orders }: { orders: AdminOrder[] }) {
  const codTotal = orders.filter((order) => order.paymentType === "COD").reduce((sum, order) => sum + order.total, 0);
  const prepaidTotal = orders.filter((order) => order.paymentType === "Prepaid" && order.paymentStatus === "Paid").reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Orders In View" value={orders.length} icon={ShoppingCart} />
      <Metric label="Pending Dispatch" value={orders.filter((order) => ["Pending", "Confirmed", "Packed"].includes(order.orderStatus)).length} icon={Truck} />
      <Metric label="COD To Collect" value={`Rs.${codTotal}`} icon={IndianRupee} />
      <Metric label="Prepaid Captured" value={`Rs.${prepaidTotal}`} icon={CreditCard} />
    </div>
  );
}

function OrderTable({
  compact = false,
  rows = initialOrders,
  onStatusChange,
  onLiveUpdate
}: {
  compact?: boolean;
  rows?: AdminOrder[];
  onStatusChange?: (orders: AdminOrder[]) => void;
  onLiveUpdate?: (orderId: string, patch: Partial<ApiOrder>) => Promise<void>;
}) {
  const visibleRows = compact ? rows.slice(0, 3) : rows;

  async function updateStatus(orderId: string, status: AdminOrder["orderStatus"]) {
    onStatusChange?.(rows.map((order) => (order.id === orderId ? { ...order, orderStatus: status } : order)));
    await onLiveUpdate?.(orderId, { status: apiStatusFromAdmin(status) });
  }

  async function updateShipping(order: AdminOrder) {
    const trackingId = window.prompt("Tracking ID", order.trackingId || "");
    if (trackingId === null) return;
    const courierPartner = window.prompt("Courier partner", order.courierPartner || "");
    if (courierPartner === null) return;
    const adminNotes = window.prompt("Admin notes", order.adminNotes || "");
    if (adminNotes === null) return;

    onStatusChange?.(
      rows.map((row) =>
        row.id === order.id
          ? { ...row, trackingId, courierPartner, adminNotes }
          : row
      )
    );
    await onLiveUpdate?.(order.id, { trackingId, courierPartner, adminNotes });
  }

  return (
    <Panel title={compact ? "Recent Orders" : "Order Management"}>
      <ResponsiveTable>
        <thead className="table-head">
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Products Ordered</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Shipping</th>
            {!compact && <th>Actions</th>}
          </tr>
        </thead>
        <tbody className="table-body">
          {visibleRows.map((order) => (
            <tr key={order.id}>
              <td>
                <p className="font-bold text-[#211d33]">{order.id}</p>
                <p className="text-xs text-[#17172a]/45">{order.createdAt}</p>
              </td>
              <td>
                <p className="font-semibold">{order.customer}</p>
                <p className="text-xs text-[#17172a]/50">{order.phone}</p>
                <p className="text-xs text-[#17172a]/50">{order.email}</p>
                <p className="mt-1 max-w-48 text-xs text-[#17172a]/45">{order.address}</p>
              </td>
              <td>
                <div className="grid gap-2">
                  {order.products.map((item) => (
                    <div key={`${order.id}-${item.id}`} className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="h-11 w-11 rounded-lg object-cover" />
                      <div>
                        <p className="max-w-48 font-semibold text-[#211d33]">{item.name}</p>
                        <p className="text-xs text-[#17172a]/50">Qty {item.quantity} {item.size ? `| ${item.size}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </td>
              <td className="font-bold">Rs.{order.total}</td>
              <td>
                <div className="grid gap-1">
                  <Badge value={order.paymentType} />
                  <Badge value={order.paymentStatus} />
                  {order.walletTransactionId && <p className="text-xs text-[#17172a]/45">{order.walletTransactionId}</p>}
                </div>
              </td>
              <td><Badge value={order.orderStatus} /></td>
              <td>
                <p className="font-semibold">{order.courierPartner}</p>
                <p className="text-xs text-[#17172a]/50">{order.trackingId}</p>
                <p className="mt-1 max-w-44 text-xs text-[#17172a]/45">{order.adminNotes}</p>
              </td>
              {!compact && (
                <td>
                  <div className="flex min-w-56 flex-wrap gap-2">
                    {statusFlow.map((status) => (
                      <button key={status} onClick={() => updateStatus(order.id, status)} className="mini-button">
                        {status === "Confirmed" ? "Confirm" : status === "Packed" ? "Pack" : status === "Shipped" ? "Ship" : "Deliver"}
                      </button>
                    ))}
                    <button onClick={() => updateStatus(order.id, "Cancelled")} className="mini-button danger">Cancel</button>
                    <button onClick={() => updateShipping(order)} className="mini-button gap-1"><Truck size={13} /> Tracking</button>
                    <button className="mini-button gap-1"><Printer size={13} /> Invoice</button>
                    <button className="mini-button gap-1"><MessageCircle size={13} /> WhatsApp</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </Panel>
  );
}

function SimpleGridPage({
  eyebrow,
  title,
  subtitle,
  items
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Array<{ title: string; text: string; status: string; actionPath?: string }>;
}) {
  const navigate = useNavigate();

  return (
    <Page eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="admin-card p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#211d33]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#17172a]/60">{item.text}</p>
              </div>
              <Badge value={item.status} />
            </div>
            <button
              type="button"
              onClick={() => item.actionPath && navigate(item.actionPath)}
              disabled={!item.actionPath}
              className="mt-5 rounded-lg border border-[#211d33]/10 px-4 py-2 text-sm font-semibold text-[#211d33] hover:border-[#b86b2b] hover:text-[#b86b2b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Manage
            </button>
          </div>
        ))}
      </div>
    </Page>
  );
}

function homepageManagePath(item: string) {
  if (item.includes("Hero slider")) return "/admin/hero-slider";
  if (item.includes("Latest & Trending")) return "/admin/latest-trending";
  if (item.includes("Collections")) return "/admin/shop-collections";
  if (item.includes("Purpose")) return "/admin/shop-purpose";
  if (item.includes("categories") || item.includes("Category strip")) return "/admin/product-categories";
  if (item.includes("gallery") || item.includes("Logo") || item.includes("Footer") || item.includes("Announcement")) return "/admin/website-settings";
  return "/admin/website-settings";
}

function Page({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a91ad]">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#23233c] md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#727994]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#edf0ff] px-6 py-5">
        <h3 className="font-bold text-[#23233c]">{title}</h3>
        <span className="text-xl font-bold leading-none text-[#c0c6dc]">...</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, compact = false }: { label: string; value: string | number; icon: typeof LayoutDashboard; compact?: boolean }) {
  if (compact) {
    return (
      <div className="admin-card relative min-h-[126px] overflow-hidden p-5 transition hover:-translate-y-0.5">
        <span className="absolute right-4 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef1ff] text-[#5b6cff]">
          <Icon size={21} />
        </span>
        <div>
          <p className="max-w-[7rem] text-[14px] font-semibold leading-5 text-[#727994]">{label}</p>
          <p className="mt-8 whitespace-nowrap text-[24px] font-extrabold leading-none tracking-tight text-[#23233c]">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card min-h-[112px] p-5 transition hover:-translate-y-0.5">
      <div className="flex h-full items-center gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eef1ff] text-[#5b6cff]">
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <p className="break-words text-2xl font-extrabold leading-tight text-[#23233c]">{value}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#727994]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ResponsiveTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">{children}</table>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return <span className="inline-flex w-max rounded-full bg-[#eef1ff] px-3 py-1 text-xs font-semibold text-[#5b6cff]">{value}</span>;
}
