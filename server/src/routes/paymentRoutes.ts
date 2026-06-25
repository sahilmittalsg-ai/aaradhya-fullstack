import { Router } from "express";
import {
  createMockPayment,
  createPaymentMethod,
  listAdminPaymentMethods,
  listPaymentMethods,
  updatePaymentMethod
} from "../controllers/paymentController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const paymentRoutes = Router();

paymentRoutes.get("/methods", listPaymentMethods);
paymentRoutes.post("/mock-intent", createMockPayment);
paymentRoutes.get("/admin/methods", requireAuth, requireAdmin, listAdminPaymentMethods);
paymentRoutes.post("/admin/methods", requireAuth, requireAdmin, createPaymentMethod);
paymentRoutes.patch("/admin/methods/:id", requireAuth, requireAdmin, updatePaymentMethod);
