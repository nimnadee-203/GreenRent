import Property from "../models/Property.js";
import userModel from "../models/userModel.js";

export const getRecommendations = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const prefs = user.preferences || {
        budgetMin: 0,
        budgetMax: 1000000,
        ecoPriority: "medium",
        propertyType: "any",
    };

    // Filter properties
    let query = {
        availabilityStatus: "available",
        price: { $gte: prefs.budgetMin, $lte: prefs.budgetMax },
    };

    if (prefs.propertyType && prefs.propertyType !== "any") {
        query.propertyType = prefs.propertyType;
    }

    const properties = await Property.find(query).populate("ecoRatingId");

    // Calculate smart score
    const recommended = properties.map((property) => {
        const ecoScore = property.ecoRatingId?.totalScore || 0;
        const reviewScore = (property.ecoRatingId?.renterReviewStats?.averageScore || 0) * 10;
        const priceScore = Math.max(0, (1 - property.price / prefs.budgetMax) * 100);

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
            smartScore: Math.round(smartScore * 10) / 10,
        };
    });

    // Sort by smartScore
    return recommended.sort((a, b) => b.smartScore - a.smartScore);
};

export const updatePreferences = async (userId, preferences) => {
    const user = await userModel.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const resetPreferences = async (userId) => {
    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
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

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return updatedUser.preferences;
};
