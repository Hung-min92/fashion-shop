import { Router } from "express";
import { protect, requireAdminOrViewerRead } from "../middleware/auth.js";

import { getStats } from "../controllers/statsController.js";

const router = Router();

router.get("/", protect, requireAdminOrViewerRead, getStats);

export default router;