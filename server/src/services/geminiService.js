import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import AIInsightCache from "../models/AIInsightCache.js";
import crypto from "crypto";

// Debug API Key (Safe Logging)
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing from .env file");
} else {
    console.log("✅ Gemini API Key Loaded:", apiKey.substring(0, 10) + "...");
}

const genAI = new GoogleGenerativeAI(apiKey);


/**
 * Helper: Generate a unique fingerprint for user preferences.
 * This ensures the cache is cleared if the user changes their budget, priority or amenities.
 */
const getPreferencesHash = (userPrefs) => {
    const data = JSON.stringify({
        max: userPrefs.budgetMax,
        eco: userPrefs.ecoPriority,
        type: userPrefs.propertyType,
        amenities: [...(userPrefs.greenAmenities || [])].sort()
    });
    return crypto.createHash("md5").update(data).digest("hex");
};

/**
 * Generate AI-powered recommendation insights using Gemini with persistent caching.
 */
export const generateRecommendationInsight = async (userPrefs, property, userId = null) => {
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

    // 1. Check if we can cache (requires userId)
    const prefsHash = getPreferencesHash(userPrefs);

    try {
        if (userId) {
            const cached = await AIInsightCache.findOne({
                userId,
                propertyId: property._id,
                preferencesHash: prefsHash
            });

            if (cached) {
                console.log(`⚡ AI Cache Hit for ${property.title}`);
                return cached.insight;
            }
        }

        if (!apiKey) return null;

        // Try Preferred Model 2.5, Fallback to 1.5 if capacity is low
        let modelName = "gemini-2.5-flash";
        let model = genAI.getGenerativeModel({ model: modelName });


        const prompt = `You are GreenRent's AI recommendation assistant. Generate a SHORT, compelling recommendation insight (max 2 sentences, under 40 words) for this eco-friendly rental property match.

User Preferences:
- Budget: up to ${userPrefs.budgetMax?.toLocaleString() || "Not specified"} LKR/month
- Eco Priority: ${userPrefs.ecoPriority || "Medium"}
- Property Type: ${userPrefs.propertyType || "Any"}
- Transport Preference: ${userPrefs.transportPreference || "Any"}
- Desired Green Amenities: ${userPrefs.greenAmenities?.join(", ") || "None specified"}

Property Data:
- Name: ${property.title}
- Price: ${property.price?.toLocaleString()} LKR/month
- Eco Score: ${property.scoringBreakdown?.eco || 0}/100
- Mobility Score: ${property.scoringBreakdown?.mobility || 0}/100
- Price Match: ${property.scoringBreakdown?.priceMatch || 0}/100
- Smart Score: ${property.smartScore || 0}/100

Rules:
- Be specific about WHY this property matches the user
- Sound professional but friendly
- Do NOT use markdown formatting
- Keep it under 40 words`;

        console.log(`🔄 AI generating : ${property.title} (10s timeout)`);

        let result;
        try {
            // Priority Try (2.5)
            result = await Promise.race([
                model.generateContent(prompt),
                timeout(10000)
            ]);
        } catch (error) {
            console.warn(`🔄 Model ${modelName} busy/unavailable. Falling back to 1.5-Flash.`);
            modelName = "gemini-1.5-flash";
            model = genAI.getGenerativeModel({ model: modelName });
            result = await Promise.race([
                model.generateContent(prompt),
                timeout(10000)
            ]);
        }

        const response = await result.response;
        if (!response || !response.text) throw new Error("Invalid AI response");

        const text = response.text().trim();
        
        // 2. Save result to cache if we have userId
        if (userId) {
            await AIInsightCache.findOneAndUpdate(
                { userId, propertyId: property._id, preferencesHash: prefsHash },
                { insight: text, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                { upsert: true }
            ).catch(err => console.error("Cache save failed:", err.message));
        }

        console.log(`✅ AI insight generated (${modelName}) for ${property.title}`);
        return text;

    } catch (error) {
        if (error.message === "Timeout") {
            console.warn(`⏳ AI Insight Timed Out for ${property.title}`);
        } else {
            console.error("❌ Gemini AI insight error for", property.title, ":", error.message);
        }
        return null; // Graceful fallback
    }
};

/**
 * Batch generate insights for top N recommendations.
 * Changed to sequential (looping) to prevent rate-limiting/concurrency errors on Gemini 2.5-Flash.
 */
export const generateBatchInsights = async (userPrefs, recommendations, topN = 3) => {
    const topProperties = recommendations.slice(0, topN);
    const updatedRecommendations = [...recommendations];

    for (let i = 0; i < topProperties.length; i++) {
        const property = topProperties[i];
        try {
            const insight = await generateRecommendationInsight(userPrefs, property);
            if (insight) {
                updatedRecommendations[i] = { ...updatedRecommendations[i], aiInsight: insight };
            }
        } catch (error) {
            console.warn(`⚠️ Skipped insight for ${property.title}:`, error.message);
        }
    }

    return updatedRecommendations;
};