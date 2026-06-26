import { createCollectionModel } from "../db/documentModel.js";

export type HomeSectionDocument = Record<string, any>;

export const HomeSection = createCollectionModel("homesections", {
  defaults: () => ({ title: "", subtitle: "", type: "custom", sortOrder: 0, active: true, items: [] })
});
