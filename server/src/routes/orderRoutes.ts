import { Router } from "express";
import {
  createOrder,
  cancelOrder,
  listOrders,
  trackOrder,
  updateOrderStatus
} from "../controllers/orderController.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";

export const orderRoutes = Router();

orderRoutes.post("/", optionalAuth, createOrder);
orderRoutes.get("/track/:orderNumber", trackOrder);
orderRoutes.post("/:id/cancel", optionalAuth, cancelOrder);
orderRoutes.get("/", requireAuth, requireAdmin, listOrders);
orderRoutes.patch("/:id", requireAuth, requireAdmin, updateOrderStatus);
