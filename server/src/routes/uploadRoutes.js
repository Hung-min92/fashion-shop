import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { handleUpload } from "../middleware/upload.js";
import { uploadProductImage } from "../controllers/uploadController.js";

const router = Router();

router.post("/", protect, requireRole("admin"), handleUpload, uploadProductImage);

export default router;