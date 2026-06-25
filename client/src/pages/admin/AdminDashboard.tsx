import { AlertTriangle, Boxes, IndianRupee, ShoppingCart, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell } from "../../components/AdminShell";
import { StatCard } from "../../components/StatCard";
import { getAdminDashboard } from "../../lib/api";
import type { Order } from "../../types";

type DashboardData = {
  revenue: number;
  orders: number;
  pendingOrders: number;
  products: number;
  customers: number;
  lowStock: number;
  recentOrders: Order[];
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData>();

  useEffect(() => {
    getAdminDashboard().then(setData);
  }, []);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Revenue" value={`Rs.${data?.revenue ?? 0}`} note="all time" />
        <StatCard label="Orders" value={data?.orders ?? 0} note="total" />
        <StatCard label="Pending" value={data?.pendingOrders ?? 0} note="needs action" />
        <StatCard label="Products" value={data?.products ?? 0} note="active" />
        <StatCard label="Customers" value={data?.customers ?? 0} note="registered" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-rudra/10 bg-white p-5">
          <h2 className="text-xl font-black">Recent Orders</h2>
          <div className="mt-5 divide-y divide-rudra/10">
            {(data?.recentOrders || []).map((order) => (
              <div key={order.orderNumber} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-black">{order.orderNumber}</p>
                  <p className="text-sm text-ink/55">{order.customer.name}</p>
                </div>
                <span className="rounded-full bg-sandal px-3 py-1 text-xs font-black capitalize text-rudra">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: IndianRupee, title: "Payment setup", text: "Connect Razorpay, Stripe, or Cashfree for live checkout." },
            { icon: Boxes, title: "Inventory", text: `${data?.lowStock ?? 0} products are low on stock.` },
            { icon: ShoppingCart, title: "Abandoned carts", text: "Add cart recovery emails from customer events." },
            { icon: Users, title: "Customers", text: "View client profiles, orders, addresses, and tickets." },
            { icon: AlertTriangle, title: "Production note", text: "Replace demo auth secret and configure real policies." }
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-rudra/10 bg-white p-5">
              <item.icon className="text-saffron" />
              <h3 className="mt-3 font-black">{item.title}</h3>
              <p className="mt-1 text-sm text-ink/55">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
