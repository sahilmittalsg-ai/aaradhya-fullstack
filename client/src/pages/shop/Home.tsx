import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PackageSearch,
  RotateCcw,
  Truck,
  Star
} from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CategoryStrip } from "../../components/CategoryStrip";
import { HeroCarousel } from "../../components/HeroCarousel";
import { LatestTrendingCarousel } from "../../components/latest-trending/LatestTrendingCarousel";
import { ProductCard } from "../../components/ProductCard";
import { TraditionGallery } from "../../components/TraditionGallery";
import { useLiveProducts } from "../../hooks/useLiveProducts";
import type { Product } from "../../types";

const defaultCategoryOptions = [
  { name: "Rudraksha", image: "/assets/categories/rudraksha.png" },
  { name: "Karungali", image: "/assets/categories/karungali.png" },
  { name: "Pyrite", image: "/assets/categories/pyrite.png" },
  { name: "Sandalwood", image: "/assets/categories/sandalwood.png" },
  { name: "Sphatik", image: "/assets/categories/sphatik.png" },
  { name: "Tiger Eye", image: "/assets/categories/tiger-eye.png" },
  { name: "Rose Quartz", image: "/assets/categories/rose-quartz.png" },
  { name: "Amethyst", image: "/assets/categories/amethyst.png" },
  { name: "Combos", image: "/assets/products/hero-spiritual-shop.png" },
  { name: "Gift Hampers", image: "/assets/categories/gift-hampers.png" }
];

const collectionShowcaseOptions = [
  {
    name: "Rudraksha Bracelets",
    value: "Rudraksha Bracelets",
    href: "/collections?collection=Rudraksha%20Bracelets",
    image: "/assets/collections/rudraksha-bracelets.jpg"
  },
  {
    name: "Rudraksha Malas",
    value: "Rudraksha Malas",
    href: "/collections?collection=Rudraksha%20Malas",
    image: "/assets/collections/rudraksha-malas.jpg"
  },
  {
    name: "Nepali/Indian Rudraksha",
    value: "Rudraksha",
    href: "/collections?collection=Rudraksha",
    image: "/assets/collections/nepali-indian-rudraksha.jpg"
  },
  {
    name: "Spiritual Jewellery",
    value: "Spiritual Jewellery",
    href: "/collections?collection=Spiritual%20Jewellery",
    image: "/assets/collections/spiritual-jewellery.jpg"
  },
  {
    name: "Karungali Wearables",
    value: "Karungali",
    href: "/collections?collection=Karungali",
    image: "/assets/collections/karungali-wearables.jpg"
  },
  {
    name: "Energy Stones",
    value: "Energy Stones",
    href: "/collections?collection=Energy%20Stones",
    image: "/assets/collections/energy-stones.jpg"
  },
  {
    name: "Pyrite Wearables",
    value: "Pyrite",
    href: "/collections?bead=Pyrite",
    image: "/assets/collections/pyrite-wearables.jpg"
  },
  {
    name: "Combo Deals",
    value: "Combos",
    href: "/collections?collection=Combos",
    image: "/assets/products/hero-spiritual-shop.png"
  },
  {
    name: "Gift Hampers",
    value: "Gift Hampers",
    href: "/collections?collection=Gift%20Hampers",
    image: "/assets/categories/gift-hampers.png"
  }
];

const purposeShowcaseOptions = [
  { name: "Wealth", image: "/assets/purpose/wealth.jpg" },
  { name: "Health", image: "/assets/purpose/health.jpg" },
  { name: "Love", image: "/assets/purpose/love.jpg" },
  { name: "Luck", image: "/assets/purpose/luck.jpg" },
  { name: "Protection", image: "/assets/purpose/protection.jpg" },
  { name: "Peace", image: "/assets/purpose/peace.jpg" },
  { name: "Courage", image: "/assets/purpose/courage.jpg" },
  { name: "Balance", image: "/assets/purpose/balance.jpg" }
];

export function Home() {
  const products = useLiveProducts();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedPurpose, setSelectedPurpose] = useState("All");

  const categoryOptions = defaultCategoryOptions;

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
      <CollectionCarousel selectedCategory={selectedCollection} onSelect={setSelectedCollection} categories={collectionShowcaseOptions} />
      <LatestTrendingCarousel />
      <SingleRudrakshaSection products={products} />
      <PurposeSection selectedPurpose={selectedPurpose} onSelect={setSelectedPurpose} purposes={purposeShowcaseOptions} />
      <EnergyStonesSection products={products} />
      <BestsellersSection products={products} />
      <TraditionGallery />
      <LabTestedShowcase />
      <ComboDealsSection products={products} />
      <SiddhVideoSection />
      <StyleShowcase />
      <HappyCustomers />
      <ServiceHighlights />

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
    title: "BTR Card",
    description: "We send samples for lab testing and provide Batch Test Reports.",
    className: "left-[29%] top-[68%]",
    href: "/collections?collection=Energy%20Stones"
  },
  {
    title: "Quality Packaging",
    description: "We focus heavily on customer experience and delight.",
    className: "left-[60%] top-[32%]",
    href: "/collections?collection=Karungali"
  },
  {
    title: "Fit & Finish",
    description: "We put a lot of effort into ensuring our high quality standards.",
    className: "left-[74%] top-[64%]",
    href: "/collections?collection=Rudraksha"
  }
];

const BestsellersSection = memo(function BestsellersSection({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bestsellers = useMemo(() => {
    const featured = products.filter((product) => product.featured || product.rating >= 4.7);
    return (featured.length ? featured : products).slice(0, 10);
  }, [products]);

  if (!bestsellers.length) return null;

  function scroll(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth"
    });
  }

  return (
    <section className="bg-[#fbf2e3] py-10 md:py-12">
      <div className="container-pad">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Japam Bestsellers</h2>
          <div className="flex items-center gap-3">
            <Link to="/collections" className="text-sm font-semibold underline underline-offset-4 hover:text-rudra">
              View all
            </Link>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll bestsellers left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll bestsellers right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollerRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 md:gap-5">
          {bestsellers.map((product) => (
            <div key={product.slug} className="min-w-[calc(50vw-26px)] max-w-[220px] snap-start sm:min-w-[210px] lg:min-w-[220px] xl:min-w-[224px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

const EnergyStonesSection = memo(function EnergyStonesSection({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const energyProducts = useMemo(() => {
    const stoneTerms = ["Energy Stones", "Pyrite", "Tiger Eye", "Rose Quartz", "Amethyst", "Sphatik", "Citrine", "Aventurine"];
    const filtered = products.filter((product) =>
      stoneTerms.some((term) => productMatchesOption(product, term) || product.title.toLowerCase().includes(term.toLowerCase()))
    );
    return (filtered.length ? filtered : products).slice(0, 10);
  }, [products]);

  if (!energyProducts.length) return null;

  function scroll(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth"
    });
  }

  return (
    <section className="bg-[#fff7ec] py-10 md:py-12">
      <div className="container-pad">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Explore Energy Stones</h2>
          <div className="flex items-center gap-3">
            <Link to="/collections?collection=Energy%20Stones" className="text-sm font-semibold underline underline-offset-4 hover:text-rudra">
              View all
            </Link>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll energy stones left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll energy stones right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollerRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 md:gap-5">
          {energyProducts.map((product) => (
            <div key={product.slug} className="min-w-[calc(50vw-26px)] max-w-[220px] snap-start sm:min-w-[210px] lg:min-w-[220px] xl:min-w-[224px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

const SingleRudrakshaSection = memo(function SingleRudrakshaSection({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rudrakshaBeads = useMemo(() => {
    const filtered = products.filter((product) => {
      const tagText = product.tags?.join(" ").toLowerCase() || "";
      return (
        product.bead === "Rudraksha" &&
        (product.mukhi || tagText.includes("single bead") || tagText.includes("nepali rudraksha") || product.title.toLowerCase().includes("mukhi"))
      );
    });
    return (filtered.length ? filtered : products.filter((product) => product.bead === "Rudraksha")).slice(0, 10);
  }, [products]);

  if (!rudrakshaBeads.length) return null;

  function scroll(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth"
    });
  }

  return (
    <section className="bg-[#fbf2e3] py-10 md:py-12">
      <div className="container-pad">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Single Rudraksha Beads</h2>
          <Link to="/collections?collection=Rudraksha" className="text-sm font-semibold underline underline-offset-4 hover:text-rudra">
            View all
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Link
            to="/collections?collection=Rudraksha"
            className="group overflow-hidden bg-[#211d33] text-white shadow-sm"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src="/assets/featured/original-nepali-rudraksha.jpg"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex min-h-[155px] flex-col justify-between bg-[#211d33] p-6">
              <div>
                <h3 className="font-heading text-2xl font-bold">Original Nepali Rudraksha</h3>
                <p className="mt-3 text-sm leading-6 text-white/78">1 Mukhi to 11 Mukhi - with certificate</p>
              </div>
              <span className="mt-5 inline-flex text-sm font-black uppercase tracking-[0.06em] text-[#f6e8ce]">
                Shop certified beads
              </span>
            </div>
          </Link>

          <div className="relative min-w-0">
            <div className="mb-4 hidden justify-end gap-2 md:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll rudraksha beads left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll rudraksha beads right"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div ref={scrollerRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 md:gap-5">
              {rudrakshaBeads.map((product) => (
                <div key={product.slug} className="min-w-[calc(50vw-26px)] max-w-[220px] snap-start sm:min-w-[210px] lg:min-w-[220px] xl:min-w-[224px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

const LabTestedShowcase = memo(function LabTestedShowcase() {
  return (
    <section className="bg-[#fbf2e3] py-10 md:py-14">
      <div className="container-pad">
        <div className="mx-auto max-w-6xl overflow-hidden bg-[#f6e8ce]">
          <div className="px-6 py-9 md:px-10">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Asli Wearables - Lab Tested</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#17172a]">
              We follow our proprietary system of BTR (Batch Test Reports) to ensure you always get original and
              genuine beads and stones.
            </p>
          </div>

          <div className="relative overflow-hidden bg-[#d9b86c]">
            <img
              src="/assets/home/btr-testing.jpg"
              alt="Batch test report lab testing for spiritual wearables"
              loading="lazy"
              decoding="async"
              className="mx-auto block w-full object-cover"
            />
            {labMarkers.map((marker) => (
              <div
                key={marker.title}
                className={`group absolute ${marker.className} -translate-x-1/2 -translate-y-1/2`}
              >
                <Link
                  to={marker.href}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#070707] text-2xl font-light leading-none text-white shadow-xl ring-2 ring-white/50 transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/80"
                  aria-label={`Shop products for ${marker.title}`}
                >
                  +
                </Link>
                <div className="pointer-events-none absolute left-1/2 top-12 w-64 -translate-x-1/2 rounded-lg bg-white p-4 text-left opacity-0 shadow-2xl ring-1 ring-[#211d33]/10 transition duration-200 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
                  <h3 className="text-sm font-black text-[#211d33]">{marker.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#17172a]/70">{marker.description}</p>
                  <Link to={marker.href} className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.04em] text-rudra">
                    Shop products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const ComboDealsSection = memo(function ComboDealsSection({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const combos = products
    .filter((product) => product.collection === "Combos" || product.category === "Combos" || product.title.toLowerCase().includes("combo"))
    .slice(0, 10);

  if (!combos.length) return null;

  function scroll(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth"
    });
  }

  return (
    <section className="bg-[#fbf2e3] py-10 md:py-12">
      <div className="container-pad">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Save More With Combos</h2>
          <div className="flex items-center gap-3">
            <Link to="/collections?collection=Combos" className="text-sm font-semibold underline underline-offset-4 hover:text-rudra">
              View all
            </Link>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll combo products left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#211d33] text-white shadow-sm transition hover:bg-rudra"
                aria-label="Scroll combo products right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollerRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 md:gap-5">
          {combos.map((product) => (
            <div key={product.slug} className="min-w-[calc(50vw-26px)] max-w-[220px] snap-start sm:min-w-[210px] lg:min-w-[220px] xl:min-w-[224px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-10 h-px bg-gradient-to-r from-[#211d33] via-[#211d33]/50 to-transparent" />
      </div>
    </section>
  );
});

const SiddhVideoSection = memo(function SiddhVideoSection() {
  return (
    <section className="bg-[#fff7ec] py-12 md:py-16">
      <div className="container-pad">
        <div className="mx-auto max-w-5xl overflow-hidden bg-white shadow-soft">
          <div className="px-6 py-8 text-center md:px-12">
            <h2 className="font-heading text-2xl font-bold text-[#17172a] md:text-3xl">
              Siddh Products Delivered To Your Home
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#17172a]/70 md:text-base">
              Each Siddh order comes with a Siddhi Prakriya Report (SPR) with a QR code to watch a short video of the
              Siddhi ceremony of your product.
            </p>
          </div>

          <div className="relative aspect-video w-full overflow-hidden bg-[#211d33]">
            <img
              src="/assets/home/siddhi-prakriya.jpg"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <iframe
              className="relative z-10 h-full w-full"
              src="https://www.youtube.com/embed/LCrxcFGokJk?controls=1&modestbranding=1&playsinline=1&rel=0"
              title="Siddhi Prakriya ceremony video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
});

const styleTiles = [
  {
    title: "Everyday Wearables",
    cta: "Shop Bracelets",
    href: "/collections?collection=Rudraksha%20Bracelets",
    image: "/assets/style/everyday-wearables.jpg"
  },
  {
    title: "Elegance Rudraksha Range",
    cta: "Shop Women",
    href: "/collections?collection=Spiritual%20Jewellery",
    image: "/assets/style/elegance-rudraksha-range.jpg"
  },
  {
    title: "Premium Designs",
    cta: "Shop Premium",
    href: "/collections?collection=Rudraksha%20Bracelets",
    image: "/assets/style/premium-designs.jpg"
  },
  {
    title: "Wear With Pride",
    cta: "Shop Malas",
    href: "/collections?collection=Rudraksha%20Malas",
    image: "/assets/style/wear-with-pride.jpg"
  }
];

const customerReviews = [
  {
    name: "Ankita Yogi",
    title: "Kanthi Mala",
    text: "Pure original Kanthi. Thank you Japam.",
    image: "/assets/reviews/ankita-yogi.jpeg",
    href: "/collections?collection=Rudraksha%20Malas"
  },
  {
    name: "Anil Kumawat",
    title: "Extremely Satisfied",
    text: "The crystals feel natural and premium, and the bracelet fits perfectly.",
    image: "/assets/reviews/anil-kumawat.jpg",
    href: "/collections?bead=Pyrite"
  },
  {
    name: "Shridhar Kotabagi",
    title: "Mind Peace",
    text: "Nice Rudraksha, peaceful feeling, awesome quality.",
    image: "/assets/reviews/shridhar-kotabagi.jpg",
    href: "/collections?collection=Rudraksha"
  },
  {
    name: "Ranjit",
    title: "Attractive Bracelet",
    text: "Bracelet is very attractive and the beads feel pure.",
    image: "/assets/reviews/ranjit.jpg",
    href: "/collections?collection=Karungali"
  }
];

const serviceHighlights = [
  {
    title: "Happy to help",
    text: "Contact our support team for order and product help.",
    href: "/support",
    Icon: MessageCircle
  },
  {
    title: "Check order status",
    text: "Track your order details and delivery progress.",
    href: "/track-order",
    Icon: PackageSearch
  },
  {
    title: "Returns & exchanges",
    text: "Get help with returns, exchanges, or product concerns.",
    href: "/support",
    Icon: RotateCcw
  },
  {
    title: "Free delivery",
    text: "Free delivery on eligible orders over Rs.299.",
    href: "/collections",
    Icon: Truck
  }
];

const StyleShowcase = memo(function StyleShowcase() {
  return (
    <section className="bg-[#fbf2e3] py-12">
      <div className="container-pad">
        <h2 className="font-heading text-3xl font-bold">Choose Your Style</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {styleTiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.href}
              className="group relative min-h-[280px] overflow-hidden rounded-sm bg-[#211d33] shadow-sm md:min-h-[380px]"
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

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                className="h-60 w-full bg-sandal object-cover transition duration-500 group-hover:scale-105"
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
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#363246]/80">{review.text}</p>
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

const ServiceHighlights = memo(function ServiceHighlights() {
  return (
    <section className="border-y border-[#211d33]/10 bg-[#fff7ec] py-5">
      <div className="container-pad">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceHighlights.map(({ title, text, href, Icon }) => (
            <Link
              key={title}
              to={href}
              className="flex min-h-[118px] items-center gap-4 bg-white px-5 py-4 text-[#17172a] shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6e8ce] text-[#8d4b25]">
                <Icon size={26} strokeWidth={1.7} />
              </span>
              <span>
                <span className="block text-sm font-black">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#17172a]/65">{text}</span>
              </span>
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
  categories: Array<{ name: string; value: string; href: string; image: string }>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const options = [
    {
      name: "All",
      value: "All",
      href: "/collections",
      image: "/assets/home/rudraksha.png"
    },
    ...categories
  ];

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

        <div ref={scrollerRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-3 md:gap-7">
          {options.map((category) => {
            const active = selectedCategory === category.value;
            return (
              <Link
                key={category.value}
                to={category.href}
                onClick={() => onSelect(category.value)}
                className="group flex min-w-[148px] flex-col items-center gap-3 text-center md:min-w-[184px]"
              >
                <span
                  className={`flex h-[128px] w-[128px] items-center justify-center rounded-full border-4 bg-[#f6e8ce] p-2 shadow-sm transition md:h-[170px] md:w-[170px] ${
                    active ? "border-[#211d33]" : "border-transparent"
                  }`}
                >
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                      src={category.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
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
  purposes: Array<{ name: string; image: string }>;
}) {
  return (
    <section className="bg-[#f6e8ce] py-12">
      <div className="container-pad">
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">Shop By Purpose</h2>
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-max justify-center gap-5 md:gap-8">
            {purposes.map((purpose) => {
              const active = selectedPurpose === purpose.name;

              return (
                <Link
                  key={purpose.name}
                  to={`/collections?purpose=${encodeURIComponent(purpose.name)}`}
                  onClick={() => onSelect(purpose.name)}
                  className={`group flex w-[118px] shrink-0 flex-col items-center gap-3 text-center transition hover:-translate-y-1 ${
                    active ? "text-rudra" : "text-[#17172a]"
                  }`}
                >
                  <span
                    className={`flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-full border-4 bg-white shadow-sm transition ${
                      active ? "border-[#211d33]" : "border-transparent"
                    }`}
                  >
                    <img
                      src={purpose.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-[142%] w-[142%] -translate-y-[15%] object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="text-sm font-bold leading-5">{purpose.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
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
