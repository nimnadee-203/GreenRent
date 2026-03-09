import request from "supertest";
import app from "../server.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

describe("Authentication Endpoints", () => {
    let testUser = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "password123"
    };

    afterAll(async () => {
        // Clean up test users
        await userModel.deleteMany({ email: /test.*@example.com/ });
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it("should return 400 for missing fields", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({ email: "onlyemail@example.com" });

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 409 for duplicate user", async () => {
            await request(app).post("/api/auth/register").send(testUser);
            const res = await request(app).post("/api/auth/register").send(testUser);

            expect(res.statusCode).toEqual(409);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login successfully with correct credentials", async () => {
            // Ensure user exists
            await request(app).post("/api/auth/register").send({
                name: "Login User",
                email: "login@example.com",
                password: "password123"
            });

            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "login@example.com",
                    password: "password123"
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it("should return 401 for invalid credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "wrongpassword"
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should logout successfully", async () => {
            const res = await request(app).post("/api/auth/logout");
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });
});
