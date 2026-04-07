import Property from "../models/Property.js";
import UserPreference from "../models/UserPreference.js";
import userModel from "../models/userModel.js";
import { getWalkabilityScore } from "./walkabilityService.js";

/**
 * Smart Eco Score Recommendation Engine
 * 
 * Reads from UserPreference collection first, falls back to user.preferences.
 * 
 * Weights:
 * - Eco Rating (variable based on ecoPriority)
 * - Mobility Score (walkability/transit)
 * - Price Match
 * - Review Score
 * - Amenity/Preference Match
 */
export const getRecommendations = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // 1. Try UserPreference collection first, fall back to embedded user.preferences
    const savedPref = await UserPreference.findOne({ userId });

    const prefs = savedPref
        ? {
            budgetMin: savedPref.budgetMin || 0,
            budgetMax: savedPref.budgetMax || 500000,
            ecoPriority: (savedPref.ecoPriority || "Medium").toLowerCase(),
            propertyType: (savedPref.propertyType || "Any").toLowerCase(),
            transportPreference: savedPref.transportPreference || "Any",
            greenAmenities: savedPref.greenAmenities || [],
        }
        : {
            budgetMin: user.preferences?.budgetMin || 0,
            budgetMax: user.preferences?.budgetMax || 1000000,
            ecoPriority: user.preferences?.ecoPriority || "medium",
            propertyType: user.preferences?.propertyType || "any",
            transportPreference: "Any",
            greenAmenities: [],
        };

    // 2. Filter properties by availability and budget
    let query = {
        availabilityStatus: "available",
        price: { $lte: prefs.budgetMax * 1.2 }, // Allow slightly over-budget
    };

    if (prefs.propertyType && prefs.propertyType !== "any") {
        query.propertyType = new RegExp(`^${prefs.propertyType}$`, "i");
    }

    const properties = await Property.find(query).populate("ecoRatingId");

    // 3. Score each property
    const recommended = await Promise.all(properties.map(async (property) => {
        // A. Live Mobility Score
        const lat = property.location?.coordinates?.lat || 0;
        const lng = property.location?.coordinates?.lng || 0;
        const mobilityData = await getWalkabilityScore(lat, lng);
        const walkabilityScore = (mobilityData.score || 0) * 10; // Normalize 0-10 to 0-100

        // B. Eco Score
        const ecoScore = property.ecoRatingId?.totalScore || 0;

        // C. Review Score
        const reviewScore = (property.ecoRatingId?.renterReviewStats?.averageScore || 0) * 10;

        // D. Price Suitability (100 if within budget, decreases if over)
        let priceScore = 100;
        if (property.price > prefs.budgetMax) {
            priceScore = Math.max(0, 100 - ((property.price - prefs.budgetMax) / prefs.budgetMax) * 100);
        } else {
            priceScore = Math.max(0, (1 - property.price / prefs.budgetMax) * 100);
        }

        // E. Preference/Amenity Match Score
        let matchPoints = 0;
        let totalPossiblePoints = 1; // Avoid divide by zero

        if (prefs.greenAmenities?.length > 0 && property.ecoRatingId?.criteria) {
            const criteria = property.ecoRatingId.criteria;
            prefs.greenAmenities.forEach(pref => {
                totalPossiblePoints += 10;
                if (criteria[pref] === true) {
                    matchPoints += 10;
                }
            });
        }

        const preferenceMatchScore = (matchPoints / totalPossiblePoints) * 100;

        // 4. Dynamic weights based on eco-priority
        let ecoWeight = 0.3;
        let walkWeight = 0.2;
        let reviewWeight = 0.2;
        let prefWeight = 0.1;

        if (prefs.ecoPriority === "high") {
            ecoWeight = 0.4;
            walkWeight = 0.25;
            reviewWeight = 0.15;
            prefWeight = 0.1;
        } else if (prefs.ecoPriority === "low") {
            ecoWeight = 0.15;
            walkWeight = 0.1;
            reviewWeight = 0.25;
            prefWeight = 0.15;
        }

        const priceWeight = 1 - (ecoWeight + walkWeight + reviewWeight + prefWeight);

        const smartScore =
            ecoScore * ecoWeight +
            walkabilityScore * walkWeight +
            reviewScore * reviewWeight +
            priceScore * priceWeight +
            preferenceMatchScore * prefWeight;

        return {
            ...property.toObject(),
            smartScore: Math.round(smartScore * 10) / 10,
            scoringBreakdown: {
                eco: Math.round(ecoScore),
                mobility: Math.round(walkabilityScore),
                priceMatch: Math.round(priceScore),
                review: Math.round(reviewScore),
                prefMatch: Math.round(preferenceMatchScore),
            },
            mobility: {
                score: mobilityData.score,
                label: mobilityData.label,
                amenityCount: mobilityData.amenityCount,
                description: "Proximity to parks, bus stops, and essential shops",
            },
        };
    }));

    // Sort by smartScore descending
    return recommended.sort((a, b) => b.smartScore - a.smartScore);
};

/**
 * Save user preferences to BOTH:
 * - UserPreference collection (full data for recommendation engine)
 * - User model embedded preferences (keeps user doc in sync)
 */
export const saveUserPreferences = async (userId, preferenceData) => {
    // 1. Save to dedicated UserPreference collection
    const savedPref = await UserPreference.findOneAndUpdate(
        { userId },
        { ...preferenceData, userId },
        { upsert: true, new: true, runValidators: true }
    );

    // 2. Sync to embedded user.preferences
    await userModel.findByIdAndUpdate(userId, {
        preferences: {
            budgetMin: preferenceData.budgetMin || 0,
            budgetMax: preferenceData.budgetMax || 500000,
            ecoPriority: (preferenceData.ecoPriority || "Medium").toLowerCase(),
            propertyType: (preferenceData.propertyType || "Any").toLowerCase(),
        }
    });

    return savedPref;
};

/**
 * Reset preferences in both collections
 */
export const resetPreferences = async (userId) => {
    // Remove from UserPreference collection
    await UserPreference.findOneAndDelete({ userId });

    // Reset embedded preferences to defaults
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
