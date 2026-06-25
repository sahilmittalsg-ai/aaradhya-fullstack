import { Link } from "react-router-dom";

const leftImages = [
  {
    image: "/assets/tradition/tradition-1.jpg",
    label: "Shop Rudraksha",
    href: "/collections?collection=Rudraksha"
  },
  {
    image: "/assets/tradition/tradition-2.jpg",
    label: "Shop Energy Stones",
    href: "/collections?collection=Energy%20Stones"
  },
  {
    image: "/assets/tradition/tradition-3.jpg",
    label: "Shop Karungali",
    href: "/collections?collection=Karungali"
  },
  {
    image: "/assets/tradition/tradition-4.jpg",
    label: "Shop Spiritual Jewellery",
    href: "/collections?collection=Spiritual%20Jewellery"
  }
];

const rightImages = [
  {
    image: "/assets/tradition/tradition-wide-1.jpg",
    label: "Shop Gift Hampers",
    href: "/collections?collection=Gift%20Hampers"
  },
  {
    image: "/assets/tradition/tradition-wide-2.jpg",
    label: "View All Products",
    href: "/collections"
  }
];

export function TraditionGallery({
  heading = "Rooted In Tradition, Made For Today",
  enabled = true
}: {
  heading?: string;
  enabled?: boolean;
}) {
  if (!enabled) return null;

  return (
    <section className="bg-[#fff4e3] py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-left font-heading text-2xl font-bold text-[#17172a] md:text-3xl">
          {heading}
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {leftImages.map((item) => (
              <GalleryLink key={item.image} item={item} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {rightImages.map((item) => (
              <GalleryLink key={item.image} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryLink({ item }: { item: { image: string; label: string; href: string } }) {
  return (
    <Link to={item.href} className="group relative block overflow-hidden rounded-lg">
      <img
        src={item.image}
        alt={item.label}
        className="h-[260px] w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-[#17172a]/0 transition group-hover:bg-[#17172a]/25" />
      <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#211d33] shadow-sm transition group-hover:bg-[#211d33] group-hover:text-white">
        {item.label}
      </span>
    </Link>
  );
}
