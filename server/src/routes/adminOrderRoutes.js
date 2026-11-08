import { Router } from "express";
import {
    listAdminOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, requireAdminOrViewerRead } from "../middleware/auth.js";


const router = Router();

router.use(protect, requireAdminOrViewerRead);

router.get("/", listAdminOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;