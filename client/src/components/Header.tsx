import { ChevronDown, Menu, Search, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const preferredNavOrder = ["Rudraksha", "Energy Stones", "Karungali", "Combos", "Spiritual Jewellery", "Gift Hampers"];
const announcements = [
  {
    text: "100% Cashback available upto Rs.500",
    href: "/pages/cashback-policy"
  },
  {
    text: "Free delivery on orders over Rs.299",
    href: "/collections"
  },
  {
    text: "Har Ghar Rudraksha - Claim Free 5 Mukhi",
    href: collectionHref("Rudraksha")
  }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { items, openCart } = useCart();
  const navigate = useNavigate();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const nav = useMemo(() => buildNav(), []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    setOpen(false);
    setSearchOpen(false);
    navigate(`/collections?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-[#fbf2e3] text-[#17172a] shadow-sm">
      <AnnouncementBar />

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
          <button
            type="button"
            className="rounded-full p-2.5 hover:bg-white/70"
            aria-label="Search"
            onClick={() => setSearchOpen((value) => !value)}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
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

      {searchOpen && (
        <div className="border-t border-[#211d33]/10 bg-[#fbf2e3] px-4 py-4">
          <form onSubmit={submitSearch} className="container-pad flex flex-col gap-3 p-0 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search products</span>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/45" size={18} />
              <input
                autoFocus
                className="w-full rounded-full border border-[#211d33]/15 bg-white px-12 py-3 text-sm font-semibold outline-none transition focus:border-rudra focus:ring-2 focus:ring-rudra/10"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products, categories, purpose..."
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/50 hover:bg-sandal hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </label>
            <button className="rounded-full bg-[#211d33] px-6 py-3 text-sm font-black text-white">
              Search
            </button>
          </form>
        </div>
      )}

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
                onClick={
                  index === 0
                    ? () => setSearchOpen((value) => !value)
                    : index === 3
                      ? () => { setOpen(false); openCart(); }
                      : undefined
                }
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

function AnnouncementBar() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % announcements.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white">
      <div className="container-pad flex h-[38px] items-center justify-center md:justify-between">
        <div className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden md:justify-start">
          {announcements.map((item, index) => (
            <Link
              key={item.text}
              to={item.href}
              aria-hidden={activeIndex !== index}
              className={`absolute inset-x-0 flex h-full items-center justify-center text-center text-sm font-semibold leading-none transition duration-500 md:justify-start ${
                activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              {item.text}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 md:flex">
          India
          <span className="h-1 w-1 rounded-full bg-white/55" />
          INR
        </div>
      </div>
    </div>
  );
}

function buildNav() {
  return [
    ...preferredNavOrder.map((name) => ({
      label: name,
      href: collectionHref(name),
      dropdown: ["Rudraksha", "Energy Stones", "Combos", "Spiritual Jewellery", "Gift Hampers"].includes(name)
    })),
    { label: "Bulk / Wholesale", href: "/pages/bulk-wholesale", dropdown: false },
    { label: "Support", href: "/support", dropdown: true }
  ];
}

function collectionHref(name: string) {
  return `/collections?collection=${encodeURIComponent(name)}`;
}
