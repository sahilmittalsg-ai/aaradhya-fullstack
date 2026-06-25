import mongoose from "mongoose";

export const Banner = mongoose.model(
  "Banner",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      eyebrow: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      image: { type: String, required: true },
      ctaLabel: { type: String, default: "Shop now" },
      ctaUrl: { type: String, default: "/collections" },
      placement: { type: String, enum: ["home-hero", "collection", "promo"], default: "home-hero" },
      sortOrder: { type: Number, default: 0 },
      active: { type: Boolean, default: true }
    },
    { timestamps: true }
  )
);

export const HomeSection = mongoose.model(
  "HomeSection",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      eyebrow: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      type: {
        type: String,
        enum: ["featured-products", "collections", "benefits", "testimonials", "story"],
        required: true
      },
      items: [
        {
          title: String,
          subtitle: String,
          image: String,
          href: String
        }
      ],
      sortOrder: { type: Number, default: 0 },
      active: { type: Boolean, default: true }
    },
    { timestamps: true }
  )
);

export const Page = mongoose.model(
  "Page",
  new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      slug: { type: String, required: true, unique: true },
      type: { type: String, enum: ["policy", "landing", "support", "about"], default: "landing" },
      excerpt: { type: String, default: "" },
      body: { type: String, required: true },
      seoTitle: { type: String, default: "" },
      seoDescription: { type: String, default: "" },
      active: { type: Boolean, default: true }
    },
    { timestamps: true }
  )
);

const linkSchema = new mongoose.Schema(
  {
    label: String,
    href: String,
    sortOrder: { type: Number, default: 0 }
  },
  { _id: false }
);

export const SiteSetting = mongoose.model(
  "SiteSetting",
  new mongoose.Schema(
    {
      key: { type: String, required: true, unique: true, default: "default" },
      brandName: { type: String, required: true },
      tagline: { type: String, default: "" },
      logoText: { type: String, default: "" },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
      announcement: { type: String, default: "" },
      freeShippingAbove: { type: Number, default: 1499 },
      currency: { type: String, default: "INR" },
      navLinks: [linkSchema],
      footerLinks: [linkSchema],
      socialLinks: [linkSchema],
      active: { type: Boolean, default: true }
    },
    { timestamps: true }
  )
);

export const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      source: { type: String, default: "website" },
      active: { type: Boolean, default: true }
    },
    { timestamps: true }
  )
);
