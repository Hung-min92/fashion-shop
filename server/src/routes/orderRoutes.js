import { Router } from "express";
import {
    createOrder,
    createGuestOrder,
    lookupOrder,
    cancelGuestOrder,
    listMyOrders,
    getOrder,
    cancelMyOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Công khai: phải đặt TRƯỚC protect
router.post("/guest", createGuestOrder);
router.post("/lookup", lookupOrder);
router.post("/guest-cancel", cancelGuestOrder);

router.use(protect);
router.post("/", createOrder);
router.get("/my", listMyOrders);
router.get("/:id", getOrder);
router.patch("/:id/cancel", cancelMyOrder);

export default router;