import bcrypt from "bcryptjs";
import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "client"], default: "client" },
    phone: { type: String, default: "", index: true },
    phoneVerifiedAt: { type: Date, default: null },
    refreshTokenHash: { type: String, default: "" },
    passwordResetTokenHash: { type: String, default: "" },
    passwordResetExpiresAt: { type: Date, default: null },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    addresses: [
      {
        line1: String,
        line2: { type: String, default: "" },
        city: String,
        state: String,
        pincode: String
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.password);
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  comparePassword(password: string): Promise<boolean>;
};

export const User = mongoose.model("User", userSchema);
