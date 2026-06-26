import { ChevronDown, Menu, Search, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const preferredNavOrder = ["Rudraksha", "Energy Stones", "Karungali", "Combos", "Spiritual Jewellery", "Gift Hampers"];
const searchPlaceholders = ["Search for Rudraksha", "Search for Karungali", "Search for Pyrite"];
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
  const [placeholderIndex, setPlaceholderIndex] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { items, openCart } = useCart();
  const navigate = useNavigate();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const nav = useMemo(() => buildNav(), []);
  const searchPlaceholder = searchPlaceholders[placeholderIndex];

  useEffect(() => {
    if (!searchOpen || searchTerm) return;
    const interval = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % searchPlaceholders.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [searchOpen, searchTerm]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Aaradhya Beads home">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#211d33] font-heading text-xl font-black tracking-tight text-[#f6e8ce] shadow-sm">
            जपं
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-heading text-2xl font-black text-[#211d33]">Aaradhya</span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#8d4b25]">Beads</span>
          </span>
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
          <form
            onSubmit={submitSearch}
            className="search__form container-pad block p-0"
            role="search"
          >
            <input type="hidden" name="options[prefix]" value="last" />
            <div className="relative mx-auto max-w-4xl">
              <button
                className="search__submit absolute left-4 top-1/2 z-10 -translate-y-1/2 text-current focus:outline-none"
                aria-label="Search"
              >
                <Search size={21} />
              </button>
              <input
                ref={searchInputRef}
                type="search"
                className="search__input js-search-input w-full rounded-none border-0 border-b-2 border-[#211d33] bg-transparent py-4 pl-14 pr-12 text-lg font-semibold outline-none placeholder:text-[#211d33]/45 focus:border-rudra md:text-2xl"
                id="header-search"
                name="q"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={searchPlaceholder}
                data-placeholder-one="Search for Rudraksha"
                data-placeholder-two="Search for Karungali"
                data-placeholder-three="Search for Pyrite"
                data-placeholder-prompts-mob="true"
                data-typing-speed="100"
                data-deleting-speed="60"
                data-delay-after-deleting="500"
                data-delay-before-first-delete="2000"
                data-delay-after-word-typed="2400"
                role="combobox"
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls="predictive-search-results"
                aria-owns="predictive-search-results"
                aria-haspopup="listbox"
                aria-expanded="false"
                spellCheck="false"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search__reset js-search-reset absolute right-4 top-1/2 -translate-y-1/2 text-current focus:outline-none"
                  onClick={() => {
                    setSearchTerm("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Reset search"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              )}
            </div>
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
