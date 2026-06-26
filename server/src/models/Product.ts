import { createCollectionModel } from "../db/documentModel.js";

export type ProductDocument = Record<string, any>;

export const Product = createCollectionModel("products", {
  defaults: () => ({
    subtitle: "",
    compareAtPrice: 0,
    stock: 0,
    rating: 4.8,
    images: [],
    tags: [],
    purpose: [],
    bead: "",
    mukhi: "",
    plating: "",
    audience: "",
    benefits: [],
    materials: [],
    sizeOptions: [],
    addOnServices: [],
    delivery: { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 },
    careInstructions: "",
    sku: "",
    featured: false,
    active: true
  })
});
