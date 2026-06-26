import { createCollectionModel } from "../db/documentModel.js";

export type ReviewDocument = Record<string, any>;

export const Review = createCollectionModel("reviews", {
  defaults: () => ({ rating: 5, comment: "", orderNumber: "", verifiedPurchase: false, approved: true })
});
