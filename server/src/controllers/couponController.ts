import { Request, Response } from "express";
import { isDbConnected } from "../db/postgres.js";
import { newId, readStore, writeStore } from "../data/fileStore.js";
import { Coupon } from "../models/Coupon.js";

export async function listCoupons(_req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    return res.json([...store.coupons].sort(sortNewestFirst));
  }

  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.json(coupons);
}

export async function listPublicCoupons(_req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    return res.json(store.coupons.filter((coupon) => coupon.active).sort(sortNewestFirst));
  }

  const coupons = await Coupon.find({ active: true }).sort({ createdAt: -1 });
  return res.json(coupons);
}

export async function createCoupon(req: Request, res: Response) {
  const payload = normalizeCouponPayload(req.body);
  if (!payload.code) return res.status(400).json({ message: "Coupon code is required" });

  if (!isDbConnected()) {
    const store = await readStore();
    const coupon = { ...payload, _id: newId("local-coupon"), createdAt: new Date().toISOString() };
    store.coupons.unshift(coupon);
    await writeStore(store);
    return res.status(201).json(coupon);
  }

  const coupon = await Coupon.create(payload);
  return res.status(201).json(coupon);
}

export async function validateCoupon(req: Request, res: Response) {
  const code = normalizeCode(req.body.code);
  const subtotal = Math.max(toNumber(req.body.subtotal), 0);
  if (!code) return res.status(400).json({ message: "Please enter a coupon code" });

  if (!isDbConnected()) {
    const store = await readStore();
    const coupon = findNewestActiveCoupon(store.coupons, code);

    if (!coupon) return res.status(404).json({ message: "Coupon is not active or available" });
    if (subtotal < toNumber(coupon.minSubtotal)) {
      return res.status(400).json({ message: `Add Rs.${Math.ceil(toNumber(coupon.minSubtotal) - subtotal)} more to use ${code}` });
    }

    const discount = calculateCouponDiscount(coupon, subtotal);
    return res.json({ coupon, discount });
  }

  const [coupon] = await Coupon.find({ code, active: true }).sort({ createdAt: -1 }).limit(1);

  if (!coupon) return res.status(404).json({ message: "Coupon is not active or available" });
  if (subtotal < toNumber(coupon.minSubtotal)) {
    return res.status(400).json({ message: `Add Rs.${Math.ceil(toNumber(coupon.minSubtotal) - subtotal)} more to use ${code}` });
  }

  const discount = calculateCouponDiscount(coupon, subtotal);
  return res.json({ coupon, discount });
}

export async function updateCoupon(req: Request, res: Response) {
  const patch = normalizeCouponPayload(req.body, true);

  if (!isDbConnected()) {
    const store = await readStore();
    const index = store.coupons.findIndex((coupon) => coupon._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Coupon not found" });
    store.coupons[index] = { ...store.coupons[index], ...patch };
    await writeStore(store);
    return res.json(store.coupons[index]);
  }

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  return res.json(coupon);
}

export async function deleteCoupon(req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    const index = store.coupons.findIndex((coupon) => coupon._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Coupon not found" });
    store.coupons[index].active = false;
    await writeStore(store);
    return res.json({ message: "Coupon disabled" });
  }

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  return res.json({ message: "Coupon disabled" });
}

function normalizeCouponPayload(input: Record<string, any>, partial = false) {
  const payload: Record<string, any> = partial ? {} : { active: true, type: "percent", value: 0, minSubtotal: 0 };

  if (input.code !== undefined) payload.code = normalizeCode(input.code);
  if (input.type !== undefined) payload.type = input.type === "flat" ? "flat" : "percent";
  if (input.value !== undefined) payload.value = Math.max(toNumber(input.value), 0);
  if (input.minSubtotal !== undefined) payload.minSubtotal = Math.max(toNumber(input.minSubtotal), 0);
  if (input.active !== undefined) payload.active = input.active !== false;

  return payload;
}

function normalizeCode(value: unknown) {
  return String(value || "").trim().toUpperCase();
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function calculateCouponDiscount(coupon: Record<string, any>, subtotal: number) {
  const value = toNumber(coupon.value);
  const discount = coupon.type === "percent" ? Math.round((subtotal * value) / 100) : value;
  return Math.min(Math.max(discount, 0), subtotal);
}

function findNewestActiveCoupon(coupons: Record<string, any>[], code: string) {
  return [...coupons].sort(sortNewestFirst).find((coupon) => normalizeCode(coupon.code) === code && coupon.active);
}

function sortNewestFirst(a: Record<string, any>, b: Record<string, any>) {
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}
