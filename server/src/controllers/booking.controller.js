import {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  updatePaymentStatus,
  cancelBooking,
  requestRefund,
  processRefundByAdmin,
  rejectRefundByAdmin,
  expireBookingById,
  deleteBooking,
  checkAvailability,
} from "../services/booking.service.js";
import { validationResult } from "express-validator";
import {
  validateCreateBooking,
  validateUpdateBooking,
  handleValidationErrors,
} from "../validators/bookingValidators.js";

const getBookingOwnerId = (booking) => {
  const rawUserId = booking?.userId;
  if (!rawUserId) return null;
  if (typeof rawUserId === "string") return rawUserId;
  if (typeof rawUserId === "object") {
    if (rawUserId._id) return String(rawUserId._id);
    if (typeof rawUserId.toString === "function") return rawUserId.toString();
  }
  return String(rawUserId);
};

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBookingHandler = async (req, res) => {
  try {
    // Validate input
    await Promise.all(
      validateCreateBooking.map((validation) => validation.run(req))
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((error) => error.msg),
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required to create a booking" });
    }
    // Always use the authenticated user so "my bookings" matches (ignore body.userId)
    const bookingData = {
      ...req.body,
      userId,
    };

    const booking = await createBooking(bookingData);
    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    
    // Handle specific error types
    if (error.message.includes("not available")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    return res.status(500).json({ message: "Failed to create booking" });
  }
};

/**
 * Get all bookings (Admin only)
 * GET /api/bookings
 */
export const getAllBookingsHandler = async (req, res) => {
  try {
    const filters = {};
    
    // Optional filters
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.paymentStatus) {
      filters.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.apartmentId) {
      filters.apartmentId = req.query.apartmentId;
    }

    const bookings = await getAllBookings(filters);
    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/**
 * Get current user's bookings
 * GET /api/bookings/my
 */
export const getMyBookingsHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const bookings = await getUserBookings(userId);
    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return res.status(500).json({ message: "Failed to fetch your bookings" });
  }
};

/**
 * Get a single booking by ID
 * GET /api/bookings/:id
 */
export const getBookingByIdHandler = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user has permission to view this booking
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    // Users can only view their own bookings unless they're admin
    if (userRole !== "admin" && getBookingOwnerId(booking) !== userId) {
      return res.status(403).json({ 
        message: "Access denied. You can only view your own bookings." 
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("Get booking by ID error:", error);
    return res.status(500).json({ message: "Failed to fetch booking" });
  }
};

/**
 * Update a booking
 * PUT /api/bookings/:id
 */
export const updateBookingHandler = async (req, res) => {
  try {
    // Validate input
    await Promise.all(
      validateUpdateBooking.map((validation) => validation.run(req))
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((error) => error.msg),
      });
    }

    // Check if booking exists and user has permission
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Users can only update their own bookings unless they're admin
    if (userRole !== "admin" && getBookingOwnerId(booking) !== userId) {
      return res.status(403).json({ 
        message: "Access denied. You can only update your own bookings." 
      });
    }

    const updatedBooking = await updateBooking(req.params.id, req.body);
    return res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    
    if (error.message.includes("not available")) {
      return res.status(409).json({ message: error.message });
    }
    
    return res.status(500).json({ message: "Failed to update booking" });
  }
};

/**
 * Update booking status (Admin/Landlord only)
 * PUT /api/bookings/:id/status
 */
export const updateBookingStatusHandler = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "expired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Status must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const approvedBy = req.user?.id;
    const updatedBooking = await updateBookingStatus(id, status, approvedBy);
    
    return res.status(200).json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({ message: "Failed to update booking status" });
  }
};

/**
 * Update payment status
 * PUT /api/bookings/:id/payment
 */
export const updatePaymentStatusHandler = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const { id } = req.params;

    if (!paymentStatus) {
      return res.status(400).json({ message: "Payment status is required" });
    }

    const validPaymentStatuses = ["unpaid", "paid"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        message: `Payment status must be one of: ${validPaymentStatuses.join(", ")}` 
      });
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Users can only update payment status for their own bookings unless they're admin
    if (userRole !== "admin" && getBookingOwnerId(booking) !== userId) {
      return res.status(403).json({ 
        message: "Access denied. You can only update payment status for your own bookings." 
      });
    }

    const updatedBooking = await updatePaymentStatus(id, paymentStatus);
    
    return res.status(200).json({
      message: "Payment status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({ message: "Failed to update payment status" });
  }
};

/**
 * Cancel a booking
 * PUT /api/bookings/:id/cancel
 */
export const cancelBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Users can only cancel their own bookings unless they're admin
    if (userRole !== "admin" && getBookingOwnerId(booking) !== userId) {
      return res.status(403).json({ 
        message: "Access denied. You can only cancel your own bookings." 
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed booking" });
    }

    const cancelledBooking = await cancelBooking(id, cancellationReason);
    
    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    if (error.message === "CancellationWindowExpired") {
      return res.status(400).json({ message: "Booking can only be cancelled within 3 days of placement." });
    }
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
};

/**
 * Request refund for a booking
 * PUT /api/bookings/:id/refund-request
 */
export const requestRefundHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundReason } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== "admin" && getBookingOwnerId(booking) !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only request refund for your own booking.",
      });
    }

    const updatedBooking = await requestRefund(id, refundReason);
    return res.status(200).json({
      message: "Refund request submitted successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    if (error.message === "RefundAllowedOnlyForPaidBookings") {
      return res.status(400).json({ message: "Refund can only be requested for paid bookings." });
    }
    if (error.message === "RefundRequiresCancelledBooking") {
      return res.status(400).json({ message: "Cancel the booking first before requesting a refund." });
    }
    if (error.message === "RefundAlreadyRequestedOrProcessed") {
      return res.status(400).json({ message: "Refund request is already in progress or completed." });
    }
    console.error("Request refund error:", error);
    return res.status(500).json({ message: "Failed to request refund" });
  }
};

/**
 * Process refund for a booking (Admin only)
 * PUT /api/bookings/:id/refund
 */
export const processRefundByAdminHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundReason } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedBooking = await processRefundByAdmin(id, refundReason);
    return res.status(200).json({
      message: "Refund processed successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    if (error.message === "RefundAllowedOnlyForPaidBookings") {
      return res.status(400).json({ message: "Refund can only be processed for paid bookings." });
    }
    if (error.message === "RefundRequiresCancelledBooking") {
      return res.status(400).json({ message: "Only cancelled bookings can be refunded." });
    }
    if (error.message === "RefundAlreadyCompleted") {
      return res.status(400).json({ message: "Refund has already been completed for this booking." });
    }
    console.error("Process refund error:", error);
    return res.status(500).json({ message: "Failed to process refund" });
  }
};

/**
 * Reject refund for a booking (Admin only)
 * PUT /api/bookings/:id/refund/reject
 */
export const rejectRefundByAdminHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundReason } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedBooking = await rejectRefundByAdmin(id, refundReason);
    return res.status(200).json({
      message: "Refund request rejected successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    if (error.message === "RefundAllowedOnlyForPaidBookings") {
      return res.status(400).json({ message: "Refund can only be processed for paid bookings." });
    }
    if (error.message === "RefundRequiresCancelledBooking") {
      return res.status(400).json({ message: "Only cancelled bookings can be refunded." });
    }
    if (error.message === "RefundAlreadyCompleted") {
      return res.status(400).json({ message: "Refund has already been completed for this booking." });
    }
    console.error("Reject refund error:", error);
    return res.status(500).json({ message: "Failed to reject refund request" });
  }
};

/**
 * Expire booking when payment timeout has passed
 * PUT /api/bookings/:id/expire
 */
export const expireBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (userRole !== "admin" && getBookingOwnerId(booking) !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only expire your own bookings.",
      });
    }

    const updatedBooking = await expireBookingById(id);
    return res.status(200).json({
      message: "Booking expiry evaluated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Expire booking error:", error);
    return res.status(500).json({ message: "Failed to expire booking" });
  }
};

/**
 * Delete a booking (Admin only)
 * DELETE /api/bookings/:id
 */
export const deleteBookingHandler = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await deleteBooking(req.params.id);
    
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    return res.status(500).json({ message: "Failed to delete booking" });
  }
};

/**
 * Check apartment availability
 * POST /api/bookings/check-availability
 */
export const checkAvailabilityHandler = async (req, res) => {
  try {
    const { apartmentId, checkInDate, checkOutDate } = req.body;

    if (!apartmentId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        message: "apartmentId, checkInDate, and checkOutDate are required" 
      });
    }

    const isAvailable = await checkAvailability(
      apartmentId,
      checkInDate,
      checkOutDate
    );

    return res.status(200).json({
      available: isAvailable,
      apartmentId,
      checkInDate,
      checkOutDate,
    });
  } catch (error) {
    console.error("Check availability error:", error);
    return res.status(500).json({ message: "Failed to check availability" });
  }
};
