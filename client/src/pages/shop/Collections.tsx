import { Grid2X2, List, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductCard } from "../../components/ProductCard";
import { getProducts } from "../../lib/api";
import type { Product } from "../../types";

const priceBands: Array<{ label: string; value: string; test: (price: number) => boolean }> = [
  { label: "All prices", value: "all", test: () => true },
  { label: "Under Rs.500", value: "under-500", test: (price: number) => price < 500 },
  { label: "Rs.500 - Rs.899", value: "500-899", test: (price: number) => price >= 500 && price <= 899 },
  { label: "Rs.900 - Rs.1499", value: "900-1499", test: (price: number) => price >= 900 && price <= 1499 },
  { label: "Rs.1500+", value: "1500-plus", test: (price: number) => price >= 1500 }
];

export function Collections() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [purpose, setPurpose] = useState("All");
  const [bead, setBead] = useState("All");
  const [mukhi, setMukhi] = useState("All");
  const [plating, setPlating] = useState("All");
  const [audience, setAudience] = useState("All");
  const [priceBand, setPriceBand] = useState("all");
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const active = params.get("collection") || "All";
  const purposeParam = params.get("purpose") || "All";

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    setPurpose(purposeParam);
  }, [purposeParam]);

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
    const result = products.filter((product) => {
      const matchesCollection =
        active === "All" || product.collection === active || product.category === active || product.tags.includes(active.toLowerCase());
      const matchesPurpose = purpose === "All" || product.purpose?.includes(purpose);
      const matchesBead = bead === "All" || product.bead === bead;
      const matchesMukhi = mukhi === "All" || product.mukhi === mukhi;
      const matchesPlating = plating === "All" || product.plating === plating;
      const matchesAudience = audience === "All" || product.audience === audience;
      return matchesCollection && matchesPurpose && matchesBead && matchesMukhi && matchesPlating && matchesAudience && selectedBand.test(product.price);
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.title.localeCompare(b.title);
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
  }, [active, audience, bead, mukhi, plating, priceBand, products, purpose, sort]);

  const hasFilters =
    purpose !== "All" || bead !== "All" || mukhi !== "All" || plating !== "All" || audience !== "All" || priceBand !== "all";

  function clearFilters() {
    setPurpose("All");
    setBead("All");
    setMukhi("All");
    setPlating("All");
    setAudience("All");
    setPriceBand("all");
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
      </div>

      <div className="my-8 flex flex-wrap gap-2">
        {["All", ...categoryOptions].map((category) => (
          <button
            key={category}
            onClick={() => {
              clearFilters();
              category === "All" ? setParams({}) : setParams({ collection: category });
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              active === category ? "bg-ink text-white" : "border border-rudra/10 bg-white text-ink hover:border-rudra/40"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-max rounded-lg border border-rudra/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Filters</h2>
            {hasFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-bold text-rudra">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <div className="mt-5 border-t border-rudra/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rudra/60">Purpose</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["All", ...purposeOptions].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setPurpose(option);
                    option === "All" ? params.delete("purpose") : params.set("purpose", option);
                    setParams(params);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    purpose === option ? "bg-rudra text-white" : "bg-sandal text-rudra"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <FilterSelect label="Price" value={priceBand} options={priceBands.map(({ label, value }) => ({ label, value }))} onChange={setPriceBand} />
          <FilterSelect label="Bead Type" value={bead} options={withAll(beadOptions)} onChange={setBead} />
          <FilterSelect label="Mukhi" value={mukhi} options={withAll(mukhiOptions)} onChange={setMukhi} />
          <FilterSelect label="Plating" value={plating} options={withAll(platingOptions)} onChange={setPlating} />
          <FilterSelect label="For" value={audience} options={withAll(audienceOptions)} onChange={setAudience} />
        </aside>

        <div>
          <div className="mb-5 flex flex-col justify-between gap-3 rounded-lg border border-rudra/10 bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-heading text-lg font-semibold">{active === "All" ? "All products" : active}</p>
              <p className="text-sm text-ink/55">
                {hasFilters ? "Filtered by selected spiritual details" : "Showing featured and latest products"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="input min-w-44 py-2">
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
              <p className="mt-2 text-ink/55">Try removing one filter or choose another collection.</p>
              <button onClick={clearFilters} className="btn-primary mt-5">
                Reset filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((product) => (
                <ProductListItem key={product.slug} product={product} />
              ))}
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

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-5 block border-t border-rudra/10 pt-5">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-rudra/60">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input mt-3">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function uniqueOptions(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

function withAll(options: string[]) {
  return [{ label: "All", value: "All" }, ...options.map((option) => ({ label: option, value: option }))];
}
