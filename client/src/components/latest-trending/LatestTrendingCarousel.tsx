import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackHomepage, getHomepage } from "../../lib/api";
import type { HomepageTrendingProduct } from "../../lib/api";
import { ProductCard } from "./ProductCard";

const HOMEPAGE_REFRESH_MS = 120_000;

export function LatestTrendingCarousel() {
  const [products, setProducts] = useState<HomepageTrendingProduct[]>(() => fallbackHomepage.trending.products.filter((product) => product.enabled));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(fallbackHomepage.trending.autoplay);
  const [intervalMs, setIntervalMs] = useState(fallbackHomepage.trending.intervalMs);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    let active = true;

    async function loadHomepage(force = false) {
      const homepage = await getHomepage({ force });
      if (!active) return;
      const enabledProducts = homepage.trending.products.filter((product) => product.enabled);
      setProducts(enabledProducts);
      setAutoSlide(homepage.trending.autoplay);
      setIntervalMs(homepage.trending.intervalMs);
      setCurrentIndex(0);
    }

    void loadHomepage();

    const refresh = () => {
      if (document.hidden) return;
      void loadHomepage(true);
    };
    const refreshWhenVisible = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const interval = window.setInterval(refresh, HOMEPAGE_REFRESH_MS);

    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function updateVisibleCount() {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1280) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    }

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    function updatePageVisible() {
      setPageVisible(!document.hidden);
    }

    document.addEventListener("visibilitychange", updatePageVisible);
    return () => document.removeEventListener("visibilitychange", updatePageVisible);
  }, []);

  useEffect(() => {
    if (!autoSlide || !pageVisible || products.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoSlide, intervalMs, pageVisible, products.length]);

  function previous() {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  }

  function next() {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  }

  if (products.length === 0) return null;

  const visibleProducts = Array.from(
    { length: Math.min(visibleCount, products.length) },
    (_item, offset) => products[(currentIndex + offset) % products.length]
  );

  return (
    <section className="bg-[#fff7ec] py-12 md:py-16">
      <div className="container-pad">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d4b25]">Fresh picks</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-[#17172a] md:text-4xl">Latest & Trending</h2>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setAutoSlide(false)}
          onMouseLeave={() => setAutoSlide(true)}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 gap-5 px-2 md:grid-cols-2 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          <button
            onClick={previous}
            className="absolute -left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#211d33]/10 bg-white text-[#211d33] shadow-md transition hover:bg-[#211d33] hover:text-white md:-left-5"
            aria-label="Previous trending products"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="absolute -right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#211d33]/10 bg-white text-[#211d33] shadow-md transition hover:bg-[#211d33] hover:text-white md:-right-5"
            aria-label="Next trending products"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
