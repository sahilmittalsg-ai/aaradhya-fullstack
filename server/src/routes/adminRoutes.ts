import { Router } from "express";
import { customers, dashboard } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireAdmin);
adminRoutes.get("/dashboard", dashboard);
adminRoutes.get("/customers", customers);
