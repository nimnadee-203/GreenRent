import express from "express";
import userAuth from "../middleware/user.auth.js";
import { getRecommendations, resetPreferences } from "../controller/recommendation.controller.js";
import { updatePreferences } from "../controller/user.controller.js";

const router = express.Router();

router.get("/", userAuth, getRecommendations);
router.put("/preferences", userAuth, updatePreferences);
router.delete("/preferences", userAuth, resetPreferences);

export default router;