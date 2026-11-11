import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = Router();

router.use(protect, requireRole("customer"));

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;