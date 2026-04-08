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

    const timeout = (ms) =>
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), ms)
        );

    const prefsHash = getPreferencesHash(userPrefs);

    try {

        // 1. Check Cache
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

        // Model Priority Order
        const models = [
            "gemini-2.5-flash",
            "gemini-2.0-pro"
        ];

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

        console.log(`🔄 AI generating : ${property.title}`);

        let result;
        let modelUsed;

        // Try Models Sequentially
        for (const modelName of models) {
            try {

                console.log(`🔄 Trying model: ${modelName}`);

                const model = genAI.getGenerativeModel({ model: modelName });

                result = await Promise.race([
                    model.generateContent(prompt),
                    timeout(15000)
                ]);

                modelUsed = modelName;
                break;

            } catch (error) {
                console.warn(`⚠️ ${modelName} failed, trying next...`);
            }
        }

        if (!result) {
            throw new Error("All Gemini models failed");
        }

        const response = await result.response;

        if (!response || typeof response.text !== "function") {
            throw new Error("Invalid AI response");
        }

        const text = response.text().trim();

        // Save Cache
        if (userId) {
            await AIInsightCache.findOneAndUpdate(
                {
                    userId,
                    propertyId: property._id,
                    preferencesHash: prefsHash
                },
                {
                    insight: text,
                    expiresAt: new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                    )
                },
                { upsert: true }
            ).catch(err =>
                console.error("Cache save failed:", err.message)
            );
        }

        console.log(`✅ AI insight generated (${modelUsed}) for ${property.title}`);

        return text;

    } catch (error) {

        if (error.message === "Timeout") {
            console.warn(`⏳ AI Insight Timed Out for ${property.title}`);
        } else {
            console.error(
                "❌ Gemini AI insight error for",
                property.title,
                ":",
                error.message
            );
        }

        return null;
    }
};


/**
 * Batch generate insights for top recommendations
 */
export const generateBatchInsights = async (
    userPrefs,
    recommendations,
    topN = 3
) => {

    const topProperties = recommendations.slice(0, topN);
    const updatedRecommendations = [...recommendations];

    for (let i = 0; i < topProperties.length; i++) {

        const property = topProperties[i];

        try {

            const insight =
                await generateRecommendationInsight(
                    userPrefs,
                    property
                );

            if (insight) {
                updatedRecommendations[i] = {
                    ...updatedRecommendations[i],
                    aiInsight: insight
                };
            }

        } catch (error) {
            console.warn(
                `⚠️ Skipped insight for ${property.title}:`,
                error.message
            );
        }
    }

    return updatedRecommendations;
};