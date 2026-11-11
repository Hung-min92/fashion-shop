import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { updateReview, deleteReview } from "../controllers/reviewController.js";

const router = Router();

router.put("/:id", protect, requireRole("customer"), updateReview);
router.delete("/:id", protect, requireRole("customer", "admin"), deleteReview);

export default router;