import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validationResult } from "express-validator";
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
 * ROUTE ACCESS EXPLANATION:
 * 
 * USER ROUTES (Authenticated users):
 * - POST /api/bookings - Create a booking (any authenticated user)
 * - GET /api/bookings/my - Get own bookings (any authenticated user)
 * - GET /api/bookings/:id - Get own booking by ID (users can only view their own)
 * - PUT /api/bookings/:id - Update own booking (users can only update their own)
 * - PUT /api/bookings/:id/payment - Update payment status for own booking
 * - PUT /api/bookings/:id/cancel - Cancel own booking
 * - POST /api/bookings/check-availability - Check availability (public or authenticated)
 * 
 * ADMIN ROUTES (Admin only):
 * - GET /api/bookings - Get all bookings (admin only)
 * - GET /api/bookings/:id - Get any booking by ID (admin can view all)
 * - PUT /api/bookings/:id - Update any booking (admin can update all)
 * - PUT /api/bookings/:id/status - Update booking status (admin/landlord)
 * - PUT /api/bookings/:id/payment - Update payment status for any booking (admin)
 * - PUT /api/bookings/:id/cancel - Cancel any booking (admin)
 * - DELETE /api/bookings/:id - Delete booking permanently (admin only)
 */

// Public route - Check availability (no auth required)
router.post("/check-availability", checkAvailabilityHandler);

// User routes - Require authentication
router.post("/", authenticate, createBookingHandler);
router.get("/my", authenticate, getMyBookingsHandler);
router.get("/:id", authenticate, getBookingByIdHandler);
router.put("/:id", authenticate, updateBookingHandler);
router.put("/:id/payment", authenticate, updatePaymentStatusHandler);
router.put("/:id/cancel", authenticate, cancelBookingHandler);

// Admin routes - Require admin role
router.get("/", authenticate, authorize("admin"), getAllBookingsHandler);
router.put("/:id/status", authenticate, authorize("admin", "landlord"), updateBookingStatusHandler);
router.delete("/:id", authenticate, authorize("admin"), deleteBookingHandler);

export default router;
