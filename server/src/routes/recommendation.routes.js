import express from "express";
import userAuth from "../middleware/user.auth.js";
import { getRecommendations, resetPreferences, getMobilityHandler } from "../controller/recommendation.controller.js";
import { updatePreferences } from "../controller/user.controller.js";

const router = express.Router();

// NEW: Viva Utility Endpoint (Fetch Live Mobility/Transit for any location)
router.get("/mobility-check", getMobilityHandler);

router.get("/", userAuth, getRecommendations);
router.put("/preferences", userAuth, updatePreferences);
router.delete("/preferences", userAuth, resetPreferences);

export default router;