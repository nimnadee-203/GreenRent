import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createBookingHandler,
  getAllBookingsHandler,
  getMyBookingsHandler,
  getBookingByIdHandler,
  updateBookingHandler,
  updateBookingStatusHandler,
  updatePaymentStatusHandler,
  cancelBookingHandler,
  deleteBookingHandler,
  checkAvailabilityHandler,
  createPaymentSessionHandler,
} from "../controllers/booking.controller.js";

const router = Router();

// Public
router.post("/check-availability", checkAvailabilityHandler);

// Authenticated
router.get("/my", authenticate, getMyBookingsHandler);
router.post("/", authenticate, createBookingHandler);

// Admin
router.get("/admin/all", authenticate, authorize("admin"), getAllBookingsHandler);
router.put("/admin/status/:id", authenticate, authorize("admin", "landlord"), updateBookingStatusHandler);
router.delete("/admin/delete/:id", authenticate, authorize("admin"), deleteBookingHandler);

// User specific actions (Explicit paths)
router.get("/get/:id", authenticate, getBookingByIdHandler);
router.put("/cancel/:id", authenticate, cancelBookingHandler);
router.put("/payment/:id", authenticate, updatePaymentStatusHandler);
router.post("/pay-session/:id", authenticate, createPaymentSessionHandler);
router.put("/details/:id", authenticate, updateBookingHandler);

export default router;
