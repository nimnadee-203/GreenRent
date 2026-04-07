import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createEcoRatingHandler,
  listEcoRatingsHandler,
  getEcoRatingByIdHandler,
  updateEcoRatingHandler,
  deleteEcoRatingHandler,
} from "../controllers/ecoRatingController.js";

const router = Router();

// Public routes - Anyone can view eco ratings
router.get("/", listEcoRatingsHandler);
router.get("/:id", getEcoRatingByIdHandler);

// Protected routes - Sellers/Admins can create/modify eco ratings
// Keep "landlord" for backward compatibility with older tokens/role naming.
router.post("/", authenticate, authorize("seller", "landlord", "admin"), createEcoRatingHandler);
router.put("/:id", authenticate, authorize("seller", "landlord", "admin"), updateEcoRatingHandler);
router.delete("/:id", authenticate, authorize("admin"), deleteEcoRatingHandler);

export default router;
