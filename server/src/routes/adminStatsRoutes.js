import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { getStats } from "../controllers/statsController.js";

const router = Router();

router.get("/", protect, requireRole("admin"), getStats);

export default router;