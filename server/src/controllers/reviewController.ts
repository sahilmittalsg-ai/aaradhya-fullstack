import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";

export async function listProductReviews(req: AuthRequest, res: Response) {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: "Product not found" });

  const reviews = await Review.find({ product: product._id, approved: true }).sort({ createdAt: -1 });
  return res.json(reviews);
}

export async function createReview(req: AuthRequest, res: Response) {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: "Product not found" });

  let verifiedPurchase = false;
  if (req.body.orderNumber) {
    const order = await Order.findOne({
      orderNumber: req.body.orderNumber,
      "items.product": product._id
    });
    verifiedPurchase = Boolean(order);
  }

  const review = await Review.create({
    product: product._id,
    user: req.user?.id,
    name: req.body.name,
    rating: req.body.rating,
    comment: req.body.comment,
    orderNumber: req.body.orderNumber,
    verifiedPurchase
  });

  const reviews = await Review.find({ product: product._id, approved: true });
  const rating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(product._id, { rating: Number(rating.toFixed(1)) });

  return res.status(201).json(review);
}

export async function listReviews(_req: AuthRequest, res: Response) {
  const reviews = await Review.find().populate("product", "title slug").sort({ createdAt: -1 });
  return res.json(reviews);
}

export async function updateReview(req: AuthRequest, res: Response) {
  const existing = await Review.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Review not found" });

  if (!canManageReview(req, existing)) {
    return res.status(403).json({ message: "You can only edit your own reviews" });
  }

  const allowed = req.user?.role === "admin" ? ["name", "rating", "comment", "orderNumber", "approved"] : ["name", "rating", "comment", "orderNumber"];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const review = await Review.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!review) return res.status(404).json({ message: "Review not found" });
  await refreshProductRating(review.product);
  return res.json(review);
}

export async function deleteReview(req: AuthRequest, res: Response) {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  if (!canManageReview(req, review)) {
    return res.status(403).json({ message: "You can only delete your own reviews" });
  }

  const productId = review.product;
  await review.deleteOne();
  await refreshProductRating(productId);
  return res.json({ message: "Review deleted" });
}

function canManageReview(req: AuthRequest, review: any) {
  return req.user?.role === "admin" || (req.user?.id && String(review.user || "") === req.user.id);
}

async function refreshProductRating(productId: mongoose.Types.ObjectId) {
  const reviews = await Review.find({ product: productId, approved: true });
  const rating = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 4.8;
  await Product.findByIdAndUpdate(productId, { rating: Number(rating.toFixed(1)) });
}
