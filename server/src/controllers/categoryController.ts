import { Request, Response } from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import { makeSlug, newId, readStore, writeStore } from "../data/fileStore.js";
import { Category } from "../models/Category.js";

export async function listCategories(req: Request, res: Response) {
  const includeAll = req.query.all === "true";

  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    return res.json(includeAll ? store.categories : store.categories.filter((category) => category.active !== false));
  }

  const categories = await Category.find(includeAll ? {} : { active: true }).sort({ featured: -1, name: 1 });
  return res.json(categories);
}

export async function createCategory(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const category = {
      ...req.body,
      _id: newId("local-category"),
      slug: makeSlug(req.body.name),
      active: req.body.active !== false
    };
    store.categories.push(category);
    await writeStore(store);
    return res.status(201).json(category);
  }

  const slug = slugify(req.body.name, { lower: true, strict: true });
  const category = await Category.create({ ...req.body, slug });
  return res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const index = store.categories.findIndex((category) => category._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Category not found" });
    const patch = { ...req.body };
    if (patch.name) patch.slug = makeSlug(patch.name);
    store.categories[index] = { ...store.categories[index], ...patch };
    await writeStore(store);
    return res.json(store.categories[index]);
  }

  const patch = { ...req.body };
  if (patch.name) patch.slug = slugify(patch.name, { lower: true, strict: true });

  const category = await Category.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const index = store.categories.findIndex((category) => category._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Category not found" });
    store.categories[index].active = false;
    await writeStore(store);
    return res.json({ message: "Category archived" });
  }

  const category = await Category.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json({ message: "Category archived" });
}
