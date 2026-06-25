import dotenv from "dotenv";
import mongoose from "mongoose";
import slugify from "slugify";
import { connectDb } from "../config/db.js";
import { Banner } from "../models/Banner.js";
import { Category } from "../models/Category.js";
import { Coupon } from "../models/Coupon.js";
import { HomeSection } from "../models/HomeSection.js";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { Order } from "../models/Order.js";
import { OtpCode } from "../models/OtpCode.js";
import { Page } from "../models/Page.js";
import { PaymentMethod } from "../models/PaymentMethod.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { User } from "../models/User.js";

dotenv.config();

const products = [
  {
    title: "Rudraksha Aura Bracelet",
    subtitle: "Gold accented spiritual bracelet",
    description: "Hand-strung rudraksha style beads with premium gold-tone separators for daily intention rituals.",
    category: "Bracelets",
    collection: "Rudraksha",
    price: 899,
    compareAtPrice: 1299,
    stock: 42,
    rating: 4.9,
    images: ["/assets/products/rudraksha-bracelet.png"],
    tags: ["rudraksha", "bracelet", "bestseller"],
    purpose: ["Peace", "Protection", "Balance"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "Gold",
    audience: "Unisex",
    benefits: ["Daily grounding", "Minimal styling", "Gift-ready"],
    materials: ["Rudraksha-style beads", "Gold-tone alloy"],
    sizeOptions: [
      { label: "Small - 6.5 inch", value: "small-6-5", stock: 12 },
      { label: "Medium - 7 inch", value: "medium-7", stock: 20 },
      { label: "Large - 7.5 inch", value: "large-7-5", stock: 10 }
    ],
    addOnServices: [
      {
        code: "siddh-energized",
        title: "Get Siddh Energized Product",
        description: "A special energizing ritual service before dispatch.",
        price: 1000,
        active: true
      }
    ],
    delivery: { minDays: 3, maxDays: 6, expressMinDays: 2, expressMaxDays: 3 },
    careInstructions: "Keep dry and wipe gently with a soft cloth.",
    sku: "AB-RUD-BR-001",
    featured: true
  },
  {
    title: "108 Bead Meditation Mala",
    subtitle: "Classic mala for japa and mindfulness",
    description: "A full-length meditation mala with warm beads, silver-tone accents, and a grounded devotional finish.",
    category: "Malas",
    collection: "Meditation",
    price: 1499,
    compareAtPrice: 1999,
    stock: 28,
    rating: 4.8,
    images: ["/assets/products/meditation-mala.png"],
    tags: ["mala", "japa", "meditation"],
    purpose: ["Peace", "Health", "Balance"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "None",
    audience: "Unisex",
    benefits: ["Meditation practice", "Mantra counting", "Calming routine"],
    materials: ["Rudraksha-style beads", "Silver-tone alloy", "Cotton cord"],
    sizeOptions: [
      { label: "108 Beads - Standard", value: "108-standard", stock: 18 },
      { label: "108 Beads - Long", value: "108-long", stock: 10 }
    ],
    addOnServices: [
      {
        code: "siddh-energized",
        title: "Get Siddh Energized Product",
        description: "A special energizing ritual service before dispatch.",
        price: 1000,
        active: true
      }
    ],
    delivery: { minDays: 4, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Store in the pouch after use and avoid perfume contact.",
    sku: "AB-MAL-108-001",
    featured: true
  },
  {
    title: "Pyrite Tiger Eye Bracelet",
    subtitle: "Crystal energy bracelet",
    description: "Polished tiger eye and pyrite-style stones in a refined handmade bracelet for confident styling.",
    category: "Bracelets",
    collection: "Crystal",
    price: 1199,
    compareAtPrice: 1599,
    stock: 18,
    rating: 4.7,
    images: ["/assets/products/pyrite-tiger-eye.png"],
    tags: ["crystal", "tiger-eye", "pyrite"],
    purpose: ["Wealth", "Balance", "Courage"],
    bead: "Tiger Eye",
    mukhi: "Special",
    plating: "None",
    audience: "Unisex",
    benefits: ["Confidence styling", "Premium gifting", "Everyday wear"],
    materials: ["Tiger eye-style beads", "Pyrite-style beads", "Silver-tone separators"],
    sizeOptions: [
      { label: "Small - 6.5 inch", value: "small-6-5", stock: 6 },
      { label: "Medium - 7 inch", value: "medium-7", stock: 8 },
      { label: "Large - 7.5 inch", value: "large-7-5", stock: 4 }
    ],
    addOnServices: [
      {
        code: "siddh-energized",
        title: "Get Siddh Energized Product",
        description: "A special energizing ritual service before dispatch.",
        price: 1000,
        active: true
      }
    ],
    delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Avoid water and clean with a dry microfiber cloth.",
    sku: "AB-CRY-BR-001",
    featured: true
  },
  {
    title: "Gold Plated Modern Rudraksha Bracelet",
    subtitle: "Polished 5 mukhi daily-wear bracelet",
    description: "A refined rudraksha bracelet with gold-tone separators, made for everyday intention and modern spiritual styling.",
    category: "Bracelets",
    collection: "Rudraksha",
    price: 599,
    compareAtPrice: 999,
    stock: 42,
    rating: 4.9,
    images: ["/assets/products/rudraksha-bracelet.png"],
    tags: ["rudraksha", "bracelet", "5 mukhi", "gold"],
    purpose: ["Peace", "Protection", "Balance"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "Gold",
    audience: "Unisex",
    benefits: ["Daily grounding", "Minimal styling", "Gift-ready"],
    materials: ["Rudraksha-style beads", "Gold-tone alloy"],
    sizeOptions: [
      { label: "Small - 6.5 inch", value: "small-6-5", stock: 12 },
      { label: "Medium - 7 inch", value: "medium-7", stock: 20 },
      { label: "Large - 7.5 inch", value: "large-7-5", stock: 10 }
    ],
    addOnServices: [
      {
        code: "siddh-energized",
        title: "Get Siddh Energized Product",
        description: "A special energizing ritual service before dispatch.",
        price: 1000,
        active: true
      }
    ],
    delivery: { minDays: 3, maxDays: 6, expressMinDays: 2, expressMaxDays: 3 },
    careInstructions: "Keep dry and wipe gently with a soft cloth.",
    sku: "AB-RUD-BR-002",
    featured: true
  },
  {
    title: "Silver Plated Modern Rudraksha Bracelet",
    subtitle: "Clean silver finish with sacred bead accents",
    description: "A silver-tone rudraksha bracelet with a crisp contemporary profile for workwear, rituals, and festive looks.",
    category: "Bracelets",
    collection: "Rudraksha",
    price: 599,
    compareAtPrice: 999,
    stock: 35,
    rating: 4.8,
    images: ["/assets/products/rudraksha-bracelet.png"],
    tags: ["rudraksha", "bracelet", "silver", "5 mukhi"],
    purpose: ["Peace", "Health", "Balance"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "Silver",
    audience: "Unisex",
    benefits: ["Calm routine", "Subtle shine", "Everyday comfort"],
    materials: ["Rudraksha-style beads", "Silver-tone alloy"],
    sizeOptions: [
      { label: "Small - 6.5 inch", value: "small-6-5", stock: 10 },
      { label: "Medium - 7 inch", value: "medium-7", stock: 15 },
      { label: "Large - 7.5 inch", value: "large-7-5", stock: 10 }
    ],
    delivery: { minDays: 3, maxDays: 6, expressMinDays: 2, expressMaxDays: 3 },
    careInstructions: "Avoid perfume and water contact for a longer-lasting finish.",
    sku: "AB-RUD-BR-003",
    featured: true
  },
  {
    title: "Gold Plated DuoTone Rudraksha Bracelet",
    subtitle: "Statement band with gold and dark accents",
    description: "A bold duotone bracelet pairing warm rudraksha beads with a premium mixed-metal look for occasion wear.",
    category: "Bracelets",
    collection: "Rudraksha",
    price: 899,
    compareAtPrice: 1499,
    stock: 24,
    rating: 4.8,
    images: ["/assets/products/rudraksha-bracelet.png"],
    tags: ["rudraksha", "duotone", "bracelet", "gold"],
    purpose: ["Protection", "Courage", "Balance"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "DuoTone",
    audience: "Men",
    benefits: ["Bold styling", "Spiritual accessory", "Premium gifting"],
    materials: ["Rudraksha-style beads", "Gold-tone alloy", "Black-tone links"],
    sizeOptions: [
      { label: "Small - 6.5 inch", value: "small-6-5", stock: 6 },
      { label: "Medium - 7 inch", value: "medium-7", stock: 12 },
      { label: "Large - 7.5 inch", value: "large-7-5", stock: 6 }
    ],
    delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Store separately to prevent scratches on plated links.",
    sku: "AB-RUD-BR-004",
    featured: false
  },
  {
    title: "Brown Rudraksha Mala - 108+1 Beads",
    subtitle: "Traditional japa mala for mantra practice",
    description: "A full-length 108+1 bead mala crafted for mantra counting, meditation, and calm spiritual routines.",
    category: "Malas",
    collection: "Meditation",
    price: 599,
    compareAtPrice: 999,
    stock: 28,
    rating: 4.8,
    images: ["/assets/products/meditation-mala.png"],
    tags: ["mala", "japa", "meditation", "rudraksha"],
    purpose: ["Peace", "Health", "Balance"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "None",
    audience: "Unisex",
    benefits: ["Meditation practice", "Mantra counting", "Calming routine"],
    materials: ["Rudraksha-style beads", "Cotton cord"],
    sizeOptions: [
      { label: "108+1 Beads - Standard", value: "108-standard", stock: 18 },
      { label: "108+1 Beads - Long", value: "108-long", stock: 10 }
    ],
    delivery: { minDays: 4, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Store in the pouch after use and avoid perfume contact.",
    sku: "AB-MAL-108-002",
    featured: true
  },
  {
    title: "Black Rudraksha Mala - 108+1 Beads",
    subtitle: "Deep-toned mala with grounding finish",
    description: "A black-finish rudraksha mala made for focused meditation, protection rituals, and a stronger devotional look.",
    category: "Malas",
    collection: "Meditation",
    price: 499,
    compareAtPrice: 799,
    stock: 18,
    rating: 4.7,
    images: ["/assets/products/meditation-mala.png"],
    tags: ["black mala", "rudraksha", "japa", "protection"],
    purpose: ["Protection", "Peace", "Courage"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "None",
    audience: "Unisex",
    benefits: ["Focused chanting", "Grounded presence", "Travel-friendly ritual"],
    materials: ["Black rudraksha-style beads", "Cotton cord"],
    sizeOptions: [
      { label: "108+1 Beads - Standard", value: "108-standard", stock: 12 },
      { label: "108+1 Beads - Long", value: "108-long", stock: 6 }
    ],
    delivery: { minDays: 4, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Keep dry and store away from direct sunlight.",
    sku: "AB-MAL-108-003",
    featured: false
  },
  {
    title: "5 Mukhi Nepali Rudraksha - Paanch Mukhi",
    subtitle: "Single bead for daily blessings",
    description: "A compact 5 mukhi Nepali rudraksha bead option for simple sacred rituals or gifting.",
    category: "Nepali Rudraksha",
    collection: "Rudraksha",
    price: 499,
    compareAtPrice: 1099,
    stock: 60,
    rating: 4.9,
    images: ["/assets/products/rudraksha-bracelet.png"],
    tags: ["nepali rudraksha", "5 mukhi", "single bead"],
    purpose: ["Health", "Peace", "Protection"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "None",
    audience: "Unisex",
    benefits: ["Daily worship", "Pocket altar", "Simple gifting"],
    materials: ["Nepali rudraksha-style bead"],
    sizeOptions: [{ label: "Single Bead", value: "single-bead", stock: 60 }],
    delivery: { minDays: 3, maxDays: 6, expressMinDays: 2, expressMaxDays: 3 },
    careInstructions: "Keep clean and avoid chemical exposure.",
    sku: "AB-NR-005-001",
    featured: true
  },
  {
    title: "7 Mukhi Nepali Rudraksha - Saat Mukhi",
    subtitle: "Sacred bead for prosperity intention",
    description: "A 7 mukhi Nepali rudraksha-style bead curated for prosperity-focused rituals and personal practice.",
    category: "Nepali Rudraksha",
    collection: "Rudraksha",
    price: 499,
    compareAtPrice: 799,
    stock: 22,
    rating: 4.8,
    images: ["/assets/products/rudraksha-bracelet.png"],
    tags: ["nepali rudraksha", "7 mukhi", "wealth"],
    purpose: ["Wealth", "Luck", "Balance"],
    bead: "Rudraksha",
    mukhi: "7 - Saat",
    plating: "None",
    audience: "Unisex",
    benefits: ["Prosperity intention", "Compact ritual use", "Gift-ready"],
    materials: ["Nepali rudraksha-style bead"],
    sizeOptions: [{ label: "Single Bead", value: "single-bead", stock: 22 }],
    delivery: { minDays: 3, maxDays: 6, expressMinDays: 2, expressMaxDays: 3 },
    careInstructions: "Wipe gently with a dry cotton cloth.",
    sku: "AB-NR-007-001",
    featured: true
  },
  {
    title: "Sphatik and Rudraksha Mala - 108+1 Beads",
    subtitle: "Clear crystal and rudraksha meditation mala",
    description: "A serene mala combining sphatik-style clarity with rudraksha warmth for chanting and meditation.",
    category: "Malas",
    collection: "Meditation",
    price: 799,
    compareAtPrice: 1299,
    stock: 14,
    rating: 4.7,
    images: ["/assets/products/meditation-mala.png"],
    tags: ["sphatik", "rudraksha", "mala", "meditation"],
    purpose: ["Peace", "Balance", "Health"],
    bead: "Sphatik",
    mukhi: "5 - Paanch",
    plating: "None",
    audience: "Unisex",
    benefits: ["Balanced meditation", "Cooling visual style", "Mantra counting"],
    materials: ["Sphatik-style beads", "Rudraksha-style beads", "Cotton cord"],
    sizeOptions: [
      { label: "108+1 Beads - Standard", value: "108-standard", stock: 9 },
      { label: "108+1 Beads - Long", value: "108-long", stock: 5 }
    ],
    delivery: { minDays: 4, maxDays: 8, expressMinDays: 3, expressMaxDays: 5 },
    careInstructions: "Store separately to protect polished crystal-style beads.",
    sku: "AB-MAL-SPH-001",
    featured: false
  },
  {
    title: "Gold Plated Rudraksha Trishool Necklace",
    subtitle: "Spiritual necklace with trishool charm",
    description: "A compact devotional necklace with rudraksha-style beads and a gold-tone trishool charm.",
    category: "Necklaces",
    collection: "Spiritual Jewellery",
    price: 399,
    compareAtPrice: 999,
    stock: 26,
    rating: 4.7,
    images: ["/assets/products/meditation-mala.png"],
    tags: ["necklace", "rudraksha", "trishool", "gold"],
    purpose: ["Protection", "Courage", "Peace"],
    bead: "Rudraksha",
    mukhi: "5 - Paanch",
    plating: "Gold",
    audience: "Unisex",
    benefits: ["Devotional styling", "Lightweight wear", "Festival ready"],
    materials: ["Rudraksha-style beads", "Gold-tone alloy charm", "Cotton cord"],
    sizeOptions: [{ label: "Adjustable Cord", value: "adjustable-cord", stock: 26 }],
    delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Avoid sweat, water, and direct perfume contact.",
    sku: "AB-NK-TRI-001",
    featured: false
  },
  {
    title: "Rose Quartz Rudraksha Nazar Raksha Band",
    subtitle: "Soft pink bracelet for love and protection",
    description: "A gentle rose quartz-style and rudraksha band designed for mindful gifting and protective intention.",
    category: "Bracelets",
    collection: "Crystal",
    price: 699,
    compareAtPrice: 1099,
    stock: 19,
    rating: 4.6,
    images: ["/assets/products/pyrite-tiger-eye.png"],
    tags: ["rose quartz", "rudraksha", "nazar raksha", "bracelet"],
    purpose: ["Love", "Protection", "Peace"],
    bead: "Rose Quartz",
    mukhi: "5 - Paanch",
    plating: "None",
    audience: "Women",
    benefits: ["Soft styling", "Protection intention", "Meaningful gifting"],
    materials: ["Rose quartz-style beads", "Rudraksha-style beads", "Elastic cord"],
    sizeOptions: [
      { label: "Small - 6.5 inch", value: "small-6-5", stock: 5 },
      { label: "Medium - 7 inch", value: "medium-7", stock: 9 },
      { label: "Large - 7.5 inch", value: "large-7-5", stock: 5 }
    ],
    delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Keep away from harsh sunlight and moisture.",
    sku: "AB-CRY-RQ-001",
    featured: false
  },
  {
    title: "Natural Tiger Eye Om Band",
    subtitle: "Warm tiger eye bracelet with Om detail",
    description: "A polished tiger eye-style bracelet with an Om accent for confidence, focus, and grounded spiritual styling.",
    category: "Bracelets",
    collection: "Crystal",
    price: 749,
    compareAtPrice: 1199,
    stock: 17,
    rating: 4.7,
    images: ["/assets/products/pyrite-tiger-eye.png"],
    tags: ["tiger eye", "om", "bracelet", "confidence"],
    purpose: ["Courage", "Wealth", "Balance"],
    bead: "Tiger Eye",
    mukhi: "Special",
    plating: "None",
    audience: "Men",
    benefits: ["Focused styling", "Grounded look", "Daily confidence"],
    materials: ["Tiger eye-style beads", "Om accent", "Elastic cord"],
    sizeOptions: [
      { label: "Small - 6.5 inch", value: "small-6-5", stock: 4 },
      { label: "Medium - 7 inch", value: "medium-7", stock: 8 },
      { label: "Large - 7.5 inch", value: "large-7-5", stock: 5 }
    ],
    delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "Wipe dry after use and store in a pouch.",
    sku: "AB-CRY-TE-001",
    featured: false
  }
];

async function seed() {
  await connectDb(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/spiritual-commerce");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    OtpCode.deleteMany({}),
    Coupon.deleteMany({}),
    Category.deleteMany({}),
    Banner.deleteMany({}),
    HomeSection.deleteMany({}),
    Page.deleteMany({}),
    PaymentMethod.deleteMany({}),
    SiteSetting.deleteMany({}),
    NewsletterSubscriber.deleteMany({}),
    Review.deleteMany({}),
    SupportTicket.deleteMany({})
  ]);

  const [admin, client] = await User.create([
    { name: "Admin User", email: "admin@demo.com", password: "admin123", role: "admin", phone: "9999999999" },
    {
      name: "Client User",
      email: "client@demo.com",
      password: "client123",
      role: "client",
      phone: "8888888888",
      addresses: [{ line1: "221 Demo Street", city: "Jaipur", state: "Rajasthan", pincode: "302001" }]
    }
  ]);

  await Category.create(
    ["Rudraksha", "Crystal", "Meditation", "Spiritual Jewellery", "Bracelets", "Malas", "Nepali Rudraksha"].map((name) => ({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description: `${name} products for the storefront menu and filters.`,
      featured: ["Rudraksha", "Crystal", "Meditation", "Spiritual Jewellery"].includes(name)
    }))
  );

  const createdProducts = await Product.create(
    products.map((product) => ({ ...product, slug: slugify(product.title, { lower: true, strict: true }) }))
  );

  await SiteSetting.create({
    key: "default",
    brandName: "Aaradhya Beads",
    logoText: "A",
    tagline: "Spiritual wearables for modern devotion",
    supportEmail: "support@aaradhyabeads.com",
    supportPhone: "+91 99999 99999",
    announcement: "Free shipping above Rs.1499 | Use FIRST10 on your first order",
    freeShippingAbove: 1499,
    currency: "INR",
    navLinks: [
      { label: "Rudraksha", href: "/collections?collection=Rudraksha", sortOrder: 1 },
      { label: "Crystal", href: "/collections?collection=Crystal", sortOrder: 2 },
      { label: "Meditation", href: "/collections?collection=Meditation", sortOrder: 3 },
      { label: "Track Order", href: "/track-order", sortOrder: 4 }
    ],
    footerLinks: [
      { label: "About Us", href: "/pages/about-us", sortOrder: 1 },
      { label: "Track Order", href: "/track-order", sortOrder: 2 },
      { label: "Bulk / Wholesale", href: "/pages/bulk-wholesale", sortOrder: 3 },
      { label: "Returns / Exchange", href: "/pages/returns-exchange", sortOrder: 4 },
      { label: "Contact Us", href: "/pages/contact-us", sortOrder: 5 },
      { label: "Aaradhya on Amazon", href: "/pages/marketplace-store", sortOrder: 6 },
      { label: "Refund & Return Policy", href: "/pages/refund-return-policy", sortOrder: 6 },
      { label: "Shipping Policy", href: "/pages/shipping-policy", sortOrder: 7 },
      { label: "Privacy Policy", href: "/pages/privacy-policy", sortOrder: 8 },
      { label: "Terms of Service", href: "/pages/terms-of-service", sortOrder: 9 },
      { label: "Cashback Policy", href: "/pages/cashback-policy", sortOrder: 10 },
      { label: "Cancellation Policy", href: "/pages/cancellation-policy", sortOrder: 11 }
    ],
    socialLinks: [
      { label: "Instagram", href: "https://instagram.com", sortOrder: 1 },
      { label: "Facebook", href: "https://facebook.com", sortOrder: 2 }
    ]
  });

  await Banner.create([
    {
      title: "Spiritual wearables made for modern devotion",
      eyebrow: "Blessed essentials for everyday rituals",
      subtitle: "Shop rudraksha bracelets, meditation malas, and crystal energy pieces with a premium storefront flow.",
      image: "/assets/products/hero-spiritual-shop.png",
      ctaLabel: "Shop Collection",
      ctaUrl: "/collections",
      placement: "home-hero",
      sortOrder: 1
    },
    {
      title: "Meditation malas for mindful practice",
      eyebrow: "Japa essentials",
      subtitle: "Curated beads and malas for daily mantra routines.",
      image: "/assets/products/meditation-mala.png",
      ctaLabel: "Explore Malas",
      ctaUrl: "/collections?collection=Meditation",
      placement: "collection",
      sortOrder: 2
    }
  ]);

  await HomeSection.create([
    {
      title: "Bestselling spiritual essentials",
      eyebrow: "Featured Products",
      subtitle: "Top products managed from the admin catalog.",
      type: "featured-products",
      sortOrder: 1
    },
    {
      title: "Shop by intention",
      eyebrow: "Collections",
      subtitle: "Rudraksha, crystals, malas, bracelets, and meditation products.",
      type: "collections",
      sortOrder: 2,
      items: [
        { title: "Rudraksha", subtitle: "Grounded daily wear", href: "/collections?collection=Rudraksha" },
        { title: "Crystal", subtitle: "Energy stone styling", href: "/collections?collection=Crystal" },
        { title: "Meditation", subtitle: "Japa and mindfulness", href: "/collections?collection=Meditation" }
      ]
    },
    {
      title: "Why customers trust us",
      eyebrow: "Benefits",
      type: "benefits",
      sortOrder: 3,
      items: [
        { title: "Secure checkout", subtitle: "COD, UPI, and card-ready backend." },
        { title: "Order tracking", subtitle: "Live order status from the database." },
        { title: "Admin control", subtitle: "Manage catalog, content, orders, and users." }
      ]
    }
  ]);

  await Page.create([
    {
      title: "About Us",
      slug: "about-us",
      type: "about",
      excerpt: "A premium spiritual wearables brand demo.",
      body: "Aaradhya Beads is a MERN ecommerce build for spiritual bracelets, malas, crystals, order tracking, customer accounts, and admin operations."
    },
    {
      title: "Shipping Policy",
      slug: "shipping-policy",
      type: "policy",
      excerpt: "Shipping rules for customer orders.",
      body: "Orders are usually packed within 24-48 working hours. Standard delivery timelines depend on pincode, serviceability, and courier availability.\n\nFree shipping applies above the configured cart value. Express shipping may be available for selected addresses with an additional fee.\n\nTracking details are shared after dispatch and can be checked from the Track Order page."
    },
    {
      title: "Refund & Return Policy",
      slug: "refund-return-policy",
      type: "policy",
      excerpt: "Return and replacement flow.",
      body: "Returns and replacements can be requested from customer support with your order number. The item must be unused, safely packed, and reviewed by the support team before approval.\n\nRefunds are processed after quality inspection. Shipping charges, COD fees, and payment gateway charges may be non-refundable depending on the case.\n\nFor damaged, wrong, or missing items, contact support with photos and unboxing details as soon as possible."
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      type: "policy",
      excerpt: "Customer data handling.",
      body: "Customer information is used for order processing, delivery, support, and account services. Sensitive payment information should be handled only by a compliant payment gateway.\n\nBefore launch, configure cookie consent, analytics consent, data retention, and regional privacy requirements."
    },
    {
      title: "Terms of Service",
      slug: "terms-of-service",
      type: "policy",
      excerpt: "General terms for using the website.",
      body: "By using this website, customers agree to the listed prices, policies, checkout process, and support terms. Product images and descriptions are provided for shopping guidance.\n\nThe business may update prices, offers, inventory, and policies as required. Final production terms should be reviewed legally before launch."
    },
    {
      title: "Cashback Policy",
      slug: "cashback-policy",
      type: "policy",
      excerpt: "Rules for promotional cashback offers.",
      body: "Cashback offers are promotional and may be limited by order value, product category, date, and customer eligibility.\n\nCashback is not transferable and cannot be exchanged for cash unless your business policy explicitly allows it. Fraudulent or cancelled orders are not eligible."
    },
    {
      title: "Cancellation Policy",
      slug: "cancellation-policy",
      type: "policy",
      excerpt: "How cancellations work before dispatch.",
      body: "Cancellation requests can be accepted before the order is packed or dispatched. Once an order is shipped, the customer can use the return or exchange process instead.\n\nFor prepaid orders, approved cancellations are refunded to the original payment source or store credit based on your business configuration."
    },
    {
      title: "Bulk / Wholesale",
      slug: "bulk-wholesale",
      type: "landing",
      excerpt: "Bulk order support for gifts and wholesale.",
      body: "For corporate gifting, festival hampers, wholesale pricing, or custom product bundles, contact support with your quantity, delivery city, and timeline.\n\nThe admin team can manage bulk requests through support tickets and custom order notes."
    },
    {
      title: "Contact Us",
      slug: "contact-us",
      type: "support",
      excerpt: "Get help with orders, returns, cancellations, and product information.",
      body: "Our support team can help with order tracking, returns and exchanges, cancellations, product information, and general shopping questions.\n\nFor faster help, include your order number, phone number, and a clear description of the issue. You can create a support ticket from the Customer Support page.\n\nBusiness hours are Monday to Saturday, 10 AM to 5 PM. Most replies are handled within 24 working hours."
    },
    {
      title: "Aaradhya on Amazon",
      slug: "marketplace-store",
      type: "landing",
      excerpt: "Marketplace store link placeholder.",
      body: "Use this page for your marketplace or Amazon store link once your seller account is ready.\n\nIn production, replace this placeholder with your real marketplace URL, product collections, trust badges, and customer support notes for marketplace orders."
    },
    {
      title: "Returns / Exchange",
      slug: "returns-exchange",
      type: "support",
      excerpt: "Start a return or exchange request.",
      body: "To request a return or exchange, create a support ticket with your order number, issue type, and photos if applicable.\n\nThe support team will review your request and guide you through pickup, replacement, refund, or store credit options."
    }
  ]);

  await Coupon.create([
    { code: "FIRST10", type: "percent", value: 10, minSubtotal: 799 },
    { code: "DIVINE150", type: "flat", value: 150, minSubtotal: 1499 }
  ]);

  await PaymentMethod.create([
    {
      code: "cod",
      label: "Cash on Delivery",
      description: "Pay in cash when your order is delivered.",
      type: "cod",
      provider: "manual",
      instructions: "Keep exact cash ready for faster delivery handover.",
      fee: 0,
      sortOrder: 1
    },
    {
      code: "upi",
      label: "UPI",
      description: "Pay securely with any UPI app.",
      type: "online",
      provider: "razorpay",
      instructions: "A UPI payment request will be created before final order confirmation.",
      apps: [
        {
          code: "gpay",
          label: "Google Pay",
          logoText: "GPay",
          brandColor: "#1a73e8",
          deepLink: "upi://pay",
          instructions: "Open Google Pay and approve the payment request."
        },
        {
          code: "phonepe",
          label: "PhonePe",
          logoText: "Pe",
          brandColor: "#5f259f",
          deepLink: "phonepe://pay",
          instructions: "Open PhonePe and approve the payment request."
        },
        {
          code: "paytm-upi",
          label: "Paytm UPI",
          logoText: "Paytm",
          brandColor: "#00baf2",
          deepLink: "paytmmp://pay",
          instructions: "Open Paytm and approve the UPI payment."
        },
        {
          code: "bhim",
          label: "BHIM",
          logoText: "BHIM",
          brandColor: "#f58220",
          deepLink: "upi://pay",
          instructions: "Open BHIM or any UPI app to complete payment."
        }
      ],
      fee: 0,
      sortOrder: 2
    },
    {
      code: "card",
      label: "Credit or Debit Card",
      description: "Pay with Visa, Mastercard, RuPay, or other supported cards.",
      type: "online",
      provider: "razorpay",
      instructions: "Card payment should be handled by a PCI-compliant gateway in production.",
      fee: 0,
      sortOrder: 3
    },
    {
      code: "netbanking",
      label: "Net Banking",
      description: "Use your bank account to complete online payment.",
      type: "online",
      provider: "cashfree",
      instructions: "Redirect the customer to the selected bank in production.",
      fee: 0,
      sortOrder: 4
    },
    {
      code: "wallet",
      label: "Wallet",
      description: "Pay using a supported wallet app.",
      type: "online",
      provider: "cashfree",
      instructions: "Choose your wallet and approve the payment in the selected app.",
      apps: [
        {
          code: "amazon-pay",
          label: "Amazon Pay",
          logoText: "amazon pay",
          brandColor: "#ff9900",
          deepLink: "amazonpay://pay",
          instructions: "Continue to Amazon Pay wallet authorization."
        },
        {
          code: "mobikwik",
          label: "MobiKwik",
          logoText: "MobiKwik",
          brandColor: "#0078ff",
          deepLink: "mobikwik://pay",
          instructions: "Continue to MobiKwik wallet authorization."
        },
        {
          code: "paytm-wallet",
          label: "Paytm Wallet",
          logoText: "Paytm",
          brandColor: "#00baf2",
          deepLink: "paytmmp://wallet",
          instructions: "Continue to Paytm Wallet authorization."
        },
        {
          code: "freecharge",
          label: "Freecharge",
          logoText: "Freecharge",
          brandColor: "#e31e24",
          deepLink: "freecharge://pay",
          instructions: "Continue to Freecharge wallet authorization."
        }
      ],
      fee: 0,
      sortOrder: 5
    }
  ]);

  await NewsletterSubscriber.create([
    { email: "client@demo.com", source: "seed" },
    { email: "updates@example.com", source: "footer" }
  ]);

  await Review.create([
    {
      product: createdProducts[0]._id,
      user: client._id,
      name: client.name,
      rating: 5,
      comment: "Beautiful finishing and the packaging feels premium.",
      orderNumber: "ORD-24062001",
      verifiedPurchase: true
    },
    {
      product: createdProducts[1]._id,
      user: client._id,
      name: client.name,
      rating: 4,
      comment: "Good mala for daily japa practice.",
      orderNumber: "ORD-24062001",
      verifiedPurchase: true
    }
  ]);

  await Order.create({
    orderNumber: "ORD-24062001",
    user: client._id,
    customer: { name: client.name, email: client.email, phone: client.phone },
    shippingAddress: { line1: "221 Demo Street", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
    items: [
      {
        product: createdProducts[0]._id,
        title: createdProducts[0].title,
        image: createdProducts[0].images[0],
        price: createdProducts[0].price,
        quantity: 1
      },
      {
        product: createdProducts[2]._id,
        title: createdProducts[2].title,
        image: createdProducts[2].images[0],
        price: createdProducts[2].price,
        quantity: 1
      }
    ],
    mrpTotal: createdProducts[0].compareAtPrice + createdProducts[2].compareAtPrice,
    productDiscount:
      createdProducts[0].compareAtPrice +
      createdProducts[2].compareAtPrice -
      (createdProducts[0].price + createdProducts[2].price),
    subtotal: createdProducts[0].price + createdProducts[2].price,
    shipping: 0,
    paymentFee: 0,
    discount: 150,
    totalDiscount:
      createdProducts[0].compareAtPrice +
      createdProducts[2].compareAtPrice -
      (createdProducts[0].price + createdProducts[2].price) +
      150,
    tax: Math.round((createdProducts[0].price + createdProducts[2].price - 150) * 0.05),
    total:
      createdProducts[0].price +
      createdProducts[2].price -
      150 +
      Math.round((createdProducts[0].price + createdProducts[2].price - 150) * 0.05),
    shippingMethod: "standard",
    paymentMethod: "cod",
    paymentApp: "",
    paymentProvider: "manual",
    paymentStatus: "pending",
    status: "packed"
  });

  await SupportTicket.create({
    user: client._id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    orderNumber: "ORD-24062001",
    category: "order-tracking",
    subject: "Need delivery update",
    message: "Please share the expected delivery date for my order.",
    priority: "normal",
    status: "open"
  });

  await Promise.all([
    User.findByIdAndUpdate(admin._id, { wishlist: [createdProducts[0]._id] }),
    User.findByIdAndUpdate(client._id, { wishlist: [createdProducts[1]._id] })
  ]);

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
