import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fallbackHomepage, getHomepage } from "../lib/api";

export function HeroCarousel() {
  const [slides, setSlides] = useState(() => fallbackHomepage.hero.slides.filter((slide) => slide.active));
  const [autoplay, setAutoplay] = useState(fallbackHomepage.hero.autoplay);
  const [intervalMs, setIntervalMs] = useState(fallbackHomepage.hero.intervalMs);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState(() => new Set([0]));

  useEffect(() => {
    getHomepage().then((homepage) => {
      const activeSlides = homepage.hero.slides.filter((slide) => slide.active);
      if (activeSlides.length > 0) {
        setSlides(activeSlides);
        setCurrentSlide(0);
      }
      setAutoplay(homepage.hero.autoplay);
      setIntervalMs(homepage.hero.intervalMs);
    });
  }, []);

  useEffect(() => {
    function updatePageVisible() {
      setPageVisible(!document.hidden);
    }

    document.addEventListener("visibilitychange", updatePageVisible);
    return () => document.removeEventListener("visibilitychange", updatePageVisible);
  }, []);

  useEffect(() => {
    if (paused || !pageVisible || !autoplay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoplay, intervalMs, pageVisible, paused, slides.length]);

  useEffect(() => {
    setLoadedSlideIndexes((current) => {
      const next = new Set(current);
      next.add(currentSlide);
      if (slides.length > 1) next.add((currentSlide + 1) % slides.length);
      return next;
    });
  }, [currentSlide, slides.length]);

  function previous() {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }

  function next() {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }

  return (
    <section
      className="relative h-[350px] w-full overflow-hidden md:h-[550px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            currentSlide === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={currentSlide !== index}
        >
          {loadedSlideIndexes.has(index) && (
            <img
              src={slide.image}
              alt={slide.heading}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-[#17172a]/30" />
          <div className="container-pad absolute inset-x-0 top-1/2 -translate-y-1/2">
            <div className="max-w-xl text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80 md:text-sm">
                Spiritual - Sacred - Timeless
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight md:text-6xl">{slide.heading}</h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 md:text-lg md:leading-8">{slide.subheading}</p>
              <Link
                to={slide.href}
                className="mt-6 inline-flex border border-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[#211d33] md:mt-8"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={previous}
        className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-white backdrop-blur transition hover:bg-white hover:text-[#211d33] md:left-8 md:h-12 md:w-12"
        aria-label="Previous hero banner"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-white backdrop-blur transition hover:bg-white hover:text-[#211d33] md:right-8 md:h-12 md:w-12"
        aria-label="Next hero banner"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all ${currentSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/50"}`}
            aria-label={`Go to ${slide.heading}`}
          />
        ))}
      </div>
    </section>
  );
}
