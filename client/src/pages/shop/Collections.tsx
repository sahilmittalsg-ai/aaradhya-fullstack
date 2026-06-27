import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductCard } from "../../components/ProductCard";
import { useLiveProducts } from "../../hooks/useLiveProducts";
import type { Product } from "../../types";

const priceBands: Array<{ label: string; value: string; test: (price: number) => boolean }> = [
  { label: "All prices", value: "all", test: () => true },
  { label: "Under Rs.500", value: "under-500", test: (price: number) => price < 500 },
  { label: "Rs.500 - Rs.899", value: "500-899", test: (price: number) => price >= 500 && price <= 899 },
  { label: "Rs.900 - Rs.1499", value: "900-1499", test: (price: number) => price >= 900 && price <= 1499 },
  { label: "Rs.1500+", value: "1500-plus", test: (price: number) => price >= 1500 }
];
const PRODUCTS_PAGE_SIZE = 24;

export function Collections() {
  const [params, setParams] = useSearchParams();
  const products = useLiveProducts();
  const [purpose, setPurpose] = useState("All");
  const [bead, setBead] = useState("All");
  const [mukhi, setMukhi] = useState("All");
  const [plating, setPlating] = useState("All");
  const [audience, setAudience] = useState("All");
  const [priceBand, setPriceBand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PAGE_SIZE);
  const active = params.get("collection") || "All";
  const searchParam = (params.get("search") || "").trim();
  const purposeParam = params.get("purpose") || "All";
  const beadParam = params.get("bead") || "All";
  const mukhiParam = params.get("mukhi") || "All";
  const platingParam = params.get("plating") || "All";
  const audienceParam = params.get("audience") || "All";
  const priceParam = params.get("price") || "all";
  const minPriceParam = params.get("minPrice") || "";
  const maxPriceParam = params.get("maxPrice") || "";
  const inStockParam = params.get("inStock") === "true";

  useEffect(() => {
    setPurpose(purposeParam);
    setBead(beadParam);
    setMukhi(mukhiParam);
    setPlating(platingParam);
    setAudience(audienceParam);
    setPriceBand(priceParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setInStockOnly(inStockParam);
    setSearchText(searchParam);
  }, [audienceParam, beadParam, inStockParam, maxPriceParam, minPriceParam, mukhiParam, platingParam, priceParam, purposeParam, searchParam]);

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [filtersOpen]);

  const purposeOptions = useMemo(() => uniqueOptions(products.flatMap((product) => product.purpose || [])), [products]);
  const beadOptions = useMemo(() => uniqueOptions(products.map((product) => product.bead)), [products]);
  const mukhiOptions = useMemo(() => uniqueOptions(products.map((product) => product.mukhi)), [products]);
  const platingOptions = useMemo(() => uniqueOptions(products.map((product) => product.plating)), [products]);
  const audienceOptions = useMemo(() => uniqueOptions(products.map((product) => product.audience)), [products]);
  const categoryOptions = useMemo(
    () => uniqueOptions(products.flatMap((product) => [product.category, product.collection])),
    [products]
  );

  const filtered = useMemo(() => {
    const selectedBand = priceBands.find((band) => band.value === priceBand) || priceBands[0];
    const minPriceValue = minPrice ? Number(minPrice) : undefined;
    const maxPriceValue = maxPrice ? Number(maxPrice) : undefined;
    const result = products.filter((product) => {
      const matchesCollection =
        active === "All" || product.collection === active || product.category === active || product.tags.includes(active.toLowerCase());
      const matchesPurpose = purpose === "All" || product.purpose?.includes(purpose);
      const matchesBead = bead === "All" || product.bead === bead;
      const matchesMukhi = mukhi === "All" || product.mukhi === mukhi;
      const matchesPlating = plating === "All" || product.plating === plating;
      const matchesAudience = audience === "All" || product.audience === audience;
      const matchesSearch = !searchParam || productSearchText(product).includes(searchParam.toLowerCase());
      const matchesMinPrice = minPriceValue === undefined || !Number.isFinite(minPriceValue) || product.price >= minPriceValue;
      const matchesMaxPrice = maxPriceValue === undefined || !Number.isFinite(maxPriceValue) || product.price <= maxPriceValue;
      const matchesStock = !inStockOnly || Number(product.stock || 0) > 0;
      return matchesCollection && matchesPurpose && matchesBead && matchesMukhi && matchesPlating && matchesAudience && matchesSearch && selectedBand.test(product.price) && matchesMinPrice && matchesMaxPrice && matchesStock;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.title.localeCompare(b.title);
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
  }, [active, audience, bead, inStockOnly, maxPrice, minPrice, mukhi, plating, priceBand, products, purpose, searchParam, sort]);
  const visibleProducts = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PAGE_SIZE);
  }, [active, audience, bead, inStockOnly, maxPrice, minPrice, mukhi, plating, priceBand, purpose, searchParam, sort, view]);

  const hasFilters =
    active !== "All" ||
    Boolean(searchParam) ||
    purpose !== "All" ||
    bead !== "All" ||
    mukhi !== "All" ||
    plating !== "All" ||
    audience !== "All" ||
    priceBand !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStockOnly;

  const activeFilters = [
    active !== "All" ? { key: "collection", label: `Product Type: ${active}` } : undefined,
    searchParam ? { key: "search", label: `Search: ${searchParam}` } : undefined,
    purpose !== "All" ? { key: "purpose", label: `Purpose: ${purpose}` } : undefined,
    bead !== "All" ? { key: "bead", label: `Bead: ${bead}` } : undefined,
    mukhi !== "All" ? { key: "mukhi", label: `Mukhi: ${mukhi}` } : undefined,
    plating !== "All" ? { key: "plating", label: `Plating: ${plating}` } : undefined,
    audience !== "All" ? { key: "audience", label: `For: ${audience}` } : undefined,
    priceBand !== "all" ? { key: "price", label: priceBands.find((band) => band.value === priceBand)?.label || "Price filter" } : undefined,
    minPrice ? { key: "minPrice", label: `Min Rs.${minPrice}` } : undefined,
    maxPrice ? { key: "maxPrice", label: `Max Rs.${maxPrice}` } : undefined,
    inStockOnly ? { key: "inStock", label: "In stock" } : undefined
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  function clearFilters() {
    setPurpose("All");
    setBead("All");
    setMukhi("All");
    setPlating("All");
    setAudience("All");
    setPriceBand("all");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSearchText("");
    const nextParams = new URLSearchParams(params);
    ["collection", "search", "purpose", "bead", "mukhi", "plating", "audience", "price", "minPrice", "maxPrice", "inStock"].forEach((key) => nextParams.delete(key));
    setParams(nextParams);
  }

  function setFilterParam(key: string, value: string, emptyValue = "All") {
    const nextParams = new URLSearchParams(params);
    value === emptyValue ? nextParams.delete(key) : nextParams.set(key, value);
    setParams(nextParams);
  }

  function clearFilter(key: string) {
    const nextParams = new URLSearchParams(params);
    nextParams.delete(key);
    setParams(nextParams);
  }

  function setOptionalParam(key: string, value: string) {
    const nextParams = new URLSearchParams(params);
    const cleanValue = value.trim();
    cleanValue ? nextParams.set(key, cleanValue) : nextParams.delete(key);
    setParams(nextParams);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextParams = new URLSearchParams(params);
    const query = searchText.trim();
    query ? nextParams.set("search", query) : nextParams.delete("search");
    setParams(nextParams);
  }

  return (
    <section className="container-pad py-10">
      <div className="rounded-lg bg-sandal px-5 py-8 md:px-8">
        <p className="eyebrow-text text-xs text-saffron">Rudraksha Collection</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold md:text-5xl">Sacred accessories for everyday devotion</h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink/65">
              Browse bracelets, malas, single beads, necklaces, and crystal bands with purpose-led filters inspired by
              premium spiritual commerce stores.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink/60">
            <SlidersHorizontal size={18} />
            {filtered.length} of {products.length} items
          </div>
        </div>
        {searchParam && (
          <p className="mt-5 rounded-md bg-white/70 px-4 py-3 text-sm font-bold text-ink/65">
            Search results for "{searchParam}"
          </p>
        )}
      </div>

      <div className="my-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="product-filters"
          className={`inline-flex items-center gap-2 rounded-md border px-5 py-3 text-sm font-bold transition ${
            filtersOpen ? "border-ink bg-ink text-white" : "border-rudra/15 bg-white text-ink hover:border-rudra/40"
          }`}
        >
          <SlidersHorizontal size={17} />
          Filters
          {activeFilters.length > 0 && (
            <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] ${filtersOpen ? "bg-white text-ink" : "bg-ink text-white"}`}>
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      <div>
        {filtersOpen && (
        <div
          className="fixed inset-0 z-[80] flex justify-end bg-black/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-filters-title"
          onClick={() => setFiltersOpen(false)}
        >
        <aside
          id="product-filters"
          className="flex h-[100dvh] w-full max-w-sm flex-col overflow-hidden border-l border-rudra/10 bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-rudra/10 px-5 py-4 sm:px-6">
            <h2 id="product-filters-title" className="text-xl font-semibold">Filters</h2>
            <div className="flex items-center gap-3">
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs font-bold text-rudra">
                  Clear all
                </button>
              )}
              <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-full p-1 text-ink/55 transition hover:bg-sandal hover:text-ink" aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 touch-pan-y overflow-y-scroll overscroll-contain px-5 pb-6 sm:px-6 [scrollbar-gutter:stable]">
          {activeFilters.length > 0 && (
            <div className="mt-5 border-t border-rudra/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rudra/60">{activeFilters.length} Applied Filter{activeFilters.length > 1 ? "s" : ""}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => clearFilter(filter.key)}
                    className="inline-flex items-center gap-1 rounded-full bg-sandal px-3 py-1.5 text-xs font-bold text-rudra"
                  >
                    <X size={13} /> {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <FilterGroup
            label="Product Type"
            options={categoryOptions}
            active={active === "All" ? "" : active}
            onSelect={(value) => {
              const nextParams = new URLSearchParams(params);
              active === value ? nextParams.delete("collection") : nextParams.set("collection", value);
              setParams(nextParams);
            }}
            getCount={(value) => countProducts(products, (product) => product.collection === value || product.category === value)}
          />
          <FilterGroup
            label="Purpose"
            options={purposeOptions}
            active={purpose === "All" ? "" : purpose}
            onSelect={(value) => {
              setPurpose(purpose === value ? "All" : value);
              setFilterParam("purpose", purpose === value ? "All" : value);
            }}
            getCount={(value) => countProducts(products, (product) => product.purpose?.includes(value))}
          />
          <PriceFilters
            priceBand={priceBand}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceBandChange={(value) => {
              setPriceBand(value);
              setFilterParam("price", value, "all");
            }}
            onMinPriceChange={(value) => {
              setMinPrice(value);
              setOptionalParam("minPrice", value);
            }}
            onMaxPriceChange={(value) => {
              setMaxPrice(value);
              setOptionalParam("maxPrice", value);
            }}
          />
          <FilterGroup
            label="Bead"
            options={beadOptions}
            active={bead === "All" ? "" : bead}
            onSelect={(value) => {
              setBead(bead === value ? "All" : value);
              setFilterParam("bead", bead === value ? "All" : value);
            }}
            getCount={(value) => countProducts(products, (product) => product.bead === value)}
          />
          <FilterGroup
            label="Mukhi"
            options={mukhiOptions}
            active={mukhi === "All" ? "" : mukhi}
            onSelect={(value) => {
              setMukhi(mukhi === value ? "All" : value);
              setFilterParam("mukhi", mukhi === value ? "All" : value);
            }}
            getCount={(value) => countProducts(products, (product) => product.mukhi === value)}
          />
          <FilterGroup
            label="Plating"
            options={platingOptions}
            active={plating === "All" ? "" : plating}
            onSelect={(value) => {
              setPlating(plating === value ? "All" : value);
              setFilterParam("plating", plating === value ? "All" : value);
            }}
            getCount={(value) => countProducts(products, (product) => product.plating === value)}
          />
          <FilterGroup
            label="For"
            options={audienceOptions}
            active={audience === "All" ? "" : audience}
            onSelect={(value) => {
              setAudience(audience === value ? "All" : value);
              setFilterParam("audience", audience === value ? "All" : value);
            }}
            getCount={(value) => countProducts(products, (product) => product.audience === value)}
          />
          <div className="mt-5 border-t border-rudra/10 pt-5">
            <button
              type="button"
              onClick={() => {
                const nextValue = !inStockOnly;
                setInStockOnly(nextValue);
                const nextParams = new URLSearchParams(params);
                nextValue ? nextParams.set("inStock", "true") : nextParams.delete("inStock");
                setParams(nextParams);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-2 text-left text-sm font-bold hover:bg-sandal"
            >
              <span className="inline-flex items-center gap-3">
                <span className={`flex h-4 w-4 items-center justify-center rounded border ${inStockOnly ? "border-rudra bg-rudra" : "border-rudra/30 bg-white"}`}>
                  {inStockOnly && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                In stock only
              </span>
              <span className="text-xs text-ink/45">({countProducts(products, (product) => Number(product.stock || 0) > 0)})</span>
            </button>
          </div>
          </div>

          <div className="shrink-0 border-t border-rudra/10 bg-white p-4 sm:px-6">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="btn-primary w-full"
            >
              Apply Filters · Show {filtered.length} Products
            </button>
          </div>
        </aside>
        </div>
        )}

        <div>
          <div className="mb-5 flex flex-col justify-between gap-3 rounded-lg border border-rudra/10 bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-heading text-lg font-semibold">{active === "All" ? "All products" : active}</p>
              <p className="text-sm text-ink/55">
                {searchParam ? "Showing products matching your search" : hasFilters ? "Filtered by selected spiritual details" : "Showing featured and latest products"}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <form onSubmit={submitSearch} className="flex w-full min-w-0 overflow-hidden rounded-md border border-[#dedbd5] bg-white sm:w-auto">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Search products</span>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/45" size={16} />
                  <input
                    className="w-full min-w-0 px-9 py-2 text-sm outline-none sm:min-w-48"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search products"
                  />
                </label>
                {searchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText("");
                      const nextParams = new URLSearchParams(params);
                      nextParams.delete("search");
                      setParams(nextParams);
                    }}
                    className="px-2 text-ink/45 hover:text-ink"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
                <button className="bg-ink px-4 text-sm font-black text-white">Go</button>
              </form>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="input min-w-0 flex-1 py-2 sm:min-w-44 sm:flex-none">
                <option value="featured">Featured first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="name">Name A-Z</option>
              </select>
              <button
                onClick={() => setView("grid")}
                className={`rounded-md border p-2 ${view === "grid" ? "border-rudra bg-sandal text-rudra" : "border-rudra/10 bg-white"}`}
                aria-label="Grid view"
              >
                <Grid2X2 size={18} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`rounded-md border p-2 ${view === "list" ? "border-rudra bg-sandal text-rudra" : "border-rudra/10 bg-white"}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-rudra/10 bg-white p-8 text-center">
              <h2 className="text-2xl font-semibold">No products found</h2>
              <p className="mt-2 text-ink/55">Try another search, remove one filter, or choose another collection.</p>
              <button onClick={clearFilters} className="btn-primary mt-5">
                Reset filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {visibleProducts.map((product) => (
                <ProductListItem key={product.slug} product={product} />
              ))}
            </div>
          )}
          {visibleProducts.length < filtered.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PRODUCTS_PAGE_SIZE)}
                className="btn-secondary"
              >
                Show More Products
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductListItem({ product }: { product: Product }) {
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <article className="grid gap-4 rounded-lg border border-rudra/10 bg-white p-4 shadow-sm sm:grid-cols-[180px_1fr]">
      <Link to={`/products/${product.slug}`} className="block overflow-hidden rounded-md bg-sandal">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="aspect-square h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sandal px-3 py-1 text-xs font-bold text-rudra">{product.collection}</span>
            {product.mukhi && <span className="rounded-full bg-sandal px-3 py-1 text-xs font-bold text-rudra">{product.mukhi}</span>}
            {discountPercent > 0 && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{discountPercent}% OFF</span>}
          </div>
          <Link to={`/products/${product.slug}`} className="product-title mt-3 block text-xl font-semibold hover:text-rudra">
            {product.title}
          </Link>
          <p className="mt-2 text-sm leading-6 text-ink/60">{product.subtitle}</p>
          <p className="mt-3 text-sm text-ink/55">
            {(product.purpose || []).join(" • ")} {product.bead ? `| ${product.bead}` : ""} {product.plating ? `| ${product.plating}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-rudra/60">After Discount</p>
            <p className="font-heading text-2xl font-semibold tracking-wide text-rudra">Rs.{product.price}</p>
          </div>
          <Link to={`/products/${product.slug}`} className="btn-secondary py-2">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function FilterGroup({
  label,
  options,
  active,
  onSelect,
  getCount
}: {
  label: string;
  options: string[];
  active: string;
  onSelect: (value: string) => void;
  getCount: (value: string) => number;
}) {
  return (
    <details open className="mt-5 border-t border-rudra/10 pt-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-rudra/60">
        {label}
        <span className="text-base leading-none text-rudra/45">v</span>
      </summary>
      <div className="mt-3 grid gap-1">
        {options.map((option) => {
          const selected = active === option;
          const count = getCount(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`flex w-full items-center justify-between gap-3 rounded-md px-1 py-2 text-left text-sm transition ${
                selected ? "bg-sandal font-black text-rudra" : "font-semibold text-ink hover:bg-sandal"
              }`}
            >
              <span className="inline-flex min-w-0 items-center gap-3">
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? "border-rudra bg-rudra" : "border-rudra/30 bg-white"}`}>
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className="truncate">{option}</span>
              </span>
              <span className="shrink-0 text-xs text-ink/45">({count})</span>
            </button>
          );
        })}
      </div>
    </details>
  );
}

function PriceFilters({
  priceBand,
  minPrice,
  maxPrice,
  onPriceBandChange,
  onMinPriceChange,
  onMaxPriceChange
}: {
  priceBand: string;
  minPrice: string;
  maxPrice: string;
  onPriceBandChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}) {
  return (
    <details open className="mt-5 border-t border-rudra/10 pt-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-rudra/60">
        Price
        <span className="text-base leading-none text-rudra/45">v</span>
      </summary>
      <div className="mt-3 grid gap-2">
        {priceBands.map((band) => (
          <button
            key={band.value}
            type="button"
            onClick={() => onPriceBandChange(band.value)}
            className={`flex w-full items-center gap-3 rounded-md px-1 py-2 text-left text-sm transition ${
              priceBand === band.value ? "bg-sandal font-black text-rudra" : "font-semibold text-ink hover:bg-sandal"
            }`}
          >
            <span className={`flex h-4 w-4 items-center justify-center rounded border ${priceBand === band.value ? "border-rudra bg-rudra" : "border-rudra/30 bg-white"}`}>
              {priceBand === band.value && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            {band.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <label>
          <span className="sr-only">Minimum price</span>
          <input
            type="number"
            min="0"
            step="10"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            className="input h-10"
            placeholder="From"
          />
        </label>
        <span className="text-ink/35">-</span>
        <label>
          <span className="sr-only">Maximum price</span>
          <input
            type="number"
            min="0"
            step="10"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            className="input h-10"
            placeholder="To"
          />
        </label>
      </div>
    </details>
  );
}

function uniqueOptions(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

function productSearchText(product: Product) {
  return [
    product.title,
    product.subtitle,
    product.description,
    product.category,
    product.collection,
    product.bead,
    product.mukhi,
    product.plating,
    product.audience,
    ...(product.tags || []),
    ...(product.purpose || []),
    ...(product.benefits || []),
    ...(product.materials || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function countProducts(products: Product[], predicate: (product: Product) => boolean | undefined) {
  return products.filter((product) => Boolean(predicate(product))).length;
}
