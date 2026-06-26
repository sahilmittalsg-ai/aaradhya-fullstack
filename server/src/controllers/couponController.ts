import { Request, Response } from "express";
import { isDbConnected } from "../db/postgres.js";
import { newId, readStore, writeStore } from "../data/fileStore.js";
import { Coupon } from "../models/Coupon.js";

export async function listCoupons(_req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    return res.json(store.coupons);
  }

  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.json(coupons);
}

export async function listPublicCoupons(_req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    return res.json(store.coupons.filter((coupon) => coupon.active));
  }

  const coupons = await Coupon.find({ active: true }).sort({ createdAt: -1 });
  return res.json(coupons);
}

export async function createCoupon(req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    const coupon = { ...req.body, _id: newId("local-coupon"), code: String(req.body.code).toUpperCase(), active: req.body.active !== false };
    store.coupons.unshift(coupon);
    await writeStore(store);
    return res.status(201).json(coupon);
  }

  const coupon = await Coupon.create({ ...req.body, code: String(req.body.code).toUpperCase() });
  return res.status(201).json(coupon);
}

export async function validateCoupon(req: Request, res: Response) {
  const { code, subtotal } = req.body;
  if (!isDbConnected()) {
    const store = await readStore();
    const coupon = store.coupons.find((item) => item.code === String(code).toUpperCase() && item.active);

    if (!coupon || Number(subtotal) < coupon.minSubtotal) {
      return res.status(404).json({ message: "Coupon is not valid for this cart" });
    }

    const discount = coupon.type === "percent" ? Math.round((Number(subtotal) * coupon.value) / 100) : coupon.value;
    return res.json({ coupon, discount });
  }

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), active: true });

  if (!coupon || Number(subtotal) < coupon.minSubtotal) {
    return res.status(404).json({ message: "Coupon is not valid for this cart" });
  }

  const discount = coupon.type === "percent" ? Math.round((Number(subtotal) * coupon.value) / 100) : coupon.value;
  return res.json({ coupon, discount });
}

export async function updateCoupon(req: Request, res: Response) {
  if (!isDbConnected()) {
    const store = await readStore();
    const index = store.coupons.findIndex((coupon) => coupon._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Coupon not found" });
    const patch = { ...req.body };
    if (patch.code) patch.code = String(patch.code).toUpperCase();
    store.coupons[index] = { ...store.coupons[index], ...patch };
    await writeStore(store);
    return res.json(store.coupons[index]);
  }

  const patch = { ...req.body };
  if (patch.code) patch.code = String(patch.code).toUpperCase();

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
