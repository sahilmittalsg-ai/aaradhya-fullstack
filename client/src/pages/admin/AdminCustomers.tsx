import { useEffect, useState } from "react";
import { AdminShell } from "../../components/AdminShell";
import { getCustomers } from "../../lib/api";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  orders?: number;
  spent?: number;
  productCount?: number;
  segment?: string;
  createdAt?: string;
};

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  return (
    <AdminShell title="Customers">
      <div className="overflow-hidden rounded-lg border border-rudra/10 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-sandal text-xs uppercase tracking-[0.16em] text-rudra">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Spent</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rudra/10">
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td className="px-4 py-4 font-black">{customer.name}</td>
                <td className="px-4 py-4">{customer.email}</td>
                <td className="px-4 py-4">{customer.phone || "-"}</td>
                <td className="px-4 py-4">{customer.orders || 0}</td>
                <td className="px-4 py-4">Rs.{customer.spent || 0}</td>
                <td className="px-4 py-4">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-sandal px-3 py-1 text-xs font-black text-rudra">{customer.segment || "New"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
