import bcrypt from "bcryptjs";
import { createCollectionModel } from "../db/documentModel.js";

export const User = createCollectionModel("users", {
  defaults: () => ({
    role: "client",
    phone: "",
    phoneVerifiedAt: null,
    addresses: [],
    wishlist: []
  }),
  beforeSave: async (doc, original) => {
    if (doc.password && doc.password !== original?.password && !String(doc.password).startsWith("$2")) {
      doc.password = await bcrypt.hash(doc.password, 10);
    }
  }
});
