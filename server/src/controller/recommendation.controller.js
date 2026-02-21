import Property from "../models/Property.js";
import EcoRating from "../models/EcoRating.js";
import RenterReview from "../models/RenterReview.js";
import userModel from "../models/userModel.js";

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id; // from userAuth middleware

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const prefs = user.preferences || {
      budgetMin: 0,
      budgetMax: 1000000,
      ecoPriority: "medium",
      propertyType: "any",
    };

    // Step 1: Filter properties
    let query = {
      availabilityStatus: "available",
      price: { $gte: prefs.budgetMin, $lte: prefs.budgetMax },
    };

    if (prefs.propertyType && prefs.propertyType !== "any") {
      query.propertyType = prefs.propertyType;
    }

    const properties = await Property.find(query)
      .populate("ecoRatingId");

    // Step 2: Calculate smart score
    const recommended = properties.map((property) => {

      // ecoScore (0-100)
      const ecoScore = property.ecoRatingId?.totalScore || 0;

      // reviewScore (0-10) -> normalized to 0-100
      const reviewScore =
        (property.ecoRatingId?.renterReviewStats?.averageScore || 0) * 10;

      // Price score (normalized 0-100, cheaper = higher)
      const priceScore = Math.max(0, (1 - property.price / prefs.budgetMax) * 100);

      // weights
      let ecoWeight = 0.4;
      if (prefs.ecoPriority === "high") ecoWeight = 0.6;
      if (prefs.ecoPriority === "low") ecoWeight = 0.2;

      const reviewWeight = 0.3;
      const priceWeight = 1 - (ecoWeight + reviewWeight);

      const smartScore =
        ecoScore * ecoWeight +
        reviewScore * reviewWeight +
        priceScore * priceWeight;

      return {
        ...property.toObject(),
        smartScore: Math.round(smartScore * 10) / 10, // Round to 1 decimal
      };
    });

    // Step 3: Sort by smartScore
    recommended.sort((a, b) => b.smartScore - a.smartScore);

    return res.status(200).json({
      success: true,
      recommendations: recommended,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const resetPreferences = async (req, res) => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id, // from userAuth middleware
      {
        preferences: {
          location: "",
          budgetMin: 0,
          budgetMax: 1000000,
          ecoPriority: "medium",
          propertyType: "any",
        },
      },
      { new: true }
    ).select("preferences");

    return res.status(200).json({
      success: true,
      message: "Preferences reset to default",
      preferences: updatedUser.preferences,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};