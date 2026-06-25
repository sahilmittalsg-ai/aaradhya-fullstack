import { Router } from "express";
import {
  createBanner,
  createHomeSection,
  createPage,
  getHomepage,
  getPage,
  getSettings,
  getStorefront,
  listBanners,
  listHomeSections,
  listNewsletterSubscribers,
  listPages,
  subscribeNewsletter,
  updateBanner,
  updateHomepage,
  updateHomeSection,
  updatePage,
  updateSettings
} from "../controllers/contentController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const contentRoutes = Router();

contentRoutes.get("/storefront", getStorefront);
contentRoutes.get("/homepage", getHomepage);
contentRoutes.get("/pages/:slug", getPage);
contentRoutes.post("/newsletter", subscribeNewsletter);

contentRoutes.get("/admin/banners", requireAuth, requireAdmin, listBanners);
contentRoutes.post("/admin/banners", requireAuth, requireAdmin, createBanner);
contentRoutes.patch("/admin/banners/:id", requireAuth, requireAdmin, updateBanner);

contentRoutes.get("/admin/home-sections", requireAuth, requireAdmin, listHomeSections);
contentRoutes.post("/admin/home-sections", requireAuth, requireAdmin, createHomeSection);
contentRoutes.patch("/admin/home-sections/:id", requireAuth, requireAdmin, updateHomeSection);
contentRoutes.get("/admin/homepage", requireAuth, requireAdmin, getHomepage);
contentRoutes.patch("/admin/homepage", requireAuth, requireAdmin, updateHomepage);

contentRoutes.get("/admin/pages", requireAuth, requireAdmin, listPages);
contentRoutes.post("/admin/pages", requireAuth, requireAdmin, createPage);
contentRoutes.patch("/admin/pages/:id", requireAuth, requireAdmin, updatePage);

contentRoutes.get("/admin/settings", requireAuth, requireAdmin, getSettings);
contentRoutes.patch("/admin/settings", requireAuth, requireAdmin, updateSettings);
contentRoutes.get("/admin/newsletter", requireAuth, requireAdmin, listNewsletterSubscribers);
