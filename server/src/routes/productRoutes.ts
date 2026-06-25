import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from "../controllers/productController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.get("/:slug", getProduct);
productRoutes.post("/", requireAuth, requireAdmin, createProduct);
productRoutes.patch("/:id", requireAuth, requireAdmin, updateProduct);
productRoutes.delete("/:id", requireAuth, requireAdmin, deleteProduct);
