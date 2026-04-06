import Property from "../models/Property.js";
import userModel from "../models/userModel.js";
import { getWalkabilityScore } from "./walkabilityService.js";

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

    // Calculate smart score with LIVE Walkability Data
    const recommended = await Promise.all(properties.map(async (property) => {
        // Fetch Live Mobility Score (Nearby Parks, Transit, Shops)
        const lat = property.location.coordinates.lat;
        const lng = property.location.coordinates.lng;
        const mobilityData = await getWalkabilityScore(lat, lng);
        const walkabilityScore = mobilityData.score;

        const ecoScore = property.ecoRatingId?.totalScore || 0;
        const reviewScore = (property.ecoRatingId?.renterReviewStats?.averageScore || 0) * 10;
        const priceScore = Math.max(0, (1 - property.price / prefs.budgetMax) * 100);

        // Adjust weights based on user eco-priority
        let ecoWeight = 0.3;
        let walkWeight = 0.2; // Your unique factor

        if (prefs.ecoPriority === "high") {
            ecoWeight = 0.4;
            walkWeight = 0.3;
        } else if (prefs.ecoPriority === "low") {
            ecoWeight = 0.15;
            walkWeight = 0.05;
        }

        const reviewWeight = 0.25;
        const priceWeight = 1 - (ecoWeight + walkWeight + reviewWeight);

        const smartScore =
            ecoScore * ecoWeight +
            walkabilityScore * 10 * walkWeight +
            reviewScore * reviewWeight +
            priceScore * priceWeight;

        return {
            ...property.toObject(),
            smartScore: Math.round(smartScore * 10) / 10,
            mobility: {
                score: walkabilityScore,
                label: mobilityData.label,
                amenitiesFound: mobilityData.amenityCount,
                description: "Proximity to parks, bus stops, and essential shops"
            }
        };
    }));

    // Sort by smartScore
    return recommended.sort((a, b) => b.smartScore - a.smartScore);
};

export const updatePreferences = async (userId, preferences) => {
    const user = await userModel.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { returnDocument: "after", runValidators: true }
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
        { returnDocument: "after" }
    ).select("preferences");

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return updatedUser.preferences;
};
