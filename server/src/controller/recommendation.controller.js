import * as recommendationService from "../services/recommendationService.js";
import { getWalkabilityScore } from "../services/walkabilityService.js";

export const getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: User context missing" });
    }

    const userId = user._id || user.id;
    const recommendations = await recommendationService.getRecommendations(userId);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const savePreferences = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: User context missing" });
    }

    const userId = user._id || user.id;
    const preferenceData = req.body;

    const updatedPrefs = await recommendationService.saveUserPreferences(userId, preferenceData);

    return res.status(200).json({
      success: true,
      message: "Preferences saved successfully",
      preferences: updatedPrefs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save preferences",
      error: error.message,
    });
  }
};

export const getMobilityHandler = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        message: "Latitude (lat) and Longitude (lon) are required."
      });
    }

    const mobilityData = await getWalkabilityScore(Number(lat), Number(lon));

    return res.status(200).json({
      success: true,
      location: { lat, lon },
      ...mobilityData
    });

  } catch (error) {
    console.error("Mobility handler error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPreferences = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: User context missing" });
    }

    const userId = user._id || user.id;
    await recommendationService.resetPreferences(userId);

    return res.status(200).json({
      success: true,
      message: "Preferences reset to default",
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};