import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { connectDb } from "./config/db.js";
import { apiRoutes } from "./routes/index.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/api", apiRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: err.message || "Server error" });
});

connectDb()
  .then(() => app.listen(port, () => console.log(`Backend API running on ${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
