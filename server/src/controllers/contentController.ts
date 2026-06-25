import { Request, Response } from "express";
import slugify from "slugify";
import { readStore, writeStore } from "../data/fileStore.js";
import { Banner } from "../models/Banner.js";
import { Category } from "../models/Category.js";
import { HomeSection } from "../models/HomeSection.js";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { Page } from "../models/Page.js";
import { Product } from "../models/Product.js";
import { SiteSetting } from "../models/SiteSetting.js";

export async function getHomepage(_req: Request, res: Response) {
  const store = await readStore();
  return res.json(store.homepage);
}

export async function updateHomepage(req: Request, res: Response) {
  const store = await readStore();
  store.homepage = {
    ...store.homepage,
    ...req.body,
    hero: {
      ...store.homepage.hero,
      ...(req.body.hero || {}),
      slides: req.body.hero?.slides || store.homepage.hero.slides
    },
    sections: req.body.sections || store.homepage.sections
  };

  await writeStore(store);
  return res.json(store.homepage);
}

export async function getStorefront(_req: Request, res: Response) {
  const [settings, banners, sections, categories, featuredProducts] = await Promise.all([
    SiteSetting.findOne({ key: "default", active: true }),
    Banner.find({ active: true }).sort({ placement: 1, sortOrder: 1 }),
    HomeSection.find({ active: true }).sort({ sortOrder: 1 }),
    Category.find({ active: true }).sort({ featured: -1, name: 1 }),
    Product.find({ active: true, featured: true }).sort({ createdAt: -1 }).limit(8)
  ]);

  return res.json({
    settings,
    banners,
    sections,
    categories,
    featuredProducts
  });
}

export async function getPage(req: Request, res: Response) {
  const page = await Page.findOne({ slug: req.params.slug, active: true });
  if (!page) return res.status(404).json({ message: "Page not found" });
  return res.json(page);
}

export async function subscribeNewsletter(req: Request, res: Response) {
  const { email, source } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { email },
    { email, source: source || "website", active: true },
    { new: true, upsert: true }
  );

  return res.status(201).json(subscriber);
}

export async function listBanners(_req: Request, res: Response) {
  const banners = await Banner.find().sort({ placement: 1, sortOrder: 1 });
  return res.json(banners);
}

export async function createBanner(req: Request, res: Response) {
  const banner = await Banner.create(req.body);
  return res.status(201).json(banner);
}

export async function updateBanner(req: Request, res: Response) {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  return res.json(banner);
}

export async function listHomeSections(_req: Request, res: Response) {
  const sections = await HomeSection.find().sort({ sortOrder: 1 });
  return res.json(sections);
}

export async function createHomeSection(req: Request, res: Response) {
  const section = await HomeSection.create(req.body);
  return res.status(201).json(section);
}

export async function updateHomeSection(req: Request, res: Response) {
  const section = await HomeSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!section) return res.status(404).json({ message: "Home section not found" });
  return res.json(section);
}

export async function listPages(_req: Request, res: Response) {
  const pages = await Page.find().sort({ type: 1, title: 1 });
  return res.json(pages);
}

export async function createPage(req: Request, res: Response) {
  const slug = req.body.slug || slugify(req.body.title, { lower: true, strict: true });
  const page = await Page.create({ ...req.body, slug });
  return res.status(201).json(page);
}

export async function updatePage(req: Request, res: Response) {
  const patch = { ...req.body };
  if (patch.title && !patch.slug) patch.slug = slugify(patch.title, { lower: true, strict: true });

  const page = await Page.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!page) return res.status(404).json({ message: "Page not found" });
  return res.json(page);
}

export async function getSettings(_req: Request, res: Response) {
  const settings = await SiteSetting.findOne({ key: "default" });
  return res.json(settings);
}

export async function updateSettings(req: Request, res: Response) {
  const settings = await SiteSetting.findOneAndUpdate(
    { key: "default" },
    { ...req.body, key: "default" },
    { new: true, upsert: true }
  );

  return res.json(settings);
}

export async function listNewsletterSubscribers(_req: Request, res: Response) {
  const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
  return res.json(subscribers);
}
