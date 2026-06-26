import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fallbackHomepage, getHomepage } from "../lib/api";
import type { HomepageTraditionGalleryItem } from "../lib/api";

export function TraditionGallery({
  heading = fallbackHomepage.traditionGallery.heading,
  enabled = fallbackHomepage.traditionGallery.enabled
}: {
  heading?: string;
  enabled?: boolean;
}) {
  const [galleryEnabled, setGalleryEnabled] = useState(enabled);
  const [galleryHeading, setGalleryHeading] = useState(heading);
  const [items, setItems] = useState<HomepageTraditionGalleryItem[]>(fallbackHomepage.traditionGallery.items);

  useEffect(() => {
    let active = true;

    async function loadHomepage(force = false) {
      const homepage = await getHomepage({ force });
      if (!active) return;
      setGalleryEnabled(homepage.traditionGallery.enabled);
      setGalleryHeading(homepage.traditionGallery.heading);
      setItems(homepage.traditionGallery.items);
    }

    void loadHomepage();

    const refresh = () => {
      void loadHomepage(true);
    };
    const refreshWhenVisible = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const interval = window.setInterval(refresh, 45_000);

    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(interval);
    };
  }, []);

  if (!galleryEnabled) return null;

  return (
    <section className="bg-[#fff4e3] py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-left font-heading text-2xl font-bold text-[#17172a] md:text-3xl">
          {galleryHeading}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <GalleryLink key={`${item.label}-${item.image}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryLink({ item }: { item: HomepageTraditionGalleryItem }) {
  return (
    <Link to={item.href} className={`group relative block overflow-hidden rounded-sm bg-[#211d33] ${item.className}`}>
      <img
        src={item.image}
        alt={item.label}
        loading="lazy"
        decoding="async"
        className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[360px]"
      />
      <span className="absolute inset-0 bg-[#17172a]/0 transition group-hover:bg-[#17172a]/25" />
      <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#211d33] shadow-sm transition group-hover:bg-[#211d33] group-hover:text-white">
        {item.label}
      </span>
    </Link>
  );
}
