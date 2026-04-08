import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

import propertyRoutes from "../../routes/propertyRoutes.backup.js";
import userModel from "../../models/userModel.js";
import Property from "../../models/Property.js";

describe("Property Resource CRUD Integration", () => {
  let app;
  let mongod;
  let sellerUser;
  let sellerToken;
  let createdPropertyId;

  const validPropertyPayload = {
    title: "Eco Apartment Downtown",
    description: "A modern eco-friendly apartment with great ventilation.",
    location: {
      address: "123 Green Street, Colombo",
      city: "Colombo",
      country: "Sri Lanka",
      coordinates: { lat: 6.9271, lng: 79.8612 },
    },
    price: 85000,
    stayType: "long",
    monthlyPrice: 85000,
    propertyType: "apartment",
    ecoFeatures: {
      solarPanels: true,
      ledLighting: true,
      recyclingAvailable: true,
    },
    images: ["https://example.com/property-1.jpg"],
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: "greenrent-integration-test" });

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/properties", propertyRoutes);

    sellerUser = await userModel.create({
      name: "Integration Seller",
      email: "integration-seller@example.com",
      password: "password123",
      role: "seller",
    });

    sellerToken = jwt.sign(
      { id: sellerUser._id.toString(), role: sellerUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterEach(async () => {
    await Property.deleteMany({});
  });

  afterAll(async () => {
    await Property.deleteMany({});
    await userModel.deleteMany({ email: "integration-seller@example.com" });
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  describe("POST /api/properties", () => {
    it("should create data successfully (201)", async () => {
      const response = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe(validPropertyPayload.title);
      createdPropertyId = response.body._id;
    });

    it("should return 400 for invalid input", async () => {
      const invalidPayload = {
        ...validPropertyPayload,
        title: "Bad",
      };

      const response = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).post("/api/properties").send(validPropertyPayload);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/properties", () => {
    it("should get all data (200)", async () => {
      await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      const response = await request(app).get("/api/properties");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/properties/:id", () => {
    it("should get single item (200)", async () => {
      const created = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      const propertyId = created.body._id;

      const response = await request(app).get(`/api/properties/${propertyId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(propertyId);
      expect(response.body.title).toBe(validPropertyPayload.title);
    });

    it("should return 404 when item is not found", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app).get(`/api/properties/${nonExistingId}`);

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/properties/:id", () => {
    it("should update item successfully (200)", async () => {
      const created = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      const propertyId = created.body._id;
      const updatePayload = {
        title: "Updated Eco Apartment Title",
        price: 95000,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatePayload.title);
      expect(response.body.price).toBe(updatePayload.price);
    });

    it("should return 400 for invalid update payload", async () => {
      const created = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      const propertyId = created.body._id;

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({ title: "no" });

      expect(response.status).toBe(400);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 404 when updating non-existing item", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/api/properties/${nonExistingId}`)
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({ title: "Updated But Missing" });

      expect(response.status).toBe(404);
    });

    it("should return 401 for unauthorized update", async () => {
      const created = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      const propertyId = created.body._id;

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .send({ title: "Unauthorized Update" });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/properties/:id", () => {
    it("should delete item successfully (200)", async () => {
      const created = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      const propertyId = created.body._id;

      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      const getDeleted = await request(app).get(`/api/properties/${propertyId}`);
      expect(getDeleted.status).toBe(404);
    });

    it("should return 404 when deleting non-existing item", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/properties/${nonExistingId}`)
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(response.status).toBe(404);
    });

    it("should return 401 for unauthorized delete", async () => {
      const created = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validPropertyPayload);

      const propertyId = created.body._id;

      const response = await request(app).delete(`/api/properties/${propertyId}`);

      expect(response.status).toBe(401);
    });
  });
});
