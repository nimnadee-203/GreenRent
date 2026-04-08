/**
 * RECOMMENDATION INTEGRATION TESTS
 * 
 * Verifies that the recommendation engine and preference management
 * work correctly when called via the API.
 */
import request from "supertest";
import app from "../server.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret#text";

describe("INTEGRATION: Recommendation System", () => {
    let testToken;
    let testUser;

    beforeAll(async () => {
        try {
            // Ensure DB is connected
            if (mongoose.connection.readyState !== 1) {
                await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || "green-rent" });
            }

            // Create a real test user
            testUser = await userModel.create({
                name: "Rec Tester",
                email: `rectest${Date.now()}@example.com`,
                password: "password123",
                role: "user",
                preferences: {
                    budgetMax: 1000000,
                    ecoPriority: "medium",
                    isPreferenceSet: true
                }
            });

            // Generate a valid token for testing
            testToken = jwt.sign(
                { id: testUser._id, email: testUser.email, role: "user", name: testUser.name },
                JWT_SECRET,
                { expiresIn: "1h" }
            );
        } catch (error) {
            console.error("❌ Recommendation test setup failed:", error.message);
            throw error;
        }
    });

    afterAll(async () => {
        // Clean up test data
        if (testUser) {
            await userModel.findByIdAndDelete(testUser._id);
        }

        // VERY IMPORTANT: Close the database connection to allow Jest to exit properly
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe("GET /api/recommendations", () => {
        it("should return 401 if no token is provided", async () => {
            const res = await request(app).get("/api/recommendations");
            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toBe(false);
        });

        it("should return recommendations for an authenticated user", async () => {
            const res = await request(app)
                .get("/api/recommendations")
                .set("Authorization", `Bearer ${testToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.recommendations)).toBe(true);
        }, 15000); // Increased timeout to 15s because recommendation engine might take longer
    });

    describe("PUT /api/recommendations/preferences", () => {
        it("should update user preferences", async () => {
            const prefs = {
                budgetMin: 1000,
                budgetMax: 5000,
                ecoPriority: "high",
                propertyType: "house"
            };

            const res = await request(app)
                .put("/api/recommendations/preferences")
                .set("Authorization", `Bearer ${testToken}`)
                .send(prefs);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe("DELETE /api/recommendations/preferences", () => {
        it("should reset user preferences", async () => {
            const res = await request(app)
                .delete("/api/recommendations/preferences")
                .set("Authorization", `Bearer ${testToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Preferences reset to default");
        });
    });
});
