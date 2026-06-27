export type TrendingProduct = {
  id: number;
  slug: string;
  image: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: string;
  badge: "New arrival";
  category: string;
  purpose: string;
  enabled: boolean;
};

export const latestTrendingProducts: TrendingProduct[] = [
  {
    id: 1,
    slug: "gold-plated-modern-rudraksha-bracelet",
    image: "/assets/products/rudraksha-bracelet.jpg",
    name: "Gold Plated Modern Rudraksha Bracelet",
    price: 599,
    oldPrice: 999,
    discount: "40% OFF",
    badge: "New arrival",
    category: "Rudraksha",
    purpose: "Protection",
    enabled: true
  },
  {
    id: 2,
    slug: "brown-rudraksha-mala-108-1-beads",
    image: "/assets/products/meditation-mala.jpg",
    name: "Brown Rudraksha Mala - 108+1 Beads",
    price: 599,
    oldPrice: 999,
    discount: "40% OFF",
    badge: "New arrival",
    category: "Rudraksha",
    purpose: "Peace",
    enabled: true
  },
  {
    id: 3,
    slug: "pyrite-money-magnet-bracelet",
    image: "/assets/products/pyrite-tiger-eye.jpg",
    name: "Pyrite Money Magnet Bracelet",
    price: 999,
    oldPrice: 1599,
    discount: "38% OFF",
    badge: "New arrival",
    category: "Pyrite",
    purpose: "Wealth",
    enabled: true
  },
  {
    id: 4,
    slug: "rose-quartz-rudraksha-nazar-raksha-band",
    image: "/assets/home/rose-quartz.png",
    name: "Rose Quartz Rudraksha Nazar Raksha Band",
    price: 699,
    oldPrice: 1099,
    discount: "36% OFF",
    badge: "New arrival",
    category: "Rose Quartz",
    purpose: "Love",
    enabled: true
  },
  {
    id: 5,
    slug: "healing-sphatik-health-mala",
    image: "/assets/home/sphatik.png",
    name: "Healing Sphatik Health Mala",
    price: 899,
    oldPrice: 1399,
    discount: "36% OFF",
    badge: "New arrival",
    category: "Sphatik",
    purpose: "Health",
    enabled: true
  },
  {
    id: 6,
    slug: "tiger-eye-courage-bracelet",
    image: "/assets/home/tiger-eye.png",
    name: "Tiger Eye Courage Bracelet",
    price: 849,
    oldPrice: 1299,
    discount: "35% OFF",
    badge: "New arrival",
    category: "Tiger Eye",
    purpose: "Courage",
    enabled: true
  }
];
