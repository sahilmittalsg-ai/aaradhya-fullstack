import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "../controllers/categoryController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", listCategories);
categoryRoutes.post("/", requireAuth, requireAdmin, createCategory);
categoryRoutes.patch("/:id", requireAuth, requireAdmin, updateCategory);
categoryRoutes.delete("/:id", requireAuth, requireAdmin, deleteCategory);
