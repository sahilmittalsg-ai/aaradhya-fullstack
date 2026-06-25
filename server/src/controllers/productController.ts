import { Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import slugify from "slugify";
import { makeSlug, newId, readStore, writeStore } from "../data/fileStore.js";
import { Product } from "../models/Product.js";

export async function listProducts(req: Request, res: Response) {
  const includeAll = req.query.all === "true";
  const pagination = getPagination(req);

  if (mongoose.connection.readyState !== 1) {
    const products = await listLocalProducts(req);
    return res.json(paginateIfRequested(products, pagination));
  }

  const { category, collection, search, featured, purpose, bead, mukhi, plating, audience, minPrice, maxPrice, inStock } = req.query;
  const query: Record<string, unknown> = includeAll ? {} : { active: true };

  if (category) query.category = category;
  if (collection) query.collection = collection;
  if (featured) query.featured = featured === "true";
  if (purpose) query.purpose = purpose;
  if (bead) query.bead = bead;
  if (mukhi) query.mukhi = mukhi;
  if (plating) query.plating = plating;
  if (audience) query.audience = audience;
  if (inStock === "true") query.stock = { $gt: 0 };
  if (minPrice || maxPrice) {
    query.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {})
    };
  }
  if (search) query.$text = { $search: String(search) };

  try {
    const sort = getSort(req);
    if (pagination.requested) {
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sort)
          .skip((pagination.page - 1) * pagination.limit)
          .limit(pagination.limit),
        Product.countDocuments(query)
      ]);
      return res.json({
        data: products,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.max(Math.ceil(total / pagination.limit), 1)
        }
      });
    }

    const products = await Product.find(query).sort(sort);
    return res.json(products);
  } catch {
    const products = await listLocalProducts(req);
    return res.json(paginateIfRequested(products, pagination));
  }
}

export async function getProduct(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    return getLocalProduct(req, res);
  }

  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch {
    return getLocalProduct(req, res);
  }
}

export async function createProduct(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const product = {
      ...req.body,
      _id: newId("local-product"),
      slug: makeSlug(req.body.title),
      active: req.body.active !== false,
      createdAt: new Date().toISOString()
    };
    store.products.unshift(product);
    await writeStore(store);
    return res.status(201).json(product);
  }

  const slug = slugify(req.body.title, { lower: true, strict: true });
  const product = await Product.create({ ...req.body, slug });
  return res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const index = store.products.findIndex((product) => product._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Product not found" });

    const patch = { ...req.body };
    if (patch.title) patch.slug = makeSlug(patch.title);
    store.products[index] = { ...store.products[index], ...patch, updatedAt: new Date().toISOString() };
    await writeStore(store);
    return res.json(store.products[index]);
  }

  const patch = { ...req.body };
  if (patch.title) patch.slug = slugify(patch.title, { lower: true, strict: true });

  const product = await Product.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json(product);
}

export async function deleteProduct(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const index = store.products.findIndex((product) => product._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Product not found" });
    store.products[index].active = false;
    await writeStore(store);
    return res.json({ message: "Product archived" });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json({ message: "Product archived" });
}

async function listLocalProducts(req: Request) {
  const includeAll = req.query.all === "true";
  const { category, collection, search, featured, purpose, bead, mukhi, plating, audience, minPrice, maxPrice, inStock } = req.query;
  const store = await readStore();
  let products = includeAll ? store.products : store.products.filter((product) => product.active !== false);

  if (category) products = products.filter((product) => product.category === category);
  if (collection) products = products.filter((product) => product.collection === collection);
  if (featured) products = products.filter((product) => product.featured === (featured === "true"));
  if (purpose) products = products.filter((product) => (product.purpose || []).includes(String(purpose)));
  if (bead) products = products.filter((product) => product.bead === bead);
  if (mukhi) products = products.filter((product) => product.mukhi === mukhi);
  if (plating) products = products.filter((product) => product.plating === plating);
  if (audience) products = products.filter((product) => product.audience === audience);
  if (inStock === "true") products = products.filter((product) => Number(product.stock || 0) > 0);
  if (minPrice) products = products.filter((product) => Number(product.price || 0) >= Number(minPrice));
  if (maxPrice) products = products.filter((product) => Number(product.price || 0) <= Number(maxPrice));
  if (search) {
    const query = String(search).toLowerCase();
    products = products.filter((product) => `${product.title} ${product.description} ${(product.tags || []).join(" ")}`.toLowerCase().includes(query));
  }

  return products.sort(localSort(req));
}

async function getLocalProduct(req: Request, res: Response) {
  const store = await readStore();
  const product = store.products.find((item) => item.slug === req.params.slug && item.active !== false);
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json(product);
}

function getPagination(req: Request) {
  const requested = req.query.page !== undefined || req.query.limit !== undefined;
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 100);
  return { requested, page, limit };
}

function paginateIfRequested<T>(items: T[], pagination: ReturnType<typeof getPagination>) {
  if (!pagination.requested) return items;
  const start = (pagination.page - 1) * pagination.limit;
  const data = items.slice(start, start + pagination.limit);
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: items.length,
      totalPages: Math.max(Math.ceil(items.length / pagination.limit), 1)
    }
  };
}

function getSort(req: Request): Record<string, SortOrder> {
  const sort = String(req.query.sort || "featured");
  if (sort === "price-asc") return { price: 1, createdAt: -1 };
  if (sort === "price-desc") return { price: -1, createdAt: -1 };
  if (sort === "rating") return { rating: -1, createdAt: -1 };
  if (sort === "newest") return { createdAt: -1 };
  if (sort === "stock") return { stock: -1, createdAt: -1 };
  return { featured: -1, createdAt: -1 };
}

function localSort(req: Request) {
  const sort = String(req.query.sort || "featured");
  return (left: any, right: any) => {
    if (sort === "price-asc") return Number(left.price || 0) - Number(right.price || 0);
    if (sort === "price-desc") return Number(right.price || 0) - Number(left.price || 0);
    if (sort === "rating") return Number(right.rating || 0) - Number(left.rating || 0);
    if (sort === "newest") return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
    if (sort === "stock") return Number(right.stock || 0) - Number(left.stock || 0);
    return Number(right.featured) - Number(left.featured);
  };
}
