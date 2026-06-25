import { Router } from "express";
import {
  createSupportTicket,
  assistantOrders,
  changePassword,
  getProfile,
  listSupportTickets,
  myOrders,
  mySupportTickets,
  closeSupportTicket,
  replySupportTicket,
  toggleWishlist,
  updateProfile,
  updateSupportTicket
} from "../controllers/userController.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";

export const userRoutes = Router();

userRoutes.get("/me", requireAuth, getProfile);
userRoutes.patch("/me", requireAuth, updateProfile);
userRoutes.patch("/me/password", requireAuth, changePassword);
userRoutes.get("/me/orders", requireAuth, myOrders);
userRoutes.post("/me/wishlist/:productId", requireAuth, toggleWishlist);
userRoutes.post("/assistant/orders", optionalAuth, assistantOrders);
userRoutes.post("/support", optionalAuth, createSupportTicket);
userRoutes.get("/support/my", requireAuth, mySupportTickets);
userRoutes.post("/support/:id/replies", requireAuth, replySupportTicket);
userRoutes.patch("/support/:id/close", requireAuth, closeSupportTicket);
userRoutes.get("/support", requireAuth, requireAdmin, listSupportTickets);
userRoutes.patch("/support/:id", requireAuth, requireAdmin, updateSupportTicket);
