import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { protect, requireRole } from "./middleware/auth.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Origin không được phép"));
    },
  })
);

app.use(express.json({ limit: "100kb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều yêu cầu, vui lòng thử lại sau" },
});
app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "test" ? 1000 : 20,
  message: { message: "Thử đăng nhập quá nhiều lần, vui lòng thử lại sau" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server online" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.get("/api/admin/ping", protect, requireRole("admin"), (req, res) => {
  res.status(200).json({ message: "Xin chào admin" });
});
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;