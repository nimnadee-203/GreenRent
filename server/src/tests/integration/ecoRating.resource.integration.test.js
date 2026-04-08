import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

import ecoRatingRoutes from "../../routes/ecoRatingRoutes.js";
import userModel from "../../models/userModel.js";
import Property from "../../models/Property.js";
import EcoRating from "../../models/EcoRating.js";

describe("Eco Rating Resource CRUD Integration", () => {
  let app;
  let mongod;
  let sellerUser;
  let adminUser;
  let sellerToken;
  let adminToken;
  let listingProperty;

  const validEcoRatingPayload = () => ({
    listingId: listingProperty._id.toString(),
    location: {
      latitude: 6.9271,
      longitude: 79.8612,
      address: "Colombo 03, Sri Lanka",
    },
    criteria: {
      energyRating: "A",
      solarPanels: true,
      ledLighting: true,
      efficientAc: true,
      waterSavingTaps: true,
      rainwaterHarvesting: false,
      waterMeter: true,
      recyclingAvailable: true,
      compostAvailable: false,
      transportDistance: "< 1 km",
      evCharging: false,
      goodVentilationSunlight: true,
    },
    evidenceLinks: ["https://example.com/evidence-1.jpg"],
    notes: "Initial eco profile for listing.",
  });

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: "greenrent-eco-integration-test" });

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/eco-ratings", ecoRatingRoutes);

    sellerUser = await userModel.create({
      name: "Integration Eco Seller",
      email: "integration-eco-seller@example.com",
      password: "password123",
      role: "seller",
    });

    adminUser = await userModel.create({
      name: "Integration Eco Admin",
      email: "integration-eco-admin@example.com",
      password: "password123",
      role: "admin",
    });

    sellerToken = jwt.sign(
      { id: sellerUser._id.toString(), role: sellerUser.role, email: sellerUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { id: adminUser._id.toString(), role: adminUser.role, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    listingProperty = await Property.create({
      title: "Eco Rating Test Apartment",
      description: "A property used to test eco rating integration CRUD.",
      location: {
        address: "789 Eco Street, Colombo",
        city: "Colombo",
        country: "Sri Lanka",
        coordinates: { lat: 6.9271, lng: 79.8612 },
      },
      price: 90000,
      stayType: "long",
      monthlyPrice: 90000,
      propertyType: "apartment",
      ecoFeatures: { ledLighting: true },
      ownerId: sellerUser._id.toString(),
      images: ["https://example.com/property-eco.jpg"],
      availabilityStatus: "available",
    });
  });

  afterEach(async () => {
    await EcoRating.deleteMany({});
    await Property.findByIdAndUpdate(listingProperty._id, {
      $set: { ecoRatingId: null, ecoRatingClearedAt: null },
    });
  });

  afterAll(async () => {
    await EcoRating.deleteMany({});
    await Property.deleteMany({});
    await userModel.deleteMany({
      email: {
        $in: ["integration-eco-seller@example.com", "integration-eco-admin@example.com"],
      },
    });

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  describe("POST /api/eco-ratings", () => {
    it("should create data successfully (201)", async () => {
      const response = await request(app)
        .post("/api/eco-ratings")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validEcoRatingPayload());

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("totalScore");
      expect(response.body.listingId).toBe(listingProperty._id.toString());
    });

    it("should return 400 for invalid input", async () => {
      const invalidPayload = {
        ...validEcoRatingPayload(),
        criteria: {
          ...validEcoRatingPayload().criteria,
          energyRating: "Z",
        },
      };

      const response = await request(app)
        .post("/api/eco-ratings")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).post("/api/eco-ratings").send(validEcoRatingPayload());

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/eco-ratings", () => {
    it("should get all data (200)", async () => {
      await request(app)
        .post("/api/eco-ratings")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validEcoRatingPayload());

      const response = await request(app).get("/api/eco-ratings");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/eco-ratings/:id", () => {
    it("should get single item (200)", async () => {
      const created = await request(app)
        .post("/api/eco-ratings")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validEcoRatingPayload());

      const ecoId = created.body._id;

      const response = await request(app).get(`/api/eco-ratings/${ecoId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(ecoId);
    });

    it("should return 404 when item is not found", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app).get(`/api/eco-ratings/${nonExistingId}`);

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/eco-ratings/:id", () => {
    it("should update item successfully (200)", async () => {
      const created = await request(app)
        .post("/api/eco-ratings")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validEcoRatingPayload());

      const ecoId = created.body._id;
      const updatePayload = {
        notes: "Updated eco notes",
        criteria: {
          ledLighting: false,
          compostAvailable: true,
        },
      };

      const response = await request(app)
        .put(`/api/eco-ratings/${ecoId}`)
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.notes).toBe("Updated eco notes");
      expect(response.body.criteria.ledLighting).toBe(false);
      expect(response.body.criteria.compostAvailable).toBe(true);
    });

    it("should return 400 for invalid update payload", async () => {
      const created = await request(app)
        .post("/api/eco-ratings")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validEcoRatingPayload());

      const ecoId = created.body._id;

      const response = await request(app)
        .put(`/api/eco-ratings/${ecoId}`)
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({ criteria: { transportDistance: "invalid-distance" } });

      expect(response.status).toBe(400);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 404 when updating non-existing item", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/api/eco-ratings/${nonExistingId}`)
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({ notes: "No such eco rating" });

      expect(response.status).toBe(404);
    });

    it("should return 401 for unauthorized update", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/api/eco-ratings/${nonExistingId}`)
        .send({ notes: "Unauthorized" });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/eco-ratings/:id", () => {
    it("should delete item successfully (200)", async () => {
      const created = await request(app)
        .post("/api/eco-ratings")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(validEcoRatingPayload());

      const ecoId = created.body._id;

      const response = await request(app)
        .delete(`/api/eco-ratings/${ecoId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      const fetchDeleted = await request(app).get(`/api/eco-ratings/${ecoId}`);
      expect(fetchDeleted.status).toBe(404);
    });

    it("should return 404 when deleting non-existing item", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/eco-ratings/${nonExistingId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it("should return 401 for unauthorized delete", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).delete(`/api/eco-ratings/${nonExistingId}`);

      expect(response.status).toBe(401);
    });
  });
});
