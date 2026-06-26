import { createCollectionModel } from "../db/documentModel.js";

export const Banner = createCollectionModel("banners", {
  defaults: () => ({ eyebrow: "", subtitle: "", ctaLabel: "", ctaUrl: "", placement: "home-hero", sortOrder: 0, active: true })
});

export const HomeSection = createCollectionModel("homesections", {
  defaults: () => ({ title: "", subtitle: "", type: "custom", sortOrder: 0, active: true, items: [] })
});

export const Page = createCollectionModel("pages", {
  defaults: () => ({ type: "policy", excerpt: "", content: "", active: true })
});

export const SiteSetting = createCollectionModel("sitesettings", {
  defaults: () => ({
    key: "default",
    brandName: "",
    logoText: "",
    announcement: "",
    supportEmail: "",
    supportPhone: "",
    freeShippingThreshold: 1499,
    navLinks: [],
    footerLinks: [],
    socialLinks: [],
    active: true
  })
});

export const NewsletterSubscriber = createCollectionModel("newslettersubscribers", {
  defaults: () => ({ source: "website", active: true })
});
