import jwt from "jsonwebtoken";

export function signToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
}

export function normalizePhone(phone: unknown) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return digits.length === 10 ? `91${digits}` : digits;
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
