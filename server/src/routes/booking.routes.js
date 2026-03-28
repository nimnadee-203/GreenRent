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

// Cancel booking
router.put("/:id/cancel", authenticate, cancelBookingHandler);


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

// Delete booking permanently (Admin only)
router.delete("/:id", authenticate, authorize("admin"), deleteBookingHandler);


export default router;