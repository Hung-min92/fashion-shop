import { Router } from "express";
import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { protect, requireRole } from "../middleware/auth.js";
import {
    listReviews,
    getMyReviewStatus,
    createReview,
} from "../controllers/reviewController.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.get("/:productId/reviews", listReviews);
router.get("/:productId/reviews/me", protect, getMyReviewStatus);
router.post("/:productId/reviews", protect, requireRole("customer"), createReview);

router.post("/", protect, requireRole("admin"), createProduct);
router.put("/:id", protect, requireRole("admin"), updateProduct);
router.delete("/:id", protect, requireRole("admin"), deleteProduct);

export default router;