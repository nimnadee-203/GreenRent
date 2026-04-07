import express from "express";
import userAuth from "../middleware/user.auth.js";
import { getRecommendations, resetPreferences, getMobilityHandler, savePreferences } from "../controller/recommendation.controller.js";

const router = express.Router();

// NEW: Viva Utility Endpoint (Fetch Live Mobility/Transit for any location)
router.get("/mobility-check", getMobilityHandler);

router.get("/", userAuth, getRecommendations);
router.put("/preferences", userAuth, savePreferences);
router.delete("/preferences", userAuth, resetPreferences);

export default router;