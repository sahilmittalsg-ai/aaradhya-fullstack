import { Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { newId, readStore, writeStore } from "../data/fileStore.js";
import { AuthRequest } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { User } from "../models/User.js";

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user?.id).select("-password").populate("wishlist");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const allowed = ["name", "phone", "addresses"];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.user?.id, patch, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
}

export async function changePassword(req: AuthRequest, res: Response) {
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (!currentPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Current password and a new password with at least 6 characters are required" });
  }

  const user = await User.findById(req.user?.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  user.refreshTokenHash = "";
  await user.save();

  return res.json({ message: "Password changed successfully. Please login again." });
}

export async function myOrders(req: AuthRequest, res: Response) {
  const orders = await Order.find({ user: req.user?.id }).sort({ createdAt: -1 });
  return res.json(orders);
}

export async function assistantOrders(req: AuthRequest, res: Response) {
  const phone = normalizePhone(req.body.phone);
  if (phone.length < 8) return res.status(400).json({ message: "Linked mobile number is required" });
  const phoneTail = phone.slice(-10);

  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const orders = store.orders
      .filter((order) => normalizePhone(order.customer?.phone).endsWith(phoneTail))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return res.json(orders);
  }

  const orders = await Order.find({ "customer.phone": new RegExp(`${phoneTail}$`) }).sort({ createdAt: -1 });
  return res.json(orders);
}

export async function toggleWishlist(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user?.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const productId = req.params.productId;
  const exists = user.wishlist.some((item) => String(item) === productId);
  const update = exists ? { $pull: { wishlist: productId } } : { $addToSet: { wishlist: productId } };
  const updatedUser = await User.findByIdAndUpdate(user._id, update, { new: true }).select("wishlist");

  return res.json({ wishlist: updatedUser?.wishlist || [] });
}

export async function createSupportTicket(req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const now = new Date().toISOString();
    const ticket = {
      _id: newId("local-ticket"),
      user: req.user?.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || "",
      orderNumber: req.body.orderNumber || "",
      category: req.body.category || "something-else",
      subject: req.body.subject,
      message: req.body.message,
      priority: req.body.priority || "normal",
      status: "open",
      replies: [],
      createdAt: now,
      updatedAt: now
    };

    store.supportTickets.unshift(ticket);
    await writeStore(store);
    return res.status(201).json(ticket);
  }

  const ticket = await SupportTicket.create({
    user: req.user?.id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    orderNumber: req.body.orderNumber,
    category: req.body.category,
    subject: req.body.subject,
    message: req.body.message,
    priority: req.body.priority || "normal"
  });

  return res.status(201).json(ticket);
}

export async function mySupportTickets(req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const tickets = store.supportTickets.filter((ticket) => ticket.user === req.user?.id);
    return res.json(tickets);
  }

  const tickets = await SupportTicket.find({ user: req.user?.id }).sort({ createdAt: -1 });
  return res.json(tickets);
}

export async function listSupportTickets(_req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    return res.json(store.supportTickets);
  }

  const tickets = await SupportTicket.find().populate("user", "name email").sort({ createdAt: -1 });
  return res.json(tickets);
}

export async function updateSupportTicket(req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const ticket = store.supportTickets.find((item) => item._id === req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (req.body.status) ticket.status = req.body.status;
    if (req.body.priority) ticket.priority = req.body.priority;
    if (req.body.reply) {
      ticket.replies = ticket.replies || [];
      ticket.replies.push({
        message: req.body.reply,
        authorRole: "admin",
        createdAt: new Date().toISOString()
      });
    }
    ticket.updatedAt = new Date().toISOString();
    await writeStore(store);
    return res.json(ticket);
  }

  const patch: Record<string, unknown> = {};
  const set: Record<string, unknown> = {};

  if (req.body.status) set.status = req.body.status;
  if (req.body.priority) set.priority = req.body.priority;
  if (Object.keys(set).length) patch.$set = set;

  if (req.body.reply) {
    patch.$push = {
      replies: {
        message: req.body.reply,
        authorRole: "admin"
      }
    };
  }

  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  return res.json(ticket);
}

export async function replySupportTicket(req: AuthRequest, res: Response) {
  const message = String(req.body.message || "").trim();
  if (!message) return res.status(400).json({ message: "Reply message is required" });

  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const ticket = store.supportTickets.find((item) => item._id === req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canManageTicket(req, ticket)) return res.status(403).json({ message: "You cannot reply to this ticket" });

    ticket.replies = ticket.replies || [];
    ticket.replies.push({
      message,
      authorRole: req.user?.role === "admin" ? "admin" : "client",
      createdAt: new Date().toISOString()
    });
    ticket.status = ticket.status === "resolved" ? "in-progress" : ticket.status;
    ticket.updatedAt = new Date().toISOString();
    await writeStore(store);
    return res.json(ticket);
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  if (!canManageTicket(req, ticket)) return res.status(403).json({ message: "You cannot reply to this ticket" });

  ticket.replies.push({
    message,
    authorRole: req.user?.role === "admin" ? "admin" : "client",
    createdAt: new Date()
  });
  if (ticket.status === "resolved") ticket.status = "in-progress";
  await ticket.save();
  return res.json(ticket);
}

export async function closeSupportTicket(req: AuthRequest, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    const store = await readStore();
    const ticket = store.supportTickets.find((item) => item._id === req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canManageTicket(req, ticket)) return res.status(403).json({ message: "You cannot close this ticket" });

    ticket.status = "resolved";
    ticket.updatedAt = new Date().toISOString();
    await writeStore(store);
    return res.json(ticket);
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  if (!canManageTicket(req, ticket)) return res.status(403).json({ message: "You cannot close this ticket" });

  ticket.status = "resolved";
  await ticket.save();
  return res.json(ticket);
}

function normalizePhone(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function canManageTicket(req: AuthRequest, ticket: any) {
  return req.user?.role === "admin" || (req.user?.id && String(ticket.user || "") === req.user.id);
}
