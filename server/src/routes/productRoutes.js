import { Router } from "express";
import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);

router.post("/", protect, requireRole("admin"), createProduct);
router.put("/:id", protect, requireRole("admin"), updateProduct);
router.delete("/:id", protect, requireRole("admin"), deleteProduct);

export default router;