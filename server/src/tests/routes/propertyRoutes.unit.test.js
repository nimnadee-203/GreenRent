import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

let allowUserAuth = true;
let allowSeller = true;

const handlers = {
  createPropertyHandler: jest.fn((req, res) => res.status(201).json({ ok: true })),
  listPropertiesHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getPropertyByIdHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getPropertyNearbyPlacesHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  updatePropertyHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  deletePropertyHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  deleteAllPropertiesHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  clearEcoRatingHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
};

jest.unstable_mockModule("../../middleware/user.auth.js", () => ({
  default: (req, res, next) => {
    if (!allowUserAuth) return res.status(401).json({ message: "unauthorized" });
    return next();
  },
}));

jest.unstable_mockModule("../../middleware/role.middleware.js", () => ({
  isSeller: (req, res, next) => {
    if (!allowSeller) return res.status(403).json({ message: "forbidden" });
    return next();
  },
}));

jest.unstable_mockModule("../../controllers/propertyController.js", () => handlers);

const { default: propertyRoutes } = await import("../../routes/propertyRoutes.backup.js");

const app = express();
app.use(express.json());
app.use("/api/properties", propertyRoutes);

describe("propertyRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    allowUserAuth = true;
    allowSeller = true;
  });

  test("GET / is public", async () => {
    const res = await request(app).get("/api/properties");
    expect(res.status).toBe(200);
    expect(handlers.listPropertiesHandler).toHaveBeenCalled();
  });

  test("GET /:id/nearby is public", async () => {
    const res = await request(app).get("/api/properties/p1/nearby");
    expect(res.status).toBe(200);
    expect(handlers.getPropertyNearbyPlacesHandler).toHaveBeenCalled();
  });

  test("POST / blocked when seller check fails", async () => {
    allowSeller = false;
    const res = await request(app).post("/api/properties").send({});
    expect(res.status).toBe(403);
    expect(handlers.createPropertyHandler).not.toHaveBeenCalled();
  });
});
