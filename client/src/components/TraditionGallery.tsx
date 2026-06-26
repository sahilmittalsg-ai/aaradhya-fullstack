import { Link } from "react-router-dom";

const galleryItems = [
  {
    image: "/assets/tradition/mahakal-mala.jpg",
    label: "Mahakal Rudraksha Mala",
    href: "/collections?collection=Rudraksha%20Malas",
    className: "lg:col-span-1"
  },
  {
    image: "/assets/tradition/red-sandalwood.jpg",
    label: "Red Sandalwood Mala",
    href: "/collections?bead=Sandalwood",
    className: "lg:col-span-1"
  },
  {
    image: "/assets/tradition/dreamy-duo.jpg",
    label: "Dreamy Duo Bands",
    href: "/collections?collection=Energy%20Stones",
    className: "sm:col-span-2 lg:col-span-2"
  },
  {
    image: "/assets/tradition/silver-rudraksha-mala.jpg",
    label: "Silver Rudraksha Mala",
    href: "/collections?collection=Rudraksha%20Malas",
    className: "lg:col-span-1"
  },
  {
    image: "/assets/tradition/golden-beads-modern.jpg",
    label: "Modern Golden Beads",
    href: "/collections?collection=Rudraksha%20Bracelets",
    className: "lg:col-span-1"
  },
  {
    image: "/assets/tradition/lunar-karungali.jpg",
    label: "Lunar Karungali Bracelet",
    href: "/collections?collection=Karungali",
    className: "sm:col-span-2 lg:col-span-2"
  },
  {
    image: "/assets/tradition/pyrite-splash.jpg",
    label: "Pyrite Stone Splash",
    href: "/collections?bead=Pyrite",
    className: "lg:col-span-1"
  },
  {
    image: "/assets/tradition/tiger-eye-om.jpg",
    label: "Tiger Eye Om Band",
    href: "/products/natural-tiger-eye-om-band",
    className: "lg:col-span-1"
  },
  {
    image: "/assets/tradition/amethyst-band.jpg",
    label: "Amethyst Mystic Band",
    href: "/collections?bead=Amethyst",
    className: "sm:col-span-2 lg:col-span-2"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item) => (
            <GalleryLink key={item.image} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryLink({ item }: { item: { image: string; label: string; href: string; className: string } }) {
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
