import { createCollectionModel } from "../db/documentModel.js";

export const SupportTicket = createCollectionModel("supporttickets", {
  defaults: () => ({ phone: "", orderNumber: "", category: "something-else", priority: "normal", status: "open", replies: [] })
});
