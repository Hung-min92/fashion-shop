import express from "express";
import cors from "cors";
<<<<<<< HEAD
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
=======
>>>>>>> 7d8fa8aef4a666047977dc0eb9256fd0d89c1fe3

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

<<<<<<< HEAD
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);
=======
app.get("/api/hello", (req, res) => {
  res.status(200).json({ status: "ok", message: "Hello, welcome to my website" });
});
>>>>>>> 7d8fa8aef4a666047977dc0eb9256fd0d89c1fe3

export default app;