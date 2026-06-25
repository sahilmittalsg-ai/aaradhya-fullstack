import { NextFunction, Request, Response } from "express";

const dangerousKeys = new Set(["__proto__", "constructor", "prototype"]);

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
}

function sanitizeValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item)) as T;

  if (value && typeof value === "object") {
    const clean: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      if (dangerousKeys.has(key) || key.startsWith("$") || key.includes(".")) return;
      clean[key] = sanitizeValue(entry);
    });
    return clean as T;
  }

  return value;
}
