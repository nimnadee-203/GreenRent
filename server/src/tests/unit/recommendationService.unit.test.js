/**
 * RECOMMENDATION SERVICE UNIT TEST (Intermediate Level)
 * 
 * Goal: Test how the "Smart Scoring" logic works.
 * 
 * We check if the algorithm correctly gives higher points to 
 * sustainability-friendly properties when the user asks for it.
 */

import { jest } from "@jest/globals";

// --- MOCKING ---
// Mock database models and the AI insight service
jest.unstable_mockModule("../../models/Property.js", () => ({
  default: {
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/UserPreference.js", () => ({
  default: {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/userModel.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../../services/geminiService.js", () => ({
  generateRecommendationInsight: jest.fn().mockResolvedValue("AI insight test text"),
  generateBatchInsights: jest.fn().mockImplementation((prefs, recs) => Promise.resolve(recs)),
}));

// --- IMPORTS ---
const { getRecommendations } = await import("../../services/recommendationService.js");
const { default: userModel } = await import("../../models/userModel.js");
const { default: Property } = await import("../../models/Property.js");

describe("Unit Tests: Recommendation Scoring Engine", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Green properties should rank higher when user priority is High", async () => {
    // 1. SETUP: Mock a user with "High" sustainability priority
    userModel.findById.mockResolvedValue({
      _id: "user_test",
      preferences: {
        budgetMax: 500000,
        ecoPriority: "high", // THE KEY FACTOR
      },
    });

    // 2. SETUP: Mock two properties
    // Property A: Very Eco-friendly (Score 90)
    const propertyA = {
      _id: "prop_A",
      title: "Eco-Friendly Villa",
      price: 100000,
      ecoRatingId: { totalScore: 90 },
      toObject: function() { return this; }
    };

    // Property B: Not Eco-friendly (Score 20)
    const propertyB = {
      _id: "prop_B",
      title: "Gray Apartment",
      price: 100000,
      ecoRatingId: { totalScore: 20 },
      toObject: function() { return this; }
    };

    Property.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([propertyA, propertyB])
    });

    // 3. ACTION: Get recommendations
    const results = await getRecommendations("user_test");

    // 4. ASSERTION: Property A should be first and have a higher score
    const topResult = results[0];
    const secondResult = results[1];

    expect(topResult.title).toBe("Eco-Friendly Villa");
    expect(topResult.smartScore).toBeGreaterThan(secondResult.smartScore);
  });

  test("Price matches should contribute to the final score", async () => {
    // 1. SETUP: Mock user with Low budget
    userModel.findById.mockResolvedValue({
      _id: "user_test",
      preferences: {
        budgetMax: 50000, 
        ecoPriority: "medium",
      },
    });

    // 2. SETUP: One expensive property (200k)
    const expensiveProp = {
      _id: "prop_rich",
      title: "Expensive Place",
      price: 200000, // Way over budget
      ecoRatingId: { totalScore: 50 },
      toObject: function() { return this; }
    };

    Property.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([expensiveProp])
    });

    // 3. ACTION
    const results = await getRecommendations("user_test");

    // 4. ASSERTION: Price score should be low
    expect(results[0].scoringBreakdown.priceMatch).toBeLessThan(50);
  });
});
