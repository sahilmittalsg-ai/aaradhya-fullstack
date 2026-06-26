import { createCollectionModel } from "../db/documentModel.js";

export const Category = createCollectionModel("categories", {
  defaults: () => ({ description: "", image: "", featured: false, active: true })
});
