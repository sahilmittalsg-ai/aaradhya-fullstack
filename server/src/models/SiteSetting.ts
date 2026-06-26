import { createCollectionModel } from "../db/documentModel.js";

export type SiteSettingDocument = Record<string, any>;

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
