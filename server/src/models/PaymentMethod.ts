import { createCollectionModel } from "../db/documentModel.js";

export type PaymentMethodDocument = Record<string, any>;

export const PaymentMethod = createCollectionModel("paymentmethods", {
  defaults: () => ({ description: "", type: "online", provider: "mock", instructions: "", fee: 0, active: true, sortOrder: 0, apps: [] })
});
