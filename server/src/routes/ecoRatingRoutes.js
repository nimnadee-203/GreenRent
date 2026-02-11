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

// Protected routes - Only landlords and admins can create/modify eco ratings
router.post("/", authenticate, authorize("landlord", "admin"), createEcoRatingHandler);
router.put("/:id", authenticate, authorize("landlord", "admin"), updateEcoRatingHandler);
router.delete("/:id", authenticate, authorize("admin"), deleteEcoRatingHandler);

export default router;
