import request from "supertest";
import app from "../../server.js";
import userModel from "../../models/userModel.js";
import { generateToken } from "../../services/authService.js";

import mongoose from "mongoose";

describe("INTEGRATION: User Management", () => {
    let testToken;
    let testUser;

    // Runs once before any tests start
    beforeAll(async () => {
        // Ensure database connection is ready
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || "green-rent" });
        }

        // Create a real test user in the DB
        testUser = await userModel.create({
            name: "Integration Tester",
            email: `int${Date.now()}@example.com`,
            password: "password123",
            role: "user"
        });

        // Generate token for testing authenticated routes
        testToken = generateToken(testUser._id, testUser.role, testUser.email, testUser.name);
    });

    // Runs once after all tests finish
    afterAll(async () => {
        // Clean up the created test user
        if (testUser) {
            await userModel.findByIdAndDelete(testUser._id);
        }

        // VERY IMPORTANT: Close the database connection to allow Jest to exit properly
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe("GET /api/user/data", () => {
        it("should return user data for authenticated request (Cookie)", async () => {
            const res = await request(app)
                .get("/api/user/data")
                .set("Cookie", [`token=${testToken}`]);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.userData.email).toBe(testUser.email);
        });

        it("should return user data for authenticated request (Header)", async () => {
            const res = await request(app)
                .get("/api/user/data")
                .set("Authorization", `Bearer ${testToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it("should return 401 for unauthorized request", async () => {
            const res = await request(app).get("/api/user/data");
            expect(res.statusCode).toEqual(401);
        });
    });
});
