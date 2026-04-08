import express from "express";
import userAuth from "../middleware/user.auth.js";
import { 
  getRecommendations, 
  resetPreferences, 
  getMobilityHandler, 
  savePreferences, 
  getUserPreferences,
  getSingleRecommendationInsight 
} from "../controllers/recommendation.controller.js";

const router = express.Router();

// NEW: Viva Utility Endpoint (Fetch Live Mobility/Transit for any location)
router.get("/mobility-check", getMobilityHandler);

router.get("/", userAuth, getRecommendations);
router.get("/ai-insight/:propertyId", userAuth, getSingleRecommendationInsight);
router.get("/preferences", userAuth, getUserPreferences);
router.put("/preferences", userAuth, savePreferences);
router.delete("/preferences", userAuth, resetPreferences);

export default router;