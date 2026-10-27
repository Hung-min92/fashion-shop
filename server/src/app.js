import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;