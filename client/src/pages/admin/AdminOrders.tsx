import { useEffect, useState } from "react";
import { AdminShell } from "../../components/AdminShell";
import { getOrders } from "../../lib/api";
import type { Order } from "../../types";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  return (
    <AdminShell title="Orders">
      <div className="overflow-hidden rounded-lg border border-rudra/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-sandal text-xs uppercase tracking-[0.16em] text-rudra">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rudra/10">
            {orders.map((order) => (
              <tr key={order.orderNumber}>
                <td className="px-4 py-4 font-black">{order.orderNumber}</td>
                <td className="px-4 py-4">
                  <p className="font-bold">{order.customer.name}</p>
                  <p className="text-xs text-ink/50">{order.customer.email}</p>
                </td>
                <td className="px-4 py-4">{order.items.length}</td>
                <td className="px-4 py-4 font-bold">Rs.{order.total}</td>
                <td className="px-4 py-4 capitalize">{order.paymentStatus}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-sandal px-3 py-1 text-xs font-black capitalize text-rudra">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
