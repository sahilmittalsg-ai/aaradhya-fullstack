import { createCollectionModel } from "../db/documentModel.js";

export type CategoryDocument = Record<string, any>;

export const Category = createCollectionModel("categories", {
  defaults: () => ({ description: "", image: "", featured: false, active: true })
});
