import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

import bookingRoutes from "../../routes/booking.routes.js";
import userModel from "../../models/userModel.js";
import Property from "../../models/Property.js";
import Booking from "../../models/booking.model.js";

describe("Booking Resource CRUD Integration", () => {
  let app;
  let mongod;
  let renterUser;
  let adminUser;
  let renterToken;
  let adminToken;
  let property;

  const buildCreateBookingPayload = () => {
    const checkIn = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const checkOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return {
      apartmentId: property._id.toString(),
      stayType: "short",
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      numberOfGuests: 2,
    };
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: "greenrent-booking-integration-test" });

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/bookings", bookingRoutes);

    renterUser = await userModel.create({
      name: "Integration Renter",
      email: "integration-renter@example.com",
      password: "password123",
      role: "user",
    });

    adminUser = await userModel.create({
      name: "Integration Admin",
      email: "integration-admin@example.com",
      password: "password123",
      role: "admin",
    });

    renterToken = jwt.sign(
      { id: renterUser._id.toString(), role: renterUser.role, email: renterUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { id: adminUser._id.toString(), role: adminUser.role, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    property = await Property.create({
      title: "Booking Test Apartment",
      description: "Eco-friendly apartment for booking integration tests.",
      location: {
        address: "456 Booking Avenue, Colombo",
        city: "Colombo",
        country: "Sri Lanka",
        coordinates: { lat: 6.9271, lng: 79.8612 },
      },
      price: 15000,
      stayType: "both",
      monthlyPrice: 120000,
      dailyPrice: 15000,
      propertyType: "apartment",
      ecoFeatures: { ledLighting: true, solarPanels: true },
      ownerId: adminUser._id.toString(),
      images: ["https://example.com/booking-test.jpg"],
      availabilityStatus: "available",
    });
  });

  afterEach(async () => {
    await Booking.deleteMany({});
  });

  afterAll(async () => {
    await Booking.deleteMany({});
    await Property.deleteMany({});
    await userModel.deleteMany({
      email: { $in: ["integration-renter@example.com", "integration-admin@example.com"] },
    });

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  describe("POST /api/bookings", () => {
    it("should create data successfully (201)", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${renterToken}`)
        .send(buildCreateBookingPayload());

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("booking");
      expect(response.body.booking).toHaveProperty("_id");
      expect(response.body.booking.stayType).toBe("short");
    });

    it("should return 400 for invalid input", async () => {
      const badPayload = {
        apartmentId: property._id.toString(),
        stayType: "invalid-type",
        checkInDate: "invalid-date",
      };

      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${renterToken}`)
        .send(badPayload);

      expect(response.status).toBe(400);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).post("/api/bookings").send(buildCreateBookingPayload());

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/bookings", () => {
    it("should get all data for admin (200)", async () => {
      await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${renterToken}`)
        .send(buildCreateBookingPayload());

      const response = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.bookings)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).get("/api/bookings");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/bookings/:id", () => {
    it("should get single item (200)", async () => {
      const created = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${renterToken}`)
        .send(buildCreateBookingPayload());

      const bookingId = created.body.booking._id;

      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${renterToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(bookingId);
    });

    it("should return 404 when item is not found", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/bookings/${nonExistingId}`)
        .set("Authorization", `Bearer ${renterToken}`);

      expect(response.status).toBe(404);
    });

    it("should return 401 for unauthorized access", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/bookings/${nonExistingId}`);
      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/bookings/:id", () => {
    it("should update item successfully (200)", async () => {
      const created = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${renterToken}`)
        .send(buildCreateBookingPayload());

      const bookingId = created.body.booking._id;
      const updatePayload = { numberOfGuests: 3 };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${renterToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.booking.numberOfGuests).toBe(3);
    });

    it("should return 400 for invalid update payload", async () => {
      const created = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${renterToken}`)
        .send(buildCreateBookingPayload());

      const bookingId = created.body.booking._id;

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${renterToken}`)
        .send({ numberOfGuests: 0 });

      expect(response.status).toBe(400);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 404 when updating non-existing item", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/api/bookings/${nonExistingId}`)
        .set("Authorization", `Bearer ${renterToken}`)
        .send({ numberOfGuests: 2 });

      expect(response.status).toBe(404);
    });

    it("should return 401 for unauthorized update", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/api/bookings/${nonExistingId}`)
        .send({ numberOfGuests: 2 });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/bookings/:id", () => {
    it("should delete item successfully (200)", async () => {
      const created = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${renterToken}`)
        .send(buildCreateBookingPayload());

      const bookingId = created.body.booking._id;

      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      const fetchDeleted = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${renterToken}`);

      expect(fetchDeleted.status).toBe(404);
    });

    it("should return 404 when deleting non-existing item", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/bookings/${nonExistingId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it("should return 401 for unauthorized delete", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const response = await request(app).delete(`/api/bookings/${nonExistingId}`);

      expect(response.status).toBe(401);
    });
  });
});
