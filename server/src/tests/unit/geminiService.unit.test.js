/**
 * GEMINI AI SERVICE UNIT TEST (Intermediate Level)
 * 
 * Goal: Test if the AI insight generation and caching works.
 * 
 * We check:
 * 1. If there's a cached result, do we use it? (Saving API costs)
 * 2. If there's no cache, do we successfully call the Gemini API?
 */

import { jest } from "@jest/globals";

// Mock the Cache model
jest.unstable_mockModule("../../models/AIInsightCache.js", () => ({
  default: {
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue({}),
  },
}));

// Mock the Google AI Library
const mockGenerateContent = jest.fn();
jest.unstable_mockModule("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: mockGenerateContent,
    })),
  })),
}));

// --- IMPORTS ---
const { generateRecommendationInsight } = await import("../../services/geminiService.js");
const { default: AIInsightCache } = await import("../../models/AIInsightCache.js");

describe("Unit Tests: Gemini AI Insights", () => {
    
  // Mock data to feed the service
  const testPrefs = { budgetMax: 500000, ecoPriority: "high", propertyType: "any" };
  const testProp = { _id: "prop123", title: "Green Home", toObject: () => testProp };

  beforeAll(() => {
    process.env.GEMINI_API_KEY = "dummy-key-for-testing";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should use CAPPED insight from database if it already exists", async () => {
    // SETUP: Return a fake result from the cache
    AIInsightCache.findOne.mockResolvedValue({
      insight: "This is a previously saved insight."
    });

    // ACTION
    const result = await generateRecommendationInsight(testPrefs, testProp, "user1");

    // ASSERTION
    expect(result).toBe("This is a previously saved insight.");
    expect(mockGenerateContent).not.toHaveBeenCalled(); // AI was NOT called (Save cost!)
  });

  test("Should call the Gemini API when no cached version is found", async () => {
    // SETUP: No cache found
    AIInsightCache.findOne.mockResolvedValue(null);
    
    // Simulate a successful AI response
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "New AI generated response!"
      }
    });

    // ACTION
    const result = await generateRecommendationInsight(testPrefs, testProp, "user1");

    // ASSERTION
    expect(result).toBe("New AI generated response!");
    expect(mockGenerateContent).toHaveBeenCalled(); // AI WAS called
    expect(AIInsightCache.findOneAndUpdate).toHaveBeenCalled(); // Result was SAVED for next time
  });
});
