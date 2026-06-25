import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Support", href: "/admin/support" }
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="container-pad py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-black">{title}</h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm font-bold ${isActive ? "bg-ink text-white" : "bg-white text-ink"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {children}
    </section>
  );
}
