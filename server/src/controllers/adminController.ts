import { Request, Response } from "express";
import { isDbConnected } from "../db/postgres.js";
import { readStore } from "../data/fileStore.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export async function dashboard(_req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    const orders = store.orders;
    const products = store.products.filter((product: any) => product.active !== false);
    const customers = buildCustomerDirectory([], orders);

    return res.json({
      revenue: orders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0),
      orders: orders.length,
      pendingOrders: orders.filter((order: any) => order.status !== "delivered").length,
      products: products.length,
      customers: customers.length,
      lowStock: products.filter((product: any) => Number(product.stock || 0) <= 5).length,
      recentOrders: orders.slice(0, 6)
    });
  }

  const [orders, products, customers] = await Promise.all([
    Order.find(),
    Product.find({ active: true }),
    User.find({ role: "client" })
  ]);
  const customerRows = buildCustomerDirectory(customers, orders);

  const revenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
  const pendingOrders = orders.filter((order: any) => order.status !== "delivered").length;

  return res.json({
    revenue,
    orders: orders.length,
    pendingOrders,
    products: products.length,
    customers: customerRows.length,
    lowStock: products.filter((product: any) => product.stock <= 5).length,
    recentOrders: orders.slice(-6).reverse()
  });
}

export async function customers(_req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    return res.json(buildCustomerDirectory([], store.orders));
  }

  const [users, orders] = await Promise.all([
    User.find({ role: "client" }).select("-password").sort({ createdAt: -1 }),
    Order.find()
  ]);

  return res.json(buildCustomerDirectory(users, orders));
}

function buildCustomerDirectory(users: any[], orders: any[]) {
  const rows = new Map<string, any>();

  users.forEach((user) => {
    const email = normalizeEmail(user.email);
    const phone = normalizePhone(user.phone);
    const key = customerKey({ userId: user._id || user.id, email, phone });

    rows.set(key, {
      ...toPublicCustomer(user),
      _id: String(user._id || user.id || key),
      id: String(user._id || user.id || key),
      name: user.name || email || phone || "Customer",
      email,
      phone,
      orders: 0,
      spent: 0,
      segment: "New"
    });
  });

  orders.forEach((order) => {
    const email = normalizeEmail(order.customer?.email);
    const phone = normalizePhone(order.customer?.phone);
    const linkedKey = customerKey({ userId: order.user, email, phone });
    const existingKey = findExistingCustomerKey(rows, order.user, email, phone) || linkedKey;
    const current =
      rows.get(existingKey) ||
      {
        _id: existingKey,
        id: existingKey,
        name: String(order.customer?.name || email || phone || "Customer"),
        email,
        phone,
        createdAt: order.createdAt,
        orders: 0,
        spent: 0,
        segment: "New"
      };

    current.name = current.name || order.customer?.name || "Customer";
    current.email = current.email || email;
    current.phone = current.phone || phone;
    current.createdAt = current.createdAt || order.createdAt;
    current.orders = Number(current.orders || 0) + 1;
    current.spent = Number(current.spent || 0) + Number(order.total || 0);
    current.segment = current.orders >= 5 ? "Loyal" : current.orders > 0 ? "Buyer" : "New";
    rows.set(existingKey, current);
  });

  return [...rows.values()].sort((left, right) =>
    String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
  );
}

function findExistingCustomerKey(rows: Map<string, any>, userId: unknown, email: string, phone: string) {
  const candidates = [
    userId ? `user:${String(userId)}` : "",
    email ? `email:${email}` : "",
    phone ? `phone:${phone}` : ""
  ].filter(Boolean);

  const directMatch = candidates.find((key) => rows.has(key));
  if (directMatch) return directMatch;

  for (const [key, customer] of rows.entries()) {
    const customerEmail = normalizeEmail(customer.email);
    const customerPhone = normalizePhone(customer.phone);
    if (email && customerEmail === email) return key;
    if (phone && customerPhone === phone) return key;
  }

  return undefined;
}

function customerKey({ userId, email, phone }: { userId?: unknown; email?: string; phone?: string }) {
  if (userId) return `user:${String(userId)}`;
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `customer:${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function toPublicCustomer(user: any) {
  const output = JSON.parse(JSON.stringify(user || {}));
  delete output.password;
  delete output.refreshTokenHash;
  delete output.passwordResetTokenHash;
  return output;
}
