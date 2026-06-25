import { Router } from "express";
import {
  createReview,
  deleteReview,
  listProductReviews,
  listReviews,
  updateReview
} from "../controllers/reviewController.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";

export const reviewRoutes = Router();

reviewRoutes.get("/product/:slug", listProductReviews);
reviewRoutes.post("/product/:slug", optionalAuth, createReview);
reviewRoutes.get("/", requireAuth, requireAdmin, listReviews);
reviewRoutes.patch("/:id", requireAuth, updateReview);
reviewRoutes.delete("/:id", requireAuth, deleteReview);
