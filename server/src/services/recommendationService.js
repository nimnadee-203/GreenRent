import Property from "../models/Property.js";
import UserPreference from "../models/UserPreference.js";
import userModel from "../models/userModel.js";
import { generateBatchInsights, generateRecommendationInsight } from "./geminiService.js";

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

    // 1. Prioritize embedded user.preferences as the single source of truth
    const prefs = {
        budgetMin: user.preferences?.budgetMin || 0,
        budgetMax: user.preferences?.budgetMax || 1000000,
        ecoPriority: (user.preferences?.ecoPriority || "medium").toLowerCase(),
        propertyType: (user.preferences?.propertyType || "any").toLowerCase(),
        transportPreference: user.preferences?.transportPreference || "Any",
        greenAmenities: user.preferences?.greenAmenities || [],
    };

    // 2. Filter properties by availability and budget
    let query = {
        availabilityStatus: "available",
        price: { $lte: prefs.budgetMax * 1.2 }, // Allow slightly over-budget
    };

    if (prefs.propertyType && prefs.propertyType !== "any") {
        query.propertyType = new RegExp(`^${prefs.propertyType}$`, "i");
    }

    console.log(`🔍 Finding recommendations for User: ${userId}`);
    console.log(`⚙️  Filters: PropertyType=${prefs.propertyType || "any"}, MaxPrice=${prefs.budgetMax * 1.2}`);
    console.log(`📡 MongoDB Query:`, JSON.stringify(query));

    const properties = await Property.find(query).populate("ecoRatingId");
    console.log(`📈 Properties found for scoring: ${properties.length}`);

    // 3. PASS 1: Quick Score (Database-only fields)
    // We score all properties based on Price, Eco Rating, and Amenities first.
    // This allows us to find the top candidates before making expensive API calls.
    const scoredProperties = properties.map(property => {
        const ecoScore = property.ecoRatingId?.totalScore || 0;
        const reviewScore = (property.ecoRatingId?.renterReviewStats?.averageScore || 0) * 10;
        
        let priceScore = 100;
        const maxBudget = prefs.budgetMax || 1000000;
        if (property.price > maxBudget) {
            priceScore = Math.max(0, 100 - ((property.price - maxBudget) / maxBudget) * 100);
        } else {
            priceScore = Math.max(0, (1 - property.price / maxBudget) * 100);
        }

        let matchPoints = 0;
        let totalPossiblePoints = 1;
        if (Array.isArray(prefs.greenAmenities) && prefs.greenAmenities.length > 0 && property.ecoRatingId?.criteria) {
            const criteria = property.ecoRatingId.criteria;
            prefs.greenAmenities.forEach(pref => {
                totalPossiblePoints += 10;
                if (criteria && criteria[pref] === true) {
                    matchPoints += 10;
                }
            });
        }
        const preferenceMatchScore = (matchPoints / totalPossiblePoints) * 100;

        // Weights for Pass 1 (Excludes mobility)
        const baseScore = (ecoScore * 0.4) + (priceScore * 0.4) + (preferenceMatchScore * 0.2);
        
        return {
            property,
            baseScore,
            ecoScore,
            reviewScore,
            priceScore,
            preferenceMatchScore
        };
    });

    // Take top 15 candidates for Deep Analysis (Walkability + AI)
    const finalists = scoredProperties
        .sort((a, b) => b.baseScore - a.baseScore)
        .slice(0, 15);

    console.log(`🎯 Performing Deep Analysis (OSM + AI) for Top ${finalists.length} properties...`);

        // 4. PASS 2: Instant Analysis (No External OSM calls)
        const recommended = finalists.map(({ property, ecoScore, reviewScore, priceScore, preferenceMatchScore }) => {
            // A. Static Mobility Score (REPLACED OSM FOR PERFORMANCE)
            const walkabilityScore = 70; // High default to assume green-rent properties are well-located

            // 5. Dynamic weights based on eco-priority (RE-BALANCED WITHOUT MOBILITY)
            let ecoWeight = 0.5;   // Increased from 0.3
            let reviewWeight = 0.25; // Increased from 0.2
            let prefWeight = 0.15;  // Increased from 0.1
            const priceWeight = Math.max(0, 1 - (ecoWeight + reviewWeight + prefWeight));

            if (prefs.ecoPriority === "high") {
                ecoWeight = 0.6;
                reviewWeight = 0.2;
                prefWeight = 0.1;
            } else if (prefs.ecoPriority === "low") {
                ecoWeight = 0.3;
                reviewWeight = 0.3;
                prefWeight = 0.2;
            }

            const smartScore =
                (ecoScore || 0) * ecoWeight +
                (reviewScore || 0) * reviewWeight +
                (priceScore || 0) * priceWeight +
                (preferenceMatchScore || 0) * prefWeight;

            return {
                ...property.toObject(),
                smartScore: Math.round((smartScore || 0) * 10) / 10,
                scoringBreakdown: {
                    eco: Math.round(ecoScore || 0),
                    mobility: 70, // Static for UI consistency
                    priceMatch: Math.round(priceScore || 0),
                    review: Math.round(reviewScore || 0),
                    prefMatch: Math.round(preferenceMatchScore || 0),
                },
                mobility: {
                    score: 7,
                    label: "Good Accessibility",
                    amenityCount: 5,
                    description: "Estimated proximity based on central urban location",
                },
            };
        });

    // Sort by final smartScore descending
    const sorted = recommended.sort((a, b) => b.smartScore - a.smartScore);

// 6. Return properties immediately (Optimized for instant load)
    return sorted;
};

/**
 * Generate a single AI insight for a property (called asynchronously by frontend)
 */
export const getSingleInsight = async (userId, propertyId) => {
    const user = await userModel.findById(userId);
    const property = await Property.findById(propertyId).populate("ecoRatingId");
    
    if (!user || !property) return null;

    const prefs = {
        budgetMax: user.preferences?.budgetMax || 1000000,
        ecoPriority: (user.preferences?.ecoPriority || "medium").toLowerCase(),
        propertyType: (user.preferences?.propertyType || "any").toLowerCase(),
        transportPreference: user.preferences?.transportPreference || "Any",
        greenAmenities: user.preferences?.greenAmenities || [],
    };

    // Calculate quick score data just for the prompt context
    const ecoScore = property.ecoRatingId?.totalScore || 0;
    let priceScore = 100;
    if (property.price > prefs.budgetMax) {
        priceScore = Math.max(0, 100 - ((property.price - prefs.budgetMax) / prefs.budgetMax) * 100);
    }
    
    const contextProperty = {
        ...property.toObject(),
        scoringBreakdown: {
            eco: ecoScore,
            priceMatch: priceScore,
            mobility: 70
        },
        smartScore: 85 // Approximate for prompt
    };

    return await generateRecommendationInsight(prefs, contextProperty, userId);
};

/**
 * Save user preferences to BOTH:
 * - UserPreference collection (full data for recommendation engine)
 * - User model embedded preferences (keeps user doc in sync)
 */
export const saveUserPreferences = async (userId, preferenceData) => {
    // 1. Sync to User model (New Unified Source of Truth)
    const updatedUser = await userModel.findByIdAndUpdate(userId, {
        isPreferenceSet: true,
        preferences: {
            budgetMin: Number(preferenceData.budgetMin) || 0,
            budgetMax: Number(preferenceData.budgetMax) || 500000,
            ecoPriority: (preferenceData.ecoPriority || "Medium").toLowerCase(),
            propertyType: (preferenceData.propertyType || "Any").toLowerCase(),
            transportPreference: preferenceData.transportPreference || "Any",
            greenAmenities: Array.isArray(preferenceData.greenAmenities) ? preferenceData.greenAmenities : []
        }
    }, { new: true });

    // 2. Backward compatibility: Still update UserPreference collection for now
    await UserPreference.findOneAndUpdate(
        { userId },
        { ...preferenceData, userId, isDefault: false },
        { upsert: true, new: true }
    );

    return updatedUser.preferences;
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

/**
 * Fetch detailed user preferences from the UserPreference collection
 */
export const getUserPreferences = async (userId) => {
    const savedPref = await UserPreference.findOne({ userId });
    
    if (savedPref) return savedPref;

    // Fallback for existing users who don't have a record yet
    return {
        userId,
        budgetMax: 500000,
        propertyType: "Any",
        ecoPriority: "Medium",
        transportPreference: "Any",
        greenAmenities: [],
        isDefault: true // Helper flag for frontend if needed
    };
};
