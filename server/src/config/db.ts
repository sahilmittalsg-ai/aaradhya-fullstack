import mongoose from "mongoose";

export async function connectDb(uri: string) {
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  console.log("MongoDB connected");
}
