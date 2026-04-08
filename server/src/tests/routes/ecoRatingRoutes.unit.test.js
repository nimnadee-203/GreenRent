import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

let allowAuth = true;

const handlers = {
  createEcoRatingHandler: jest.fn((req, res) => res.status(201).json({ ok: true })),
  listEcoRatingsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getEcoRatingByIdHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  updateEcoRatingHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  deleteEcoRatingHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
};

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  authenticate: (req, res, next) => {
    if (!allowAuth) return res.status(401).json({ message: "unauthorized" });
    return next();
  },
  authorize: () => (req, res, next) => next(),
}));

jest.unstable_mockModule("../../controllers/ecoRatingController.js", () => handlers);

const { default: ecoRoutes } = await import("../../routes/ecoRatingRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/eco-ratings", ecoRoutes);

describe("ecoRatingRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    allowAuth = true;
  });

  test("GET / is public", async () => {
    const res = await request(app).get("/api/eco-ratings");
    expect(res.status).toBe(200);
    expect(handlers.listEcoRatingsHandler).toHaveBeenCalled();
  });

  test("GET /:id is public", async () => {
    const res = await request(app).get("/api/eco-ratings/abc");
    expect(res.status).toBe(200);
    expect(handlers.getEcoRatingByIdHandler).toHaveBeenCalled();
  });

  test("POST / requires auth", async () => {
    allowAuth = false;
    const res = await request(app).post("/api/eco-ratings").send({});
    expect(res.status).toBe(401);
    expect(handlers.createEcoRatingHandler).not.toHaveBeenCalled();
  });
});
