import { createCollectionModel } from "../db/documentModel.js";

export type PageDocument = Record<string, any>;

export const Page = createCollectionModel("pages", {
  defaults: () => ({ type: "policy", excerpt: "", content: "", active: true })
});
