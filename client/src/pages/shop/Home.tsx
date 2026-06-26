import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clover,
  Flame,
  Heart,
  HeartPulse,
  IndianRupee,
  Scale,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CategoryStrip } from "../../components/CategoryStrip";
import { HeroCarousel } from "../../components/HeroCarousel";
import { LatestTrendingCarousel } from "../../components/latest-trending/LatestTrendingCarousel";
import { ProductCard } from "../../components/ProductCard";
import { TraditionGallery } from "../../components/TraditionGallery";
import { getProducts } from "../../lib/api";
import type { Product } from "../../types";

const purposeIcons: Record<string, LucideIcon> = {
  All: Star,
  Wealth: IndianRupee,
  Health: HeartPulse,
  Love: Heart,
  Luck: Clover,
  Protection: ShieldCheck,
  Peace: Sparkles,
  Courage: Flame,
  Balance: Scale
};

const defaultCategoryOptions = [
  { name: "Rudraksha", image: "/assets/categories/rudraksha.png" },
  { name: "Karungali", image: "/assets/categories/karungali.png" },
  { name: "Pyrite", image: "/assets/categories/pyrite.png" },
  { name: "Sandalwood", image: "/assets/categories/sandalwood.png" },
  { name: "Sphatik", image: "/assets/categories/sphatik.png" },
  { name: "Tiger Eye", image: "/assets/categories/tiger-eye.png" },
  { name: "Rose Quartz", image: "/assets/categories/rose-quartz.png" },
  { name: "Amethyst", image: "/assets/categories/amethyst.png" }
];

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedPurpose, setSelectedPurpose] = useState("All");

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const categoryOptions = defaultCategoryOptions;
  const collectionOptions = useMemo(() => buildFilterOptions(products, "collection"), [products]);
  const purposeOptions = useMemo(
    () => ["All", ...Array.from(new Set(products.flatMap((product) => product.purpose || []))).sort((a, b) => a.localeCompare(b))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const categoryProducts =
      selectedCategory === "All"
        ? products
        : products.filter((product) => productMatchesOption(product, selectedCategory));
    const collectionProducts =
      selectedCollection === "All"
        ? categoryProducts
        : categoryProducts.filter((product) => productMatchesOption(product, selectedCollection));

    return selectedPurpose === "All"
      ? collectionProducts
      : collectionProducts.filter((product) => product.purpose?.includes(selectedPurpose));
  }, [products, selectedCategory, selectedCollection, selectedPurpose]);
  const productHeading =
    selectedPurpose !== "All"
      ? `Shop ${selectedPurpose} Products`
      : selectedCategory === "All"
        ? selectedCollection === "All"
          ? "All Products"
          : `${selectedCollection} Products`
        : `${selectedCategory} Products`;
  const homeProducts = filteredProducts.slice(0, 8);

  return (
    <div className="bg-[#fbf2e3] text-[#17172a]">
      <CategoryStrip selectedCategory={selectedCategory} onSelect={setSelectedCategory} categories={categoryOptions} />
      <HeroCarousel />
      <TraditionGallery />

      <CollectionCarousel selectedCategory={selectedCollection} onSelect={setSelectedCollection} categories={collectionOptions} />
      <LabTestedShowcase />
      <PurposeSection selectedPurpose={selectedPurpose} onSelect={setSelectedPurpose} purposes={purposeOptions} />
      <ComboDealsSection products={products} />
      <LatestTrendingCarousel />
      <StyleShowcase />
      <HappyCustomers />

      <section className="container-pad py-12 lg:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d4b25]">Shop customer favorites</p>
            <h2 className="mt-2 font-heading text-4xl font-bold">{productHeading}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17172a]/70">
            <Star size={16} fill="#d69b34" className="text-[#d69b34]" />
            {filteredProducts.length} products available
          </div>
        </div>

        <div className="grid gap-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {homeProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
            <Link
              to="/collections"
              className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-rudra/30 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-rudra hover:shadow-soft"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sandal text-rudra">
                <ArrowUpRight size={24} />
              </span>
              <h3 className="mt-5 font-heading text-2xl font-bold">View All Products</h3>
              <p className="mt-3 max-w-56 text-sm leading-6 text-ink/55">
                Open the full shop with filters for category, purpose, bead type, price, and more.
              </p>
              <span className="btn-primary mt-6">Shop All</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const labMarkers = [
  {
    label: "Shop Energy Stones",
    href: "/collections?collection=Energy%20Stones",
    className: "left-[28%] top-[72%]"
  },
  {
    label: "Shop Karungali",
    href: "/collections?collection=Karungali",
    className: "left-[60%] top-[43%]"
  },
  {
    label: "Shop Rudraksha",
    href: "/collections?collection=Rudraksha",
    className: "left-[75%] top-[68%]"
  }
];

const LabTestedShowcase = memo(function LabTestedShowcase() {
  return (
    <section className="bg-[#fbf2e3] py-10 md:py-14">
      <div className="container-pad">
        <div className="mx-auto max-w-6xl overflow-hidden bg-[#f6e8ce]">
          <div className="px-6 py-9 md:px-10">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Asli Wearables - Lab Tested</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#17172a]">
              We follow a careful batch-check process so you always get original, genuine beads and stones with
              trusted product details.
            </p>
          </div>

          <div className="relative h-[420px] overflow-hidden bg-[#d9b86c] md:h-[680px]">
            <img
              src="/assets/products/hero-spiritual-shop.png"
              alt="Lab tested spiritual wearables and gift-ready products"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-right"
            />
            <span className="absolute inset-0 bg-[#f1d99d]/15" />
            {labMarkers.map((marker) => (
              <Link
                key={marker.label}
                to={marker.href}
                aria-label={marker.label}
                title={marker.label}
                className={`absolute ${marker.className} flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-2xl font-light leading-none text-white shadow-lg ring-2 ring-white/40 transition hover:scale-110 hover:bg-rudra`}
              >
                +
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const ComboDealsSection = memo(function ComboDealsSection({ products }: { products: Product[] }) {
  const combos = products
    .filter((product) => product.collection === "Combos" || product.category === "Combos" || product.title.toLowerCase().includes("combo"))
    .slice(0, 5);

  if (!combos.length) return null;

  return (
    <section className="bg-[#fbf2e3] py-12">
      <div className="container-pad">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Save More With Combos</h2>
          <Link to="/collections?collection=Combos" className="text-sm font-semibold underline underline-offset-4 hover:text-rudra">
            View all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {combos.map((product) => {
            const discountPercent = product.compareAtPrice
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : 0;

            return (
              <Link key={product.slug} to={`/products/${product.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-md bg-white shadow-sm">
                  {discountPercent > 0 && (
                    <span className="absolute left-0 top-0 z-10 bg-[#cf3f3f] px-3 py-1 text-xs font-black text-white">
                      {discountPercent}% off
                    </span>
                  )}
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 line-clamp-2 min-h-11 text-sm font-black leading-6 text-[#17172a] group-hover:text-rudra">
                  {product.title}
                </h3>
                <div className="mt-2 flex items-center gap-0.5 text-[#cf3f3f]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                  <span className="ml-2 text-xs font-medium text-[#17172a]/60">({Math.round(product.rating * 70)})</span>
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <span className="font-heading text-xl font-bold text-[#211d33]">Rs.{product.price}</span>
                  {product.compareAtPrice > product.price && (
                    <span className="pb-0.5 text-sm font-medium text-[#17172a]/45 line-through">Rs.{product.compareAtPrice}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 h-px bg-gradient-to-r from-[#211d33] via-[#211d33]/50 to-transparent" />
      </div>
    </section>
  );
});

const styleTiles = [
  {
    title: "Everyday Wearables",
    cta: "Shop Bracelets",
    href: "/collections?collection=Rudraksha%20Bracelets",
    image: "/assets/tradition/tradition-wide-1.jpg"
  },
  {
    title: "Elegance Rudraksha Range",
    cta: "Shop Women",
    href: "/collections?collection=Spiritual%20Jewellery",
    image: "/assets/banners/spiritual-jewellery.jpg"
  },
  {
    title: "Premium Designs",
    cta: "Shop Premium",
    href: "/collections?collection=Rudraksha%20Bracelets",
    image: "/assets/products/hero-spiritual-shop.png"
  },
  {
    title: "Wear With Pride",
    cta: "Shop Malas",
    href: "/collections?collection=Rudraksha%20Malas",
    image: "/assets/tradition/tradition-wide-2.jpg"
  }
];

const customerReviews = [
  {
    name: "Shubham Chavan",
    title: "Best Product",
    text: "Authentic and genuine product. Value for money and beautifully packed.",
    image: "/assets/products/pyrite-tiger-eye.png",
    href: "/products/pyrite-money-magnet-bracelet"
  },
  {
    name: "Manish Kumar",
    title: "Absolutely Amazing",
    text: "Loved the finish, delivery, and product quality.",
    image: "/assets/products/hero-spiritual-shop.png",
    href: "/products/gold-plated-modern-rudraksha-bracelet"
  },
  {
    name: "Chandrashekhar Yadav",
    title: "Good Product",
    text: "Comfortable for daily wear and looks premium.",
    image: "/assets/products/meditation-mala.png",
    href: "/products/brown-rudraksha-mala-108-1-beads"
  }
];

const StyleShowcase = memo(function StyleShowcase() {
  return (
    <section className="bg-[#fbf2e3] py-12">
      <div className="container-pad">
        <h2 className="font-heading text-3xl font-bold">Choose Your Style</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {styleTiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.href}
              className="group relative min-h-[330px] overflow-hidden rounded-sm bg-[#211d33] shadow-sm md:min-h-[430px]"
              aria-label={`${tile.cta} from ${tile.title}`}
            >
              <img
                src={tile.image}
                alt={tile.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-black/5" />
              <span className="absolute bottom-16 left-7 right-7 text-2xl font-black text-white md:left-8">
                {tile.title}
              </span>
              <span className="absolute bottom-8 left-7 rounded-md border border-white/90 px-7 py-3 text-xs font-black uppercase tracking-[0.04em] text-white transition group-hover:bg-white group-hover:text-[#211d33] md:left-8">
                {tile.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});

const HappyCustomers = memo(function HappyCustomers() {
  return (
    <section className="bg-[#fbf2e3] py-12">
      <div className="container-pad">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">Over 1 Million+ Happy Customers</h2>
          <p className="mt-2 text-sm font-medium text-[#17172a]/70">with thousands of 5-star reviews</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {customerReviews.map((review) => (
            <Link
              key={review.name}
              to={review.href}
              className="group overflow-hidden rounded-md bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={review.image}
                alt={`${review.name} reviewed product`}
                loading="lazy"
                decoding="async"
                className="h-64 w-full bg-sandal object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="px-6 py-8 text-center">
                <div className="flex justify-center gap-1 text-[#cf3f3f]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={20} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <span className="font-medium text-[#363246]">{review.name}</span>
                  <span className="rounded-sm bg-[#211d33] px-2 py-1 text-[10px] font-black text-white">Verified</span>
                </div>
                <p className="mt-5 font-black text-[#363246]">{review.title}</p>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#363246]/80">{review.text}</p>
                <span className="mt-6 inline-flex rounded-md border border-rudra/20 px-4 py-2 text-xs font-black uppercase text-rudra transition group-hover:bg-rudra group-hover:text-white">
                  Shop This Product
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});

function CollectionCarousel({
  selectedCategory,
  onSelect,
  categories
}: {
  selectedCategory: string;
  onSelect: (category: string) => void;
  categories: Array<{ name: string; image: string }>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const options = [{ name: "All Products", value: "All", image: "/assets/home/rudraksha.png" }, ...categories.map((category) => ({ ...category, value: category.name }))];

  function scroll(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth"
    });
  }

  return (
    <section className="bg-[#fbf2e3] py-10 md:py-14">
      <div className="container-pad">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d4b25]">Browse by category</p>
            <h2 className="mt-2 font-heading text-3xl font-bold md:text-4xl">Shop Our Collections</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#211d33]/15 bg-white text-[#211d33] shadow-sm"
              aria-label="Scroll collections left"
            >
              <ChevronLeft size={21} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#211d33]/15 bg-white text-[#211d33] shadow-sm"
              aria-label="Scroll collections right"
            >
              <ChevronRight size={21} />
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-3 md:gap-8">
          {options.map((category) => {
            const active = selectedCategory === category.value;
            return (
              <Link
                key={category.value}
                to={category.value === "All" ? "/collections" : `/collections?collection=${encodeURIComponent(category.value)}`}
                onClick={() => onSelect(category.value)}
                className="group flex min-w-[136px] flex-col items-center gap-3 text-center md:min-w-[200px]"
              >
                <span
                  className={`flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 bg-[#f6e8ce] p-2 shadow-sm transition md:h-[180px] md:w-[180px] ${
                    active ? "border-[#211d33]" : "border-transparent"
                  }`}
                >
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                      src={category.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-110"
                    />
                  </span>
                </span>
                <span className="max-w-[130px] text-sm font-bold leading-5 text-[#17172a] md:max-w-[180px] md:text-base">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PurposeSection({
  selectedPurpose,
  onSelect,
  purposes
}: {
  selectedPurpose: string;
  onSelect: (purpose: string) => void;
  purposes: string[];
}) {
  return (
    <section className="bg-[#f6e8ce] py-12">
      <div className="container-pad">
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">Shop By Purpose</h2>
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-max justify-center gap-4">
            {purposes.map((purpose) => {
              const Icon = purposeIcons[purpose] || Sparkles;
              const active = selectedPurpose === purpose;

              return (
                <Link
                  key={purpose}
                  to={purpose === "All" ? "/collections" : `/collections?purpose=${encodeURIComponent(purpose)}`}
                  onClick={() => onSelect(purpose)}
                  className={`relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-md border-2 bg-gradient-to-b from-[#c8222c] to-[#17172a] p-4 text-left text-white shadow-sm transition hover:scale-105 ${
                    active ? "border-white ring-2 ring-[#211d33]" : "border-transparent"
                  }`}
                >
                  <Icon size={34} strokeWidth={1.8} className="text-white" />
                  <span className="absolute bottom-3 left-3 max-w-20 text-sm font-semibold leading-4">{purpose}</span>
                  <span className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/60">
                    <ArrowUpRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function buildFilterOptions(products: Product[], key: "category" | "collection") {
  const seen = new Set<string>();

  return products.reduce<Array<{ name: string; image: string }>>((options, product) => {
    const name = product[key];
    if (!name || seen.has(name)) return options;

    seen.add(name);
    options.push({
      name,
      image: product.images[0] || "/assets/products/rudraksha-bracelet.png"
    });
    return options;
  }, []);
}

function productMatchesOption(product: Product, option: string) {
  const normalizedOption = option.toLowerCase();
  return (
    product.category === option ||
    product.collection === option ||
    product.bead === option ||
    product.tags?.includes(normalizedOption)
  );
}
