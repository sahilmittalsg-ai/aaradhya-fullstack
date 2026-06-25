import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  listPublicCoupons,
  listCoupons,
  updateCoupon,
  validateCoupon
} from "../controllers/couponController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const couponRoutes = Router();

couponRoutes.post("/validate", validateCoupon);
couponRoutes.get("/public", listPublicCoupons);
couponRoutes.get("/", requireAuth, requireAdmin, listCoupons);
couponRoutes.post("/", requireAuth, requireAdmin, createCoupon);
couponRoutes.patch("/:id", requireAuth, requireAdmin, updateCoupon);
couponRoutes.delete("/:id", requireAuth, requireAdmin, deleteCoupon);
