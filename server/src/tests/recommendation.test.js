import request from "supertest";
import app from "../server.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret#text";

describe("Recommendation System Endpoints", () => {
    let testToken;
    const testUserId = "6996fb36aafadbc113f6139d"; // Using the valid ID we found earlier

    beforeAll(() => {
        // Generate a valid token for testing
        testToken = jwt.sign(
            { id: testUserId, email: "tester@example.com", role: "user" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
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
        });
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
            expect(res.body.preferences.ecoPriority).toBe("medium");
        });
    });
});
