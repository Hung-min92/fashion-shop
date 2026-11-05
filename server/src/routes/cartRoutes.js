import { Router } from "express";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getCart);
router.post("/items", addItem);
router.patch("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);
router.delete("/", clearCart);

export default router;