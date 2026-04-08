import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

let allowAuth = true;
let allowRole = true;

const handlers = {
  createRenterReviewHandler: jest.fn((req, res) => res.status(201).json({ ok: true })),
  getListingReviewsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getEcoRatingReviewsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getMyReviewsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getReviewByIdHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  updateRenterReviewHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  deleteRenterReviewHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  updateReviewStatusHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  markReviewHelpfulHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getListingAveragesHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getAdminReviewsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  addReviewReplyHandler: jest.fn((req, res) => res.status(201).json({ ok: true })),
  deleteReviewReplyHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
};

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  authenticate: (req, res, next) => {
    if (!allowAuth) return res.status(401).json({ message: "unauthorized" });
    return next();
  },
  authorize: () => (req, res, next) => {
    if (!allowRole) return res.status(403).json({ message: "forbidden" });
    return next();
  },
}));

jest.unstable_mockModule("../../controllers/renterReviewController.js", () => handlers);

const { default: renterReviewRoutes } = await import("../../routes/renterReviewRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/renter-reviews", renterReviewRoutes);

describe("renterReviewRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    allowAuth = true;
    allowRole = true;
  });

  test("GET /listing/:listingId is public", async () => {
    const res = await request(app).get("/api/renter-reviews/listing/l1");
    expect(res.status).toBe(200);
    expect(handlers.getListingReviewsHandler).toHaveBeenCalled();
  });

  test("GET /admin/list requires auth", async () => {
    allowAuth = false;
    const res = await request(app).get("/api/renter-reviews/admin/list");
    expect(res.status).toBe(401);
    expect(handlers.getAdminReviewsHandler).not.toHaveBeenCalled();
  });

  test("PATCH /:id/status blocked by role middleware", async () => {
    allowRole = false;
    const res = await request(app).patch("/api/renter-reviews/r1/status").send({ status: "approved" });
    expect(res.status).toBe(403);
    expect(handlers.updateReviewStatusHandler).not.toHaveBeenCalled();
  });
});
