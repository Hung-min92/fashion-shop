import { Router } from "express";
import {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoryController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories);
router.post("/", protect, requireRole("admin"), createCategory);
router.put("/:id", protect, requireRole("admin"), updateCategory);
router.delete("/:id", protect, requireRole("admin"), deleteCategory);

export default router;