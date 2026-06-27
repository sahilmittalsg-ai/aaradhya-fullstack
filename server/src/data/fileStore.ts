import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import slugify from "slugify";

const storePath = fileURLToPath(new URL("../../data/store.json", import.meta.url));
let cachedStore: Store | null = null;

type Store = {
  products: any[];
  categories: any[];
  coupons: any[];
  orders: any[];
  supportTickets: any[];
  homepage: HomepageStore;
};

export type HeroSlide = {
  id: string;
  image: string;
  heading: string;
  subheading: string;
  cta: string;
  href: string;
  active: boolean;
};

export type HomepageSection = {
  key: string;
  title: string;
  description: string;
  active: boolean;
  managePath: string;
};

export type HomepageStore = {
  settings: HomepageSettings;
  hero: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    slides: HeroSlide[];
  };
  trending: {
    enabled: boolean;
    autoplay: boolean;
    intervalMs: number;
    products: Array<{
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
    }>;
  };
  traditionGallery: {
    enabled: boolean;
    heading: string;
    items: Array<{
      image: string;
      label: string;
      href: string;
      className: string;
    }>;
  };
  sections: HomepageSection[];
};

export type HomepageSettings = {
  brandName: string;
  brandTagline: string;
  logoText: string;
  footerDescription: string;
  supportCta: string;
  searchPlaceholders: string[];
  announcements: Array<{
    text: string;
    href: string;
    active: boolean;
  }>;
  navItems: Array<{
    label: string;
    href: string;
    dropdown: boolean;
    active: boolean;
  }>;
  categoryStrip: Array<{
    name: string;
    value: string;
    image: string;
    active: boolean;
  }>;
  collectionCircles: Array<{
    name: string;
    value: string;
    href: string;
    image: string;
    active: boolean;
  }>;
  purposeCards: Array<{
    name: string;
    value: string;
    image: string;
    active: boolean;
  }>;
};

const categorySeeds = [
  "Rudraksha",
  "Karungali",
  "Pyrite",
  "Sandalwood",
  "Sphatik",
  "Tiger Eye",
  "Rose Quartz",
  "Amethyst",
  "Spiritual Jewellery",
  "Energy Stones",
  "Rudraksha Bracelets",
  "Rudraksha Malas",
  "Nepali/Indian Rudraksha",
  "Combos",
  "Gift Hampers"
];

const productSeeds = [
  ["Gold Plated Modern Rudraksha Bracelet", "Rudraksha", "Rudraksha Bracelets", 599, 999, 42, "Protection", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Silver Plated Modern Rudraksha Bracelet", "Rudraksha", "Rudraksha Bracelets", 599, 999, 35, "Peace", "Silver", "/assets/products/rudraksha-bracelet.jpg"],
  ["Gold Plated DuoTone Rudraksha Bracelet", "Rudraksha", "Rudraksha Bracelets", 899, 1499, 24, "Courage", "DuoTone", "/assets/products/rudraksha-bracelet.jpg"],
  ["Brown Rudraksha Mala - 108+1 Beads", "Rudraksha", "Rudraksha Malas", 599, 999, 28, "Peace", "None", "/assets/products/meditation-mala.jpg"],
  ["Black Rudraksha Mala - 108+1 Beads", "Rudraksha", "Rudraksha Malas", 499, 799, 18, "Protection", "None", "/assets/products/meditation-mala.jpg"],
  ["5 Mukhi Nepali Rudraksha - Paanch Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 499, 1099, 60, "Health", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["6 Mukhi Nepali Rudraksha - Chhah Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 499, 899, 34, "Balance", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["7 Mukhi Nepali Rudraksha - Saat Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 499, 799, 22, "Wealth", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["8 Mukhi Nepali Rudraksha - Aath Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 699, 1199, 20, "Luck", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["9 Mukhi Nepali Rudraksha - Nau Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 899, 1499, 16, "Protection", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["10 Mukhi Nepali Rudraksha - Dus Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 999, 1599, 14, "Peace", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["11 Mukhi Nepali Rudraksha - Gyarah Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 1299, 1999, 12, "Courage", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["12 Mukhi Nepali Rudraksha - Barah Mukhi", "Rudraksha", "Nepali/Indian Rudraksha", 1499, 2499, 10, "Health", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["Sphatik and Rudraksha Mala - 108+1 Beads", "Sphatik", "Rudraksha Malas", 799, 1299, 14, "Peace", "None", "/assets/home/sphatik.png"],
  ["Karungali Protection Bracelet", "Karungali", "Karungali Wearables", 699, 999, 26, "Protection", "None", "/assets/home/karungali.png"],
  ["Karungali Mala - 108 Beads", "Karungali", "Karungali Wearables", 899, 1399, 18, "Protection", "None", "/assets/home/karungali.png"],
  ["Karungali Gold Spacer Bracelet", "Karungali", "Karungali Wearables", 799, 1199, 22, "Courage", "Gold", "/assets/home/karungali.png"],
  ["Karungali Couple Bracelet Set", "Karungali", "Karungali Wearables", 1199, 1799, 15, "Love", "None", "/assets/home/karungali.png"],
  ["Pyrite Money Magnet Bracelet", "Pyrite", "Energy Stones", 999, 1599, 18, "Wealth", "None", "/assets/products/pyrite-tiger-eye.jpg"],
  ["Pyrite Prosperity Bracelet", "Pyrite", "Energy Stones", 799, 1199, 30, "Wealth", "None", "/assets/home/pyrite.png"],
  ["Pyrite Tiger Eye Wealth Bracelet", "Pyrite", "Energy Stones", 1099, 1699, 16, "Wealth", "None", "/assets/products/pyrite-tiger-eye.jpg"],
  ["Pyrite Citrine Bracelet", "Pyrite", "Energy Stones", 1199, 1899, 14, "Luck", "None", "/assets/home/pyrite.png"],
  ["Sandalwood Meditation Mala", "Sandalwood", "Rudraksha Malas", 749, 1199, 27, "Peace", "None", "/assets/home/sandalwood.png"],
  ["Red Sandalwood Bracelet", "Sandalwood", "Spiritual Jewellery", 649, 999, 25, "Peace", "None", "/assets/home/sandalwood.png"],
  ["White Sandalwood Japa Mala", "Sandalwood", "Rudraksha Malas", 899, 1399, 19, "Health", "None", "/assets/home/sandalwood.png"],
  ["Sphatik Health Mala", "Sphatik", "Rudraksha Malas", 999, 1499, 12, "Health", "None", "/assets/home/sphatik.png"],
  ["Sphatik Cooling Bracelet", "Sphatik", "Spiritual Jewellery", 699, 1099, 24, "Peace", "None", "/assets/home/sphatik.png"],
  ["Sphatik and Rose Quartz Bracelet", "Sphatik", "Energy Stones", 899, 1399, 17, "Love", "None", "/assets/home/sphatik.png"],
  ["Tiger Eye Courage Bracelet", "Tiger Eye", "Energy Stones", 849, 1299, 20, "Courage", "None", "/assets/home/tiger-eye.png"],
  ["Tiger Eye Wealth Bracelet", "Tiger Eye", "Energy Stones", 799, 1199, 21, "Wealth", "None", "/assets/home/tiger-eye.png"],
  ["Tiger Eye Rudraksha Bracelet", "Tiger Eye", "Rudraksha Bracelets", 899, 1399, 18, "Balance", "Gold", "/assets/home/tiger-eye.png"],
  ["Rose Quartz Love Band", "Rose Quartz", "Energy Stones", 749, 1099, 26, "Love", "None", "/assets/home/rose-quartz.png"],
  ["Rose Quartz Rudraksha Nazar Raksha Band", "Rose Quartz", "Rudraksha Bracelets", 699, 1099, 23, "Love", "None", "/assets/home/rose-quartz.png"],
  ["Rose Quartz Heart Charm Bracelet", "Rose Quartz", "Spiritual Jewellery", 899, 1399, 18, "Love", "Gold", "/assets/home/rose-quartz.png"],
  ["Amethyst Calm Bracelet", "Amethyst", "Energy Stones", 849, 1299, 21, "Peace", "None", "/assets/home/amethyst.png"],
  ["Amethyst Rudraksha Bracelet", "Amethyst", "Rudraksha Bracelets", 999, 1599, 15, "Balance", "Silver", "/assets/home/amethyst.png"],
  ["Amethyst Meditation Mala", "Amethyst", "Rudraksha Malas", 1299, 1999, 11, "Peace", "None", "/assets/home/amethyst.png"],
  ["Seven Chakra Rudraksha Bracelet", "Spiritual Jewellery", "Spiritual Jewellery", 999, 1599, 20, "Balance", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Nazar Suraksha Rudraksha Bracelet", "Spiritual Jewellery", "Rudraksha Bracelets", 699, 999, 32, "Protection", "Black", "/assets/products/rudraksha-bracelet.jpg"],
  ["Trishul Damru Rudraksha Bracelet", "Spiritual Jewellery", "Rudraksha Bracelets", 899, 1399, 17, "Courage", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Om Charm Rudraksha Bracelet", "Spiritual Jewellery", "Rudraksha Bracelets", 799, 1199, 25, "Peace", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Mahadev Rudraksha Kada Bracelet", "Spiritual Jewellery", "Rudraksha Bracelets", 1199, 1899, 13, "Protection", "Silver", "/assets/products/rudraksha-bracelet.jpg"],
  ["Rudraksha Rakhi Bracelet", "Rudraksha", "Rudraksha Bracelets", 399, 699, 40, "Protection", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Mini Rudraksha Kids Bracelet", "Rudraksha", "Rudraksha Bracelets", 499, 899, 22, "Health", "None", "/assets/products/rudraksha-bracelet.jpg"],
  ["Rudraksha Couple Bracelet Set", "Rudraksha", "Rudraksha Bracelets", 1299, 1999, 15, "Love", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Silver Plated Karungali Mala + Karungali Bracelet Combo For Men", "Combos", "Combos", 999, 1499, 18, "Protection", "Silver", "/assets/home/karungali.png"],
  ["Gold Plated Modern + Elemental Rudraksha Bracelet Combo", "Combos", "Combos", 899, 1599, 20, "Balance", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Dreamy Duo Combo with Rose Quartz and Amethyst Bands", "Combos", "Combos", 799, 1299, 16, "Love", "Gold", "/assets/home/rose-quartz.png"],
  ["Gold Plated Essential + Elemental Rudraksha Bracelet Combo", "Combos", "Combos", 899, 1599, 22, "Peace", "Gold", "/assets/products/rudraksha-bracelet.jpg"],
  ["Power Om Energy Combo of Black Onyx, Hematite and Tiger Eye Bands", "Combos", "Combos", 899, 1299, 14, "Courage", "Gold", "/assets/products/pyrite-tiger-eye.jpg"],
  ["Rudraksha Gift Hamper", "Gift Hampers", "Gift Hampers", 1599, 2499, 12, "Luck", "Gold", "/assets/products/hero-spiritual-shop.jpg"],
  ["Energy Stone Gift Hamper", "Gift Hampers", "Gift Hampers", 1799, 2799, 10, "Balance", "None", "/assets/products/hero-spiritual-shop.jpg"],
  ["Daily Peace Bracelet Combo", "Gift Hampers", "Gift Hampers", 1399, 2199, 14, "Peace", "None", "/assets/products/hero-spiritual-shop.jpg"],
  ["Wealth and Luck Bracelet Combo", "Gift Hampers", "Gift Hampers", 1499, 2399, 16, "Wealth", "None", "/assets/products/hero-spiritual-shop.jpg"],
  ["Protection Essentials Combo", "Gift Hampers", "Gift Hampers", 1299, 1999, 18, "Protection", "None", "/assets/products/hero-spiritual-shop.jpg"]
] as const;

export const defaultHomepage: HomepageStore = {
  settings: {
    brandName: "Aaradhya",
    brandTagline: "Beads",
    logoText: "Jap",
    footerDescription: "A complete ecommerce build for spiritual bracelets, malas, crystals, orders, and admin operations.",
    supportCta: "Chat with Sevak",
    searchPlaceholders: ["Search for Rudraksha", "Search for Karungali", "Search for Pyrite"],
    announcements: [
      { text: "100% Cashback available upto Rs.500", href: "/pages/cashback-policy", active: true },
      { text: "Free delivery on orders over Rs.299", href: "/collections", active: true },
      { text: "Har Ghar Rudraksha - Claim Free 5 Mukhi", href: "/collections?collection=Rudraksha", active: true }
    ],
    navItems: [
      { label: "Rudraksha", href: "/collections?collection=Rudraksha", dropdown: true, active: true },
      { label: "Energy Stones", href: "/collections?collection=Energy%20Stones", dropdown: true, active: true },
      { label: "Karungali", href: "/collections?collection=Karungali", dropdown: false, active: true },
      { label: "Combos", href: "/collections?collection=Combos", dropdown: true, active: true },
      { label: "Spiritual Jewellery", href: "/collections?collection=Spiritual%20Jewellery", dropdown: true, active: true },
      { label: "Gift Hampers", href: "/collections?collection=Gift%20Hampers", dropdown: true, active: true },
      { label: "Bulk / Wholesale", href: "/pages/bulk-wholesale", dropdown: false, active: true },
      { label: "Support", href: "/support", dropdown: true, active: true }
    ],
    categoryStrip: [
      { name: "Rudraksha", value: "Rudraksha", image: "/assets/categories/rudraksha.png", active: true },
      { name: "Karungali", value: "Karungali", image: "/assets/categories/karungali.png", active: true },
      { name: "Pyrite", value: "Pyrite", image: "/assets/categories/pyrite.png", active: true },
      { name: "Sandalwood", value: "Sandalwood", image: "/assets/categories/sandalwood.png", active: true },
      { name: "Sphatik", value: "Sphatik", image: "/assets/categories/sphatik.png", active: true },
      { name: "Tiger Eye", value: "Tiger Eye", image: "/assets/categories/tiger-eye.png", active: true },
      { name: "Rose Quartz", value: "Rose Quartz", image: "/assets/categories/rose-quartz.png", active: true },
      { name: "Amethyst", value: "Amethyst", image: "/assets/categories/amethyst.png", active: true },
      { name: "Combos", value: "Combos", image: "/assets/products/hero-spiritual-shop.jpg", active: true },
      { name: "Gift Hampers", value: "Gift Hampers", image: "/assets/categories/gift-hampers.jpg", active: true }
    ],
    collectionCircles: [
      { name: "Rudraksha Bracelets", value: "Rudraksha Bracelets", href: "/collections?collection=Rudraksha%20Bracelets", image: "/assets/collections/rudraksha-bracelets.jpg", active: true },
      { name: "Rudraksha Malas", value: "Rudraksha Malas", href: "/collections?collection=Rudraksha%20Malas", image: "/assets/collections/rudraksha-malas.jpg", active: true },
      { name: "Nepali/Indian Rudraksha", value: "Rudraksha", href: "/collections?collection=Rudraksha", image: "/assets/collections/nepali-indian-rudraksha.jpg", active: true },
      { name: "Spiritual Jewellery", value: "Spiritual Jewellery", href: "/collections?collection=Spiritual%20Jewellery", image: "/assets/collections/spiritual-jewellery.jpg", active: true },
      { name: "Karungali Wearables", value: "Karungali", href: "/collections?collection=Karungali", image: "/assets/collections/karungali-wearables.jpg", active: true },
      { name: "Energy Stones", value: "Energy Stones", href: "/collections?collection=Energy%20Stones", image: "/assets/collections/energy-stones.jpg", active: true },
      { name: "Pyrite Wearables", value: "Pyrite", href: "/collections?bead=Pyrite", image: "/assets/collections/pyrite-wearables.jpg", active: true },
      { name: "Combo Deals", value: "Combos", href: "/collections?collection=Combos", image: "/assets/products/hero-spiritual-shop.jpg", active: true },
      { name: "Gift Hampers", value: "Gift Hampers", href: "/collections?collection=Gift%20Hampers", image: "/assets/categories/gift-hampers.jpg", active: true }
    ],
    purposeCards: [
      { name: "Wealth", value: "Wealth", image: "/assets/purpose/wealth.jpg", active: true },
      { name: "Health", value: "Health", image: "/assets/purpose/health.jpg", active: true },
      { name: "Love", value: "Love", image: "/assets/purpose/love.jpg", active: true },
      { name: "Luck", value: "Luck", image: "/assets/purpose/luck.jpg", active: true },
      { name: "Protection", value: "Protection", image: "/assets/purpose/protection.jpg", active: true },
      { name: "Peace", value: "Peace", image: "/assets/purpose/peace.jpg", active: true },
      { name: "Courage", value: "Courage", image: "/assets/purpose/courage.jpg", active: true },
      { name: "Balance", value: "Balance", image: "/assets/purpose/balance.jpg", active: true }
    ]
  },
  hero: {
    enabled: true,
    autoplay: true,
    intervalMs: 5000,
    slides: [
      {
        id: "hero-rudraksha",
        image: "/assets/banners/rudraksha.jpg",
        heading: "Rudraksha Collection Banner",
        subheading: "Certified rudraksha wearables crafted for modern, everyday devotion.",
        cta: "Explore Rudraksha",
        href: "/collections?collection=Rudraksha",
        active: true
      },
      {
        id: "hero-karungali",
        image: "/assets/banners/karungali.jpg",
        heading: "Karungali Collection Banner",
        subheading: "Grounded Karungali-inspired bracelets and malas for protection styling.",
        cta: "Shop Karungali",
        href: "/collections?collection=Karungali",
        active: true
      },
      {
        id: "hero-energy-stones",
        image: "/assets/banners/energy-stones.jpg",
        heading: "Energy Stones Collection Banner",
        subheading: "Pyrite, rose quartz, tiger eye, sphatik, and more energy stone essentials.",
        cta: "Discover Stones",
        href: "/collections?collection=Energy%20Stones",
        active: true
      },
      {
        id: "hero-spiritual-jewellery",
        image: "/assets/banners/spiritual-jewellery.jpg",
        heading: "Spiritual Jewellery Banner",
        subheading: "Sacred jewellery pieces with premium finishes for rituals and gifting.",
        cta: "View Jewellery",
        href: "/collections?collection=Spiritual%20Jewellery",
        active: true
      }
    ]
  },
  trending: {
    enabled: true,
    autoplay: true,
    intervalMs: 4000,
    products: [
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
    ]
  },
  traditionGallery: {
    enabled: true,
    heading: "Rooted In Tradition, Made For Today",
    items: [
      { image: "/assets/tradition/mahakal-mala.jpg", label: "Mahakal Rudraksha Mala", href: "/collections?collection=Rudraksha%20Malas", className: "lg:col-span-1" },
      { image: "/assets/tradition/red-sandalwood.jpg", label: "Red Sandalwood Mala", href: "/collections?bead=Sandalwood", className: "lg:col-span-1" },
      { image: "/assets/tradition/dreamy-duo.jpg", label: "Dreamy Duo Bands", href: "/collections?collection=Energy%20Stones", className: "sm:col-span-2 lg:col-span-2" },
      { image: "/assets/tradition/silver-rudraksha-mala.jpg", label: "Silver Rudraksha Mala", href: "/collections?collection=Rudraksha%20Malas", className: "lg:col-span-1" },
      { image: "/assets/tradition/golden-beads-modern.jpg", label: "Modern Golden Beads", href: "/collections?collection=Rudraksha%20Bracelets", className: "lg:col-span-1" },
      { image: "/assets/tradition/lunar-karungali.jpg", label: "Lunar Karungali Bracelet", href: "/collections?collection=Karungali", className: "sm:col-span-2 lg:col-span-2" },
      { image: "/assets/tradition/pyrite-splash.jpg", label: "Pyrite Stone Splash", href: "/collections?bead=Pyrite", className: "lg:col-span-1" },
      { image: "/assets/tradition/tiger-eye-om.jpg", label: "Tiger Eye Om Band", href: "/products/natural-tiger-eye-om-band", className: "lg:col-span-1" },
      { image: "/assets/tradition/amethyst-band.jpg", label: "Amethyst Mystic Band", href: "/collections?bead=Amethyst", className: "sm:col-span-2 lg:col-span-2" }
    ]
  },
  sections: [
    { key: "announcement", title: "Announcement Bar", description: "Top black offer strip shown above navbar.", active: true, managePath: "/admin/homepage/announcement" },
    { key: "navbar", title: "Navbar Categories", description: "Main menu categories shown in customer header.", active: true, managePath: "/admin/homepage/navbar" },
    { key: "category-strip", title: "Category Strip", description: "Horizontal Rudraksha, Karungali, Pyrite image strip.", active: true, managePath: "/admin/homepage/category-strip" },
    { key: "hero-slider", title: "Hero Slider", description: "Four homepage banner photos, text, buttons, and autoplay.", active: true, managePath: "/admin/homepage/hero-slider" },
    { key: "latest-trending", title: "Latest & Trending", description: "Homepage product carousel and badges.", active: true, managePath: "/admin/homepage/latest-trending" },
    { key: "shop-collections", title: "Shop Our Collections", description: "Circular category carousel and filters.", active: true, managePath: "/admin/homepage/shop-collections" },
    { key: "shop-purpose", title: "Shop By Purpose", description: "Purpose cards like Wealth, Health, Love, Protection.", active: true, managePath: "/admin/homepage/shop-purpose" },
    { key: "tradition-gallery", title: "Rooted In Tradition Gallery", description: "Six-image lifestyle gallery section.", active: true, managePath: "/admin/homepage/tradition-gallery" },
    { key: "footer", title: "Footer Content", description: "Footer links, support, policy and brand text.", active: true, managePath: "/admin/homepage/footer" }
  ]
};

const defaultStore: Store = {
  products: [
    {
      _id: "local-product-1",
      title: "Gold Plated Modern Rudraksha Bracelet",
      slug: "gold-plated-modern-rudraksha-bracelet",
      subtitle: "Polished 5 mukhi daily-wear bracelet",
      description: "A refined rudraksha bracelet with gold-tone separators for everyday spiritual styling.",
      category: "Rudraksha",
      collection: "Rudraksha",
      price: 599,
      compareAtPrice: 999,
      stock: 42,
      rating: 4.9,
      images: ["/assets/products/rudraksha-bracelet.jpg"],
      tags: ["rudraksha", "bracelet", "5 mukhi"],
      purpose: ["Peace", "Protection", "Balance"],
      bead: "Rudraksha",
      mukhi: "5 - Paanch",
      plating: "Gold",
      audience: "Unisex",
      benefits: ["Daily grounding", "Gift-ready"],
      materials: ["Rudraksha-style beads", "Gold-tone alloy"],
      sizeOptions: [
        { label: "Small - 6.5 inch", value: "small-6-5", stock: 12 },
        { label: "Medium - 7 inch", value: "medium-7", stock: 20 },
        { label: "Large - 7.5 inch", value: "large-7-5", stock: 10 }
      ],
      addOnServices: [],
      delivery: { minDays: 3, maxDays: 6, expressMinDays: 2, expressMaxDays: 3 },
      careInstructions: "Keep dry and wipe gently with a soft cloth.",
      sku: "AB-RUD-BR-001",
      featured: true,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: "local-product-2",
      title: "Brown Rudraksha Mala - 108+1 Beads",
      slug: "brown-rudraksha-mala-108-1-beads",
      subtitle: "Traditional japa mala for mantra practice",
      description: "A full-length 108+1 bead mala crafted for mantra counting, meditation, and calm routines.",
      category: "Rudraksha",
      collection: "Meditation",
      price: 599,
      compareAtPrice: 999,
      stock: 28,
      rating: 4.8,
      images: ["/assets/products/meditation-mala.jpg"],
      tags: ["mala", "japa", "meditation", "rudraksha"],
      purpose: ["Peace", "Health", "Balance"],
      bead: "Rudraksha",
      mukhi: "5 - Paanch",
      plating: "None",
      audience: "Unisex",
      benefits: ["Meditation practice", "Mantra counting"],
      materials: ["Rudraksha-style beads", "Cotton cord"],
      sizeOptions: [{ label: "108+1 Beads - Standard", value: "108-standard", stock: 28 }],
      addOnServices: [],
      delivery: { minDays: 4, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
      careInstructions: "Store in the pouch after use.",
      sku: "AB-MAL-108-001",
      featured: true,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: "local-product-3",
      title: "Pyrite Money Magnet Bracelet",
      slug: "pyrite-money-magnet-bracelet",
      subtitle: "Crystal energy bracelet",
      description: "A polished pyrite and tiger eye style bracelet for confident everyday wear.",
      category: "Pyrite",
      collection: "Energy Stones",
      price: 999,
      compareAtPrice: 1599,
      stock: 18,
      rating: 4.7,
      images: ["/assets/products/pyrite-tiger-eye.jpg"],
      tags: ["pyrite", "tiger-eye", "bracelet"],
      purpose: ["Wealth", "Balance", "Courage"],
      bead: "Pyrite",
      mukhi: "Special",
      plating: "None",
      audience: "Unisex",
      benefits: ["Confidence styling", "Premium gifting"],
      materials: ["Pyrite-style beads", "Tiger eye-style beads"],
      sizeOptions: [{ label: "Medium - 7 inch", value: "medium-7", stock: 18 }],
      addOnServices: [],
      delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
      careInstructions: "Avoid water and clean with a dry cloth.",
      sku: "AB-PYR-BR-001",
      featured: true,
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    { _id: "local-category-1", name: "Rudraksha", slug: "rudraksha", description: "Rudraksha bracelets, malas, and beads.", featured: true, active: true },
    { _id: "local-category-2", name: "Pyrite", slug: "pyrite", description: "Energy stone wearables.", featured: true, active: true },
    { _id: "local-category-3", name: "Energy Stones", slug: "energy-stones", description: "Crystal and gemstone products.", featured: true, active: true }
  ],
  coupons: [
    { _id: "local-coupon-1", code: "FIRST10", type: "percent", value: 10, minSubtotal: 799, active: true },
    { _id: "local-coupon-2", code: "DIVINE150", type: "flat", value: 150, minSubtotal: 1499, active: true }
  ],
  orders: [],
  supportTickets: [],
  homepage: structuredClone(defaultHomepage)
};

export async function readStore(): Promise<Store> {
  if (cachedStore) return cachedStore;

  try {
    const raw = await fs.readFile(storePath, "utf8");
    const store = normalizeStore(JSON.parse(raw) as Store);
    await writeStore(store);
    return store;
  } catch {
    const store = normalizeStore(structuredClone(defaultStore));
    await writeStore(store);
    return store;
  }
}

function normalizeStore(store: Store): Store {
  store.homepage = normalizeHomepage(store.homepage);
  store.supportTickets = store.supportTickets || [];
  const productSlugs = new Set(store.products.map((product) => product.slug));

  if (store.products.length < productSeeds.length) {
    store.products = [
      ...store.products,
      ...productSeeds
        .map((seed, index) => productFromSeed(seed, index + 1))
        .filter((product) => !productSlugs.has(product.slug))
    ];
  }

  const categoryNames = new Set(store.categories.map((category) => category.name));
  categorySeeds.forEach((name, index) => {
    if (!categoryNames.has(name)) {
      store.categories.push({
        _id: `local-category-seed-${makeSlug(name)}`,
        name,
        slug: makeSlug(name),
        description: `${name} products managed from the admin panel.`,
        featured: index < 8,
        active: true
      });
    }
  });

  return store;
}

function normalizeHomepage(homepage?: Partial<HomepageStore>): HomepageStore {
  const source = homepage || {};
  const settings = normalizeHomepageSettings(source.settings);
  const savedSlides = source.hero?.slides || [];
  const slides = defaultHomepage.hero.slides.map((defaultSlide, index) => ({
    ...defaultSlide,
    ...(savedSlides[index] || {}),
    id: (savedSlides[index] || defaultSlide).id || defaultSlide.id
  }));

  const savedSections = new Map((source.sections || []).map((section) => [section.key, section]));
  const sections = defaultHomepage.sections.map((section) => ({
    ...section,
    ...(savedSections.get(section.key) || {}),
    managePath: section.managePath
  }));
  const savedTrendingProducts = source.trending?.products || [];
  const trendingProducts = (savedTrendingProducts.length ? savedTrendingProducts : defaultHomepage.trending.products).map((product, index) => ({
    ...defaultHomepage.trending.products[index % defaultHomepage.trending.products.length],
    ...product,
    id: Number(product.id || index + 1),
    slug: product.slug || makeSlug(product.name || `trending-product-${index + 1}`),
    badge: "New arrival" as const
  }));
  const savedGalleryItems = source.traditionGallery?.items || [];
  const galleryItems = defaultHomepage.traditionGallery.items.map((item, index) => ({
    ...item,
    ...(savedGalleryItems[index] || {})
  }));

  return {
    settings,
    hero: {
      enabled: source.hero?.enabled ?? defaultHomepage.hero.enabled,
      autoplay: source.hero?.autoplay ?? defaultHomepage.hero.autoplay,
      intervalMs: source.hero?.intervalMs ?? defaultHomepage.hero.intervalMs,
      slides
    },
    trending: {
      enabled: source.trending?.enabled ?? defaultHomepage.trending.enabled,
      autoplay: source.trending?.autoplay ?? defaultHomepage.trending.autoplay,
      intervalMs: source.trending?.intervalMs ?? defaultHomepage.trending.intervalMs,
      products: trendingProducts
    },
    traditionGallery: {
      enabled: source.traditionGallery?.enabled ?? defaultHomepage.traditionGallery.enabled,
      heading: source.traditionGallery?.heading || defaultHomepage.traditionGallery.heading,
      items: galleryItems
    },
    sections
  };
}

function normalizeHomepageSettings(settings?: Partial<HomepageSettings>): HomepageSettings {
  const source = settings || {};
  const defaults = defaultHomepage.settings;

  return {
    brandName: source.brandName || defaults.brandName,
    brandTagline: source.brandTagline || defaults.brandTagline,
    logoText: source.logoText || defaults.logoText,
    footerDescription: source.footerDescription || defaults.footerDescription,
    supportCta: source.supportCta || defaults.supportCta,
    searchPlaceholders: normalizeStringList(source.searchPlaceholders, defaults.searchPlaceholders),
    announcements: normalizeSettingsList(source.announcements, defaults.announcements, (item, fallback) => ({
      text: item.text || fallback.text,
      href: item.href || fallback.href,
      active: item.active ?? fallback.active
    })),
    navItems: normalizeSettingsList(source.navItems, defaults.navItems, (item, fallback) => ({
      label: item.label || fallback.label,
      href: item.href || fallback.href,
      dropdown: item.dropdown ?? fallback.dropdown,
      active: item.active ?? fallback.active
    })),
    categoryStrip: normalizeSettingsList(source.categoryStrip, defaults.categoryStrip, (item, fallback) => ({
      name: item.name || fallback.name,
      value: item.value || item.name || fallback.value,
      image: item.image || fallback.image,
      active: item.active ?? fallback.active
    })),
    collectionCircles: normalizeSettingsList(source.collectionCircles, defaults.collectionCircles, (item, fallback) => ({
      name: item.name || fallback.name,
      value: item.value || fallback.value,
      href: item.href || fallback.href,
      image: item.image || fallback.image,
      active: item.active ?? fallback.active
    })),
    purposeCards: normalizeSettingsList(source.purposeCards, defaults.purposeCards, (item, fallback) => ({
      name: item.name || fallback.name,
      value: item.value || item.name || fallback.value,
      image: item.image || fallback.image,
      active: item.active ?? fallback.active
    }))
  };
}

function normalizeStringList(values: unknown, fallback: string[]) {
  const rows = Array.isArray(values) ? values.map((item) => String(item || "").trim()).filter(Boolean) : [];
  return rows.length ? rows : fallback;
}

function normalizeSettingsList<T extends Record<string, any>>(
  values: T[] | undefined,
  fallback: T[],
  normalize: (item: Partial<T>, fallback: T) => T
) {
  const rows = Array.isArray(values) && values.length ? values : fallback;
  return rows.map((item, index) => normalize(item, fallback[index % fallback.length]));
}

function productFromSeed(seed: (typeof productSeeds)[number], index: number) {
  const [title, category, collection, price, compareAtPrice, stock, primaryPurpose, plating, image] = seed;
  const slug = makeSlug(title);
  const purpose = Array.from(new Set([primaryPurpose, "Balance", category === "Rose Quartz" ? "Love" : "Peace"]));
  const bead = ["Rudraksha", "Karungali", "Pyrite", "Sandalwood", "Sphatik", "Tiger Eye", "Rose Quartz", "Amethyst"].includes(category)
    ? category
    : title.includes("Rudraksha")
      ? "Rudraksha"
      : "Mixed";

  return {
    _id: `local-product-seed-${slug}`,
    title,
    slug,
    subtitle: `${category} ${title.toLowerCase().includes("mala") ? "mala" : "wearable"} for ${primaryPurpose.toLowerCase()} intention`,
    description: `${title} crafted as a premium spiritual accessory for daily wear, gifting, and purpose-led routines.`,
    category,
    collection,
    price,
    compareAtPrice,
    stock,
    rating: Number((4.6 + (index % 4) * 0.1).toFixed(1)),
    images: [image],
    tags: [
      makeSlug(category),
      makeSlug(collection),
      title.toLowerCase().includes("mala") ? "mala" : "bracelet",
      makeSlug(primaryPurpose)
    ],
    purpose,
    bead,
    mukhi: title.match(/\d+ Mukhi/)?.[0] || (title.includes("Rudraksha") ? "5 - Paanch" : "Special"),
    plating,
    audience: index % 5 === 0 ? "Women" : index % 4 === 0 ? "Men" : "Unisex",
    benefits: [`Supports ${primaryPurpose.toLowerCase()} intention`, "Gift-ready styling", "Everyday spiritual wear"],
    materials: [`${bead} style beads`, plating === "None" ? "Elastic cord" : `${plating}-tone accents`],
    sizeOptions: title.toLowerCase().includes("mala")
      ? [{ label: "Standard", value: "standard", stock }]
      : [
          { label: "Small - 6.5 inch", value: "small-6-5", stock: Math.max(Math.floor(stock / 3), 1) },
          { label: "Medium - 7 inch", value: "medium-7", stock: Math.max(Math.floor(stock / 3), 1) },
          { label: "Large - 7.5 inch", value: "large-7-5", stock: Math.max(stock - Math.floor((stock * 2) / 3), 1) }
        ],
    addOnServices: [],
    delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Avoid water, perfume, and harsh chemicals. Store in the pouch after use.",
    sku: `AB-${String(index).padStart(4, "0")}`,
    featured: index <= 16,
    active: true,
    createdAt: new Date().toISOString()
  };
}

export async function writeStore(store: Store) {
  cachedStore = store;
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2));
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function makeSlug(value: string) {
  return slugify(value || `item-${Date.now()}`, { lower: true, strict: true });
}
