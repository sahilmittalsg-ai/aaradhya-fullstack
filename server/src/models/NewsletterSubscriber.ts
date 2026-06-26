import { createCollectionModel } from "../db/documentModel.js";

export type NewsletterSubscriberDocument = Record<string, any>;

export const NewsletterSubscriber = createCollectionModel("newslettersubscribers", {
  defaults: () => ({ source: "website", active: true })
});
