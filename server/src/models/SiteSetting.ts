import mongoose, { InferSchemaType } from "mongoose";

const navLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    sortOrder: { type: Number, default: 0 }
  },
  { _id: false }
);

const siteSettingSchema = new mongoose.Schema(
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
    navLinks: [navLinkSchema],
    footerLinks: [navLinkSchema],
    socialLinks: [navLinkSchema],
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type SiteSettingDocument = InferSchemaType<typeof siteSettingSchema>;
export const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);
