import { createCollectionModel } from "../db/documentModel.js";

export type BannerDocument = Record<string, any>;

export const Banner = createCollectionModel("banners", {
  defaults: () => ({ eyebrow: "", subtitle: "", ctaLabel: "", ctaUrl: "", placement: "home-hero", sortOrder: 0, active: true })
});
