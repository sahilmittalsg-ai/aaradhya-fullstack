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
    shippingZones: [
      { id: "zone-1", zone: "Metro cities", fee: 0, cod: true, eta: "2-4 days" },
      { id: "zone-2", zone: "Rest of India", fee: 79, cod: true, eta: "4-7 days" },
      { id: "zone-3", zone: "Remote pincodes", fee: 149, cod: false, eta: "7-10 days" }
    ],
    navLinks: [],
    footerLinks: [],
    socialLinks: [],
    active: true
  })
});
