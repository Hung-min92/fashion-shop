import { Router } from "express";
import {
    listAdminOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireRole("admin"));

router.get("/", listAdminOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;