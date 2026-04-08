import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

let allowUserAuth = true;
let allowRole = true;

const handlers = {
  createBookingHandler: jest.fn((req, res) => res.status(201).json({ ok: true })),
  getAllBookingsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getMyBookingsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  getBookingByIdHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  updateBookingHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  updateBookingStatusHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  updatePaymentStatusHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  cancelBookingHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  requestRefundHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  processRefundByAdminHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  rejectRefundByAdminHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  expireBookingHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  deleteBookingHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  checkAvailabilityHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
};

jest.unstable_mockModule("../../middleware/user.auth.js", () => ({
  default: (req, res, next) => {
    if (!allowUserAuth) return res.status(401).json({ message: "unauthorized" });
    req.user = { role: "admin" };
    return next();
  },
}));

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn(() => (req, res, next) => {
    if (!allowRole) return res.status(403).json({ message: "forbidden" });
    return next();
  }),
}));

jest.unstable_mockModule("../../controllers/booking.controller.js", () => handlers);

const { default: bookingRoutes } = await import("../../routes/booking.routes.js");

const app = express();
app.use(express.json());
app.use("/api/bookings", bookingRoutes);

describe("booking.routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    allowUserAuth = true;
    allowRole = true;
  });

  test("POST /check-availability is public", async () => {
    const res = await request(app).post("/api/bookings/check-availability").send({});

    expect(res.status).toBe(200);
    expect(handlers.checkAvailabilityHandler).toHaveBeenCalled();
  });

  test("GET / requires authentication", async () => {
    allowUserAuth = false;

    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(401);
    expect(handlers.getAllBookingsHandler).not.toHaveBeenCalled();
  });

  test("GET / returns 403 when role middleware blocks", async () => {
    allowRole = false;

    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(403);
    expect(handlers.getAllBookingsHandler).not.toHaveBeenCalled();
  });
});
