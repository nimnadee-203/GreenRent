import * as recommendationService from "../services/recommendationService.js";

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

export const resetPreferences = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: User context missing" });
    }

    const userId = user._id || user.id;
    const preferences = await recommendationService.resetPreferences(userId);

    return res.status(200).json({
      success: true,
      message: "Preferences reset to default",
      preferences,
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};