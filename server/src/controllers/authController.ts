import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { OtpCode } from "../models/OtpCode.js";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/token.js";

type LocalOtp = {
  codeHash: string;
  attempts: number;
  expiresAt: number;
};

type LocalUser = {
  id: string;
  name: string;
  email: string;
  role: "client";
  phone: string;
  phoneVerifiedAt: string;
  addresses: unknown[];
  refreshTokenHash?: string;
};

const localOtps = new Map<string, LocalOtp>();
const localUsers = new Map<string, LocalUser>();
const localRefreshTokens = new Map<string, string>();

export async function register(req: Request, res: Response) {
  const { name, email, password, phone } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password || String(password).length < 6) {
    return res.status(400).json({ message: "Name, valid email, and password with at least 6 characters are required" });
  }

  const exists = await User.findOne({ email: normalizedEmail });

  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({ name, email: normalizedEmail, password, phone, role: "client" });
  return sendAuthResponse(res, user, 201);
}

export async function login(req: Request, res: Response) {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (mongoose.connection.readyState !== 1 && email === "admin@demo.com" && password === "admin123") {
    const user = {
      id: "local-admin",
      name: "Admin User",
      email,
      role: "admin",
      phone: "9999999999",
      addresses: []
    };
    const tokens = await issueTokens(user.id, "admin");
    localRefreshTokens.set(user.id, await bcrypt.hash(tokens.refreshToken, 10));
    return res.json({ ...tokens, token: tokens.accessToken, user });
  }

  let user = await User.findOne({ email });

  if (!user && email === "admin@demo.com" && password === "admin123") {
    user = await User.create({
      name: "Admin User",
      email,
      password,
      role: "admin",
      phone: "9999999999"
    });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return sendAuthResponse(res, user);
}

export async function requestOtp(req: Request, res: Response) {
  const phone = normalizePhone(req.body.phone);
  if (!phone) return res.status(400).json({ message: "Valid mobile number is required" });

  const developmentOtpMode = isDevelopmentOtpMode();
  const code = developmentOtpMode ? process.env.OTP_DEV_CODE || "123456" : generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || 5);
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  const smsResult = developmentOtpMode ? { sent: false, reason: "Twilio environment values are missing" } : await sendOtpSms(phone, code);

  if (mongoose.connection.readyState !== 1) {
    localOtps.set(phone, { codeHash, attempts: 0, expiresAt });
    return res.status(201).json({
      message: smsResult.sent ? "OTP sent successfully" : "OTP generated. SMS provider is not configured.",
      phone,
      expiresInSeconds: ttlMinutes * 60,
      smsSent: smsResult.sent,
      devOtp: process.env.NODE_ENV === "production" ? undefined : code
    });
  }

  await OtpCode.deleteMany({ phone, purpose: "login", consumedAt: null });
  await OtpCode.create({
    phone,
    codeHash,
    purpose: "login",
    expiresAt: new Date(expiresAt)
  });

  return res.status(201).json({
    message: smsResult.sent ? "OTP sent successfully" : "OTP generated. SMS provider is not configured.",
    phone,
    expiresInSeconds: ttlMinutes * 60,
    smsSent: smsResult.sent,
    devOtp: process.env.NODE_ENV === "production" ? undefined : code
  });
}

export async function verifyOtp(req: Request, res: Response) {
  const phone = normalizePhone(req.body.phone);
  const code = String(req.body.code || "").trim();

  if (!phone || code.length !== 6) {
    return res.status(400).json({ message: "Mobile number and 6 digit OTP are required" });
  }

  if (mongoose.connection.readyState !== 1) {
    const otp = localOtps.get(phone);
    if (!otp || otp.expiresAt < Date.now()) {
      localOtps.delete(phone);
      return res.status(401).json({ message: "OTP expired or not found" });
    }
    if (otp.attempts >= 5) return res.status(429).json({ message: "Too many OTP attempts" });

    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      otp.attempts += 1;
      return res.status(401).json({ message: "Invalid OTP" });
    }

    localOtps.delete(phone);

    const existing = localUsers.get(phone);
    const user: LocalUser =
      existing ||
      {
        id: `local-user-${phone}`,
        name: req.body.name || `Customer ${phone.slice(-4)}`,
        email: req.body.email || `${phone}@otp.local`,
        phone,
        phoneVerifiedAt: new Date().toISOString(),
        role: "client" as const,
        addresses: []
      };
    localUsers.set(phone, user);

    const tokens = await issueTokens(user.id, user.role);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    localRefreshTokens.set(user.id, user.refreshTokenHash);
    localUsers.set(phone, user);
    return res.json({ ...tokens, token: tokens.accessToken, user });
  }

  const otp = await OtpCode.findOne({
    phone,
    purpose: "login",
    consumedAt: null,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!otp) return res.status(401).json({ message: "OTP expired or not found" });
  if (otp.attempts >= 5) return res.status(429).json({ message: "Too many OTP attempts" });

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    otp.attempts += 1;
    await otp.save();
    return res.status(401).json({ message: "Invalid OTP" });
  }

  otp.consumedAt = new Date();
  await otp.save();

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      name: req.body.name || `Customer ${phone.slice(-4)}`,
      email: req.body.email || `${phone}@otp.local`,
      phone,
      phoneVerifiedAt: new Date(),
      password: `${phone}-${Date.now()}`,
      role: "client"
    });
  } else if (!user.phoneVerifiedAt) {
    user.phoneVerifiedAt = new Date();
    await user.save();
  }

  return sendAuthResponse(res, user);
}

export async function refreshToken(req: Request, res: Response) {
  const refreshTokenValue = String(req.body.refreshToken || "").trim();
  if (!refreshTokenValue) return res.status(400).json({ message: "Refresh token is required" });

  try {
    const payload = verifyToken(refreshTokenValue);
    if (payload.tokenType !== "refresh") return res.status(401).json({ message: "Refresh token is invalid" });

    if (mongoose.connection.readyState !== 1) {
      const hash = localRefreshTokens.get(payload.id);
      if (!hash || !(await bcrypt.compare(refreshTokenValue, hash))) {
        return res.status(401).json({ message: "Refresh token is invalid" });
      }
      const tokens = await issueTokens(payload.id, payload.role);
      localRefreshTokens.set(payload.id, await bcrypt.hash(tokens.refreshToken, 10));
      return res.json({ ...tokens, token: tokens.accessToken });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokenHash || !(await bcrypt.compare(refreshTokenValue, user.refreshTokenHash))) {
      return res.status(401).json({ message: "Refresh token is invalid" });
    }

    return sendAuthResponse(res, user);
  } catch {
    return res.status(401).json({ message: "Refresh token is invalid" });
  }
}

export async function logout(req: Request, res: Response) {
  const refreshTokenValue = String(req.body.refreshToken || "").trim();

  try {
    if (refreshTokenValue) {
      const payload = verifyToken(refreshTokenValue);
      localRefreshTokens.delete(payload.id);
      if (mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(payload.id, { refreshTokenHash: "" });
      }
    }
  } catch {
    // Logout remains idempotent even if the client sends an expired token.
  }

  return res.json({ message: "Logged out successfully" });
}

export async function forgotPassword(req: Request, res: Response) {
  const email = normalizeEmail(req.body.email);
  if (!email) return res.status(400).json({ message: "Valid email is required" });

  const user = await User.findOne({ email });
  const resetToken = crypto.randomBytes(32).toString("hex");

  if (user) {
    user.passwordResetTokenHash = hashResetToken(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + Number(process.env.PASSWORD_RESET_TTL_MINUTES || 15) * 60 * 1000);
    await user.save();
  }

  return res.json({
    message: "If an account exists for this email, password reset instructions have been generated.",
    resetToken: process.env.NODE_ENV === "production" ? undefined : user ? resetToken : undefined
  });
}

export async function resetPassword(req: Request, res: Response) {
  const resetToken = String(req.body.token || "").trim();
  const password = String(req.body.password || "");

  if (!resetToken || password.length < 6) {
    return res.status(400).json({ message: "Reset token and a password with at least 6 characters are required" });
  }

  const user = await User.findOne({
    passwordResetTokenHash: hashResetToken(resetToken),
    passwordResetExpiresAt: { $gt: new Date() }
  });

  if (!user) return res.status(401).json({ message: "Reset token is invalid or expired" });

  user.password = password;
  user.passwordResetTokenHash = "";
  user.passwordResetExpiresAt = null;
  user.refreshTokenHash = "";
  await user.save();

  return res.json({ message: "Password reset successfully" });
}

function toPublicUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    phoneVerifiedAt: user.phoneVerifiedAt,
    addresses: user.addresses
  };
}

async function sendAuthResponse(res: Response, user: any, status = 200) {
  const tokens = await issueTokens(String(user._id || user.id), user.role);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await user.save?.();
  return res.status(status).json({
    ...tokens,
    token: tokens.accessToken,
    user: toPublicUser(user)
  });
}

async function issueTokens(id: string, role: "admin" | "client" | "user") {
  return {
    accessToken: signAccessToken({ id, role }),
    refreshToken: signRefreshToken({ id, role }),
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
  };
}

function normalizeEmail(email: unknown) {
  const value = String(email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : "";
}

function normalizePhone(phone: unknown) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return digits.length === 10 ? `91${digits}` : digits;
}

function isDevelopmentOtpMode() {
  return !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpSms(phone: string, code: string) {
  const provider = (process.env.SMS_PROVIDER || "twilio").toLowerCase();

  if (provider === "twilio") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !from) {
      return { sent: false, reason: "Twilio environment values are missing" };
    }

    const body = new URLSearchParams({
      To: `+${phone}`,
      From: from,
      Body: `Your Japam login OTP is ${code}. It is valid for ${process.env.OTP_TTL_MINUTES || 5} minutes.`
    });
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "SMS request failed");
      throw new Error(`SMS provider failed: ${error}`);
    }

    return { sent: true };
  }

  return { sent: false, reason: "SMS_PROVIDER is not configured" };
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
