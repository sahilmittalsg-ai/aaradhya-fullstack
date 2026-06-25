import { NextFunction, Request, Response } from "express";
import { verifyToken, TokenRole } from "../utils/token.js";

export type AuthRequest = Request & {
  user?: { id: string; role: TokenRole };
};

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    if (payload.tokenType === "refresh") {
      return res.status(401).json({ message: "Access token required" });
    }
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) return next();

  try {
    const payload = verifyToken(token);
    if (payload.tokenType !== "refresh") {
      req.user = { id: payload.id, role: payload.role };
    }
  } catch {
    req.user = undefined;
  }

  return next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}
