import { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export async function dashboard(_req: Request, res: Response) {
  const [orders, products, customers] = await Promise.all([
    Order.find(),
    Product.find({ active: true }),
    User.find({ role: "client" })
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status !== "delivered").length;

  return res.json({
    revenue,
    orders: orders.length,
    pendingOrders,
    products: products.length,
    customers: customers.length,
    lowStock: products.filter((product) => product.stock <= 5).length,
    recentOrders: orders.slice(-6).reverse()
  });
}

export async function customers(_req: Request, res: Response) {
  const users = await User.find({ role: "client" }).select("-password").sort({ createdAt: -1 });
  return res.json(users);
}
