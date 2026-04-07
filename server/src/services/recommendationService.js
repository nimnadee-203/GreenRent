import Property from "../models/Property.js";
import UserPreference from "../models/UserPreference.js";
import { getWalkabilityScore } from "./walkabilityService.js";

/**
 * Calculate Smart Eco Score for a property based on user preferences.
 * 
 * Weights:
 * - Eco Rating (40%)
 * - Mobility Score (25%)
 * - Price Match (20%)
 * - Amenity Match (15%)
 */
export const getRecommendations = async (userId) => {
    // 1. Fetch User Preferences (or use defaults)
    const prefs = await UserPreference.findOne({ userId }) || {
        budgetMin: 0,
        budgetMax: 500000,
        propertyType: "Any",
        ecoPriority: "Medium",
        transportPreference: "Any",
        greenAmenities: []
    };

    // 2. Initial Filtering (Availability and Budget Buffer)
    const properties = await Property.find({
        availabilityStatus: "available",
        price: { $lte: prefs.budgetMax * 1.2 }, // Show slightly over-budget options
    }).populate("ecoRatingId");

    // 3. Score Calculation
    const recommended = await Promise.all(properties.map(async (property) => {
        // A. Live Mobility Score (Proximity to transit/parks)
        const lat = property.location?.coordinates?.lat || 0;
        const lng = property.location?.coordinates?.lng || 0;
        const mobilityData = await getWalkabilityScore(lat, lng);
        const walkabilityScore = (mobilityData.score || 0) * 10; // Normalize 0-10 to 0-100

        // B. EcoScore (from the property's verification)
        const ecoScore = property.ecoRatingId?.totalScore || 0;

        // C. Price Suitability
        // If within budget, 100. If over, decreases exponentially.
        let priceScore = 100;
        if (property.price > prefs.budgetMax) {
            priceScore = Math.max(0, 100 - ((property.price - prefs.budgetMax) / prefs.budgetMax) * 100);
        }

        // D. Preference Match (Property Type & Amenities)
        let matchPoints = 0;
        let totalPossiblePoints = 1; // Avoid divide by zero

        // Property Type match
        if (prefs.propertyType !== "Any") {
            totalPossiblePoints += 50;
            if (property.propertyType?.toLowerCase() === prefs.propertyType?.toLowerCase()) {
                matchPoints += 50;
            }
        }

        // Green Amenities match (from the EcoRating criteria)
        if (prefs.greenAmenities?.length > 0 && property.ecoRatingId?.criteria) {
            const criteria = property.ecoRatingId.criteria;
            prefs.greenAmenities.forEach(pref => {
                totalPossiblePoints += 10;
                // Check if the property has this amenity enabled
                if (criteria[pref] === true) {
                    matchPoints += 10;
                }
            });
        }
        
        const preferenceMatchScore = (matchPoints / totalPossiblePoints) * 100;

        // 4. Weight Selection based on Eco-Priority
        let weights = { eco: 0.4, mobility: 0.25, price: 0.2, prefs: 0.15 };
        
        if (prefs.ecoPriority === "High") {
            weights = { eco: 0.5, mobility: 0.3, price: 0.1, prefs: 0.1 };
        } else if (prefs.ecoPriority === "Low") {
            weights = { eco: 0.2, mobility: 0.1, price: 0.4, prefs: 0.3 };
        }

        const smartScore =
            ecoScore * weights.eco +
            walkabilityScore * weights.mobility +
            priceScore * weights.price +
            preferenceMatchScore * weights.prefs;

        return {
            ...property.toObject(),
            smartScore: Math.round(smartScore * 10) / 10,
            scoringBreakdown: {
                eco: Math.round(ecoScore),
                mobility: Math.round(walkabilityScore),
                priceMatch: Math.round(priceScore),
                prefMatch: Math.round(preferenceMatchScore)
            },
            mobility: {
                score: mobilityData.score,
                label: mobilityData.label,
                amenityCount: mobilityData.amenityCount
            }
        };
    }));

    // Sort by smartScore descending
    return recommended.sort((a, b) => b.smartScore - a.smartScore);
};

export const saveUserPreferences = async (userId, preferenceData) => {
    return await UserPreference.findOneAndUpdate(
        { userId },
        { ...preferenceData, userId },
        { upsert: true, new: true, runValidators: true }
    );
};

export const resetPreferences = async (userId) => {
    return await UserPreference.findOneAndDelete({ userId });
};
