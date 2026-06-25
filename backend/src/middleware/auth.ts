import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & {
  user?: {
    id: string;
    role: "admin" | "client";
  };
};

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : "";

  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as AuthRequest["user"];
  } catch {
    req.user = undefined;
  }

  return next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  optionalAuth(req, res, () => undefined);
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  return next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}
