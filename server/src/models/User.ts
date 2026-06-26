import bcrypt from "bcryptjs";
import { createCollectionModel } from "../db/documentModel.js";

export type UserDocument = Record<string, any> & {
  comparePassword(password: string): Promise<boolean>;
};

export const User = createCollectionModel("users", {
  defaults: () => ({
    role: "client",
    phone: "",
    phoneVerifiedAt: null,
    refreshTokenHash: "",
    passwordResetTokenHash: "",
    passwordResetExpiresAt: null,
    wishlist: [],
    addresses: []
  }),
  beforeSave: async (doc, original) => {
    if (doc.password && doc.password !== original?.password && !String(doc.password).startsWith("$2")) {
      doc.password = await bcrypt.hash(doc.password, 10);
    }
  }
});
