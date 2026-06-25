import { ChevronDown, Menu, Search, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProducts } from "../lib/api";
import type { Product } from "../types";

const preferredNavOrder = ["Rudraksha", "Energy Stones", "Karungali", "Spiritual Jewellery", "Gift Hampers"];

export function Header() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { items, openCart } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const nav = useMemo(() => buildNav(products), [products]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#fbf2e3] text-[#17172a] shadow-sm">
      <div className="flex h-[38px] items-center justify-center bg-black px-4 text-center text-sm font-medium text-white">
        <span>🙏 Har Ghar Rudraksha - </span>
          <Link to={collectionHref("Rudraksha")} className="ml-1 underline underline-offset-4">
          Claim Free 5 Mukhi
        </Link>
      </div>

      <div className="container-pad flex h-[92px] items-center justify-between gap-5">
        <Link to="/" className="relative flex min-w-20 items-center justify-center" aria-label="Japam home">
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#c43824]" />
          <span className="font-heading text-4xl font-bold leading-none tracking-tight">जपं</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-5 text-[13px] font-medium xl:flex">
          {nav.map((item) => (
            <NavLink key={item.href} to={item.href} className="inline-flex items-center gap-1 whitespace-nowrap hover:text-rudra">
              {item.label}
              {item.dropdown && <ChevronDown size={14} strokeWidth={2.5} />}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <button className="rounded-full p-2.5 hover:bg-white/70" aria-label="Search">
            <Search size={20} />
          </button>
          <Link to="/account" className="rounded-full p-2.5 hover:bg-white/70" aria-label="Account">
            <UserRound size={20} />
          </Link>
          <button className="rounded-full p-2.5 hover:bg-white/70" aria-label="Energy guide">
            <Sparkles size={20} />
          </button>
          <button type="button" onClick={openCart} className="relative rounded-full p-2.5 hover:bg-white/70" aria-label="Cart">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#211d33] px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <Link to="/support" className="rounded-full bg-[#211d33] px-5 py-3 text-sm font-semibold text-white">
            Chat with Sevak
          </Link>
        </div>

        <button className="rounded-full border border-[#211d33]/15 bg-white/60 p-3 xl:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#211d33]/10 bg-[#fbf2e3] px-4 pb-5 xl:hidden">
          <nav className="grid gap-1 text-sm font-medium">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-3 hover:bg-white/70"
              >
                {item.label}
                {item.dropdown && <ChevronDown size={15} />}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[Search, UserRound, Sparkles, ShoppingBag].map((Icon, index) => (
              <button
                key={index}
                className="rounded-md bg-white/70 p-3"
                aria-label="Header action"
                onClick={index === 3 ? () => { setOpen(false); openCart(); } : undefined}
              >
                <Icon size={18} className="mx-auto" />
              </button>
            ))}
          </div>
          <Link to="/support" onClick={() => setOpen(false)} className="mt-3 flex justify-center rounded-full bg-[#211d33] px-5 py-3 text-sm font-semibold text-white">
            Chat with Sevak
          </Link>
        </div>
      )}
    </header>
  );
}

function buildNav(products: Product[]) {
  const availableNames = new Set<string>();

  products.forEach((product) => {
    if (product.category) availableNames.add(product.category);
    if (product.collection) availableNames.add(product.collection);
  });

  const names = preferredNavOrder.filter((name) => availableNames.size === 0 || availableNames.has(name));

  return [
    ...names.map((name) => ({
      label: name,
      href: collectionHref(name),
      dropdown: ["Rudraksha", "Energy Stones", "Spiritual Jewellery", "Gift Hampers"].includes(name)
    })),
    { label: "Bulk / Wholesale", href: "/pages/bulk-wholesale", dropdown: false },
    { label: "Support", href: "/support", dropdown: true }
  ];
}

function collectionHref(name: string) {
  return `/collections?collection=${encodeURIComponent(name)}`;
}
