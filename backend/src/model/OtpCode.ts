import { createCollectionModel } from "../db/documentModel.js";

export const OtpCode = createCollectionModel("otpcodes", {
  defaults: () => ({ purpose: "login", attempts: 0, consumedAt: null })
});
