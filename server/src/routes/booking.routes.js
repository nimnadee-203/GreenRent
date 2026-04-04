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
  requestRefundHandler,
  processRefundByAdminHandler,
  expireBookingHandler,
  deleteBookingHandler,
  checkAvailabilityHandler,
} from "../controllers/booking.controller.js";

const router = Router();

/**
 * =========================================
 * PUBLIC ROUTES
 * =========================================
 */

// Check apartment availability (No authentication required)
router.post("/check-availability", checkAvailabilityHandler);


/**
 * =========================================
 * USER ROUTES (Authenticated Users)
 * =========================================
 */

// Create booking
router.post("/", authenticate, createBookingHandler);

// Get logged-in user's bookings
router.get("/my", authenticate, getMyBookingsHandler);

// Get single booking by ID (user can only view their own booking)
router.get("/:id", authenticate, getBookingByIdHandler);

// Update own booking
router.put("/:id", authenticate, updateBookingHandler);

// Update payment status (for own booking)
router.put("/:id/payment", authenticate, updatePaymentStatusHandler);

// Expire booking when payment timeout elapsed
router.put("/:id/expire", authenticate, expireBookingHandler);

// Cancel booking
router.put("/:id/cancel", authenticate, cancelBookingHandler);

// Request refund for cancelled paid booking
router.put("/:id/refund-request", authenticate, requestRefundHandler);


/**
 * =========================================
 * ADMIN ROUTES
 * =========================================
 */

// Get all bookings (Admin only)
router.get("/", authenticate, authorize("admin"), getAllBookingsHandler);

// Update booking status (Admin or Landlord)
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "landlord"),
  updateBookingStatusHandler
);

// Process refund (Admin only)
router.put("/:id/refund", authenticate, authorize("admin"), processRefundByAdminHandler);

// Delete booking permanently (Admin only)
router.delete("/:id", authenticate, authorize("admin"), deleteBookingHandler);


export default router;