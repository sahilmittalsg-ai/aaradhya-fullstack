import { Request, Response } from "express";
import { isDbConnected } from "../db/postgres.js";
import { readStore } from "../data/fileStore.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { buildCustomerDirectory } from "../utils/customerSegments.js";

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
