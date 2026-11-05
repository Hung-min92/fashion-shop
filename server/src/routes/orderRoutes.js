import { Router } from "express";
import {
    createOrder,
    listMyOrders,
    getOrder,
    cancelMyOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";


const router = Router();

router.use(protect);

router.post("/", createOrder);
router.get("/my", listMyOrders);
router.get("/:id", getOrder);
router.patch("/:id/cancel", cancelMyOrder);
export default router;