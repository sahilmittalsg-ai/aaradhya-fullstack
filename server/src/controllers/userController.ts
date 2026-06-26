import { Response } from "express";
import bcrypt from "bcryptjs";
import { isDbConnected } from "../db/postgres.js";
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
  const userId = String(req.user?.id || "");
  const { email, phoneTail } = await getCurrentUserContact(userId);

  if (!isDbConnected()) {
    const store = await readStore();
    const orders = store.orders
      .filter((order) => recordBelongsToUser(order, userId, email, phoneTail))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return res.json(orders);
  }

  const orders = (await Order.find())
    .filter((order: any) => recordBelongsToUser(order, userId, email, phoneTail))
    .sort((a: any, b: any) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return res.json(orders);
}

export async function assistantOrders(req: AuthRequest, res: Response) {
  const phone = normalizePhone(req.body.phone);
  const email = normalizeEmail(req.body.email);
  if (phone.length < 8 && !email) return res.status(400).json({ message: "Linked mobile number or email is required" });
  const phoneTail = phone.slice(-10);

  if (!isDbConnected()) {
    const store = await readStore();
    const orders = store.orders
      .filter((order) => recordBelongsToUser(order, "", email, phoneTail))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return res.json(orders);
  }

  const orders = (await Order.find())
    .filter((order: any) => recordBelongsToUser(order, "", email, phoneTail))
    .sort((a: any, b: any) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return res.json(orders);
}

export async function toggleWishlist(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user?.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const productId = req.params.productId;
  const exists = user.wishlist.some((item: any) => String(item) === productId);
  const update = exists ? { $pull: { wishlist: productId } } : { $addToSet: { wishlist: productId } };
  const updatedUser = await User.findByIdAndUpdate(user._id, update, { new: true }).select("wishlist");

  return res.json({ wishlist: updatedUser?.wishlist || [] });
}

export async function createSupportTicket(req: AuthRequest, res: Response) {
  if (!isDbConnected()) {
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
  const userId = String(req.user?.id || "");
  const { email, phoneTail } = await getCurrentUserContact(userId);

  if (!isDbConnected()) {
    const store = await readStore();
    const tickets = store.supportTickets
      .filter((ticket) => recordBelongsToUser(ticket, userId, email, phoneTail))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return res.json(tickets);
  }

  const tickets = (await SupportTicket.find())
    .filter((ticket: any) => recordBelongsToUser(ticket, userId, email, phoneTail))
    .sort((a: any, b: any) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return res.json(tickets);
}

export async function listSupportTickets(_req: AuthRequest, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    return res.json(store.supportTickets);
  }

  const tickets = await SupportTicket.find().populate("user", "name email").sort({ createdAt: -1 });
  return res.json(tickets);
}

export async function updateSupportTicket(req: AuthRequest, res: Response) {
  if (!isDbConnected()) {
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
        authorRole: "admin",
        createdAt: new Date().toISOString()
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

  if (!isDbConnected()) {
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
  if (!isDbConnected()) {
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

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

async function getCurrentUserContact(userId: string) {
  if (!userId) return { email: "", phoneTail: "" };

  if (!isDbConnected()) {
    const localIdentifier = userId.startsWith("local-user-") ? userId.slice("local-user-".length) : "";
    return {
      email: normalizeEmail(localIdentifier),
      phoneTail: normalizePhone(localIdentifier).slice(-10)
    };
  }

  const currentUser = await User.findById(userId).select("email phone");
  return {
    email: normalizeEmail(currentUser?.email),
    phoneTail: normalizePhone(currentUser?.phone).slice(-10)
  };
}

function recordBelongsToUser(record: any, userId: string, email: string, phoneTail: string) {
  if (userId && String(record.user || "") === userId) return true;

  const recordEmail = normalizeEmail(record.customer?.email || record.email);
  const recordPhone = normalizePhone(record.customer?.phone || record.phone);

  return Boolean(
    (email && recordEmail === email) ||
      (phoneTail.length >= 8 && recordPhone.endsWith(phoneTail))
  );
}

function canManageTicket(req: AuthRequest, ticket: any) {
  return req.user?.role === "admin" || (req.user?.id && String(ticket.user || "") === req.user.id);
}
