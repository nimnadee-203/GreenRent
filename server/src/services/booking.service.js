import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Property from "../models/Property.js";

const getDailyRate = (property) => {
  if (property.dailyPrice != null && property.dailyPrice !== "") {
    return Number(property.dailyPrice);
  }
  return Number(property.price ?? 0);
};

const getMonthlyRate = (property) => {
  if (property.monthlyPrice != null && property.monthlyPrice !== "") {
    return Number(property.monthlyPrice);
  }
  return Number(property.price ?? 0);
};

/**
 * Calculate total price based on stay type (uses dailyPrice / monthlyPrice when set)
 * @param {string} stayType - "short" or "long"
 * @param {Date} checkInDate - Check-in date
 * @param {Date} checkOutDate - Check-out date
 * @param {Object} property - Property with price, dailyPrice, monthlyPrice
 * @param {{ months?: number }} [options] - For long stays, optional explicit month count from the client
 * @returns {number} - Calculated total price
 */
export const calculateTotalPrice = (stayType, checkInDate, checkOutDate, property, options = {}) => {
  if (!property) {
    throw new Error("Property is required");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (stayType === "short") {
    const nightly = getDailyRate(property);
    if (!Number.isFinite(nightly) || nightly < 0) {
      throw new Error("Property daily rate is required for short stays");
    }
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / oneDay));
    return nightly * nights;
  }

  if (stayType === "long") {
    const monthly = getMonthlyRate(property);
    if (!Number.isFinite(monthly) || monthly < 0) {
      throw new Error("Property monthly rate is required for long stays");
    }
    const explicitMonths = options.months != null ? Number(options.months) : NaN;
    if (Number.isFinite(explicitMonths) && explicitMonths > 0) {
      return monthly * explicitMonths;
    }
    const monthsDiff =
      (checkOut.getFullYear() - checkIn.getFullYear()) * 12 +
      (checkOut.getMonth() - checkIn.getMonth());
    const months = Math.max(1, Math.ceil(monthsDiff));
    return monthly * months;
  }

  throw new Error(`Invalid stay type: ${stayType}`);
};

/**
 * Check if apartment is available for the given dates
 * Prevents overlapping bookings (excluding cancelled ones)
 * Also checks Property's availabilityStatus
 * @param {string} apartmentId - Apartment ID
 * @param {Date} checkInDate - New check-in date
 * @param {Date} checkOutDate - New check-out date
 * @param {string} excludeBookingId - Optional booking ID to exclude from check (for updates)
 * @returns {Promise<boolean>} - true if available, false if conflict exists
 */
export const checkAvailability = async (
  apartmentId,
  checkInDate,
  checkOutDate,
  excludeBookingId = null
) => {
  // First, check if the property exists and is available
  const property = await Property.findById(apartmentId);
  if (!property) {
    return false; // Property doesn't exist
  }

  // Check Property's general availability status
  if (property.availabilityStatus !== "available") {
    return false; // Property is rented or archived
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  // Build query to find overlapping bookings
  // Overlap condition: existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
  const query = {
    apartmentId: apartmentId,
    status: { $ne: "cancelled" }, // Exclude cancelled bookings
    $or: [
      // Case 1: New booking starts before existing ends AND ends after existing starts
      {
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn },
      },
    ],
  };

  // Exclude current booking if updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);

  return !conflictingBooking; // Return true if no conflict found
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data object
 * @returns {Promise<Object>} - Created booking document
 */
export const createBooking = async (bookingData) => {
  // Check availability before creating
  const isAvailable = await checkAvailability(
    bookingData.apartmentId,
    bookingData.checkInDate,
    bookingData.checkOutDate
  );

  if (!isAvailable) {
    throw new Error("Apartment is not available for the selected dates");
  }

  const property = await Property.findById(bookingData.apartmentId);
  if (!property) {
    throw new Error("Property not found");
  }

  const monthsArg =
    bookingData.stayType === "long" && bookingData.months != null
      ? Number(bookingData.months)
      : undefined;

  bookingData.totalPrice = calculateTotalPrice(
    bookingData.stayType,
    bookingData.checkInDate,
    bookingData.checkOutDate,
    property,
    { months: monthsArg }
  );

  if (bookingData.stayType === "long" && bookingData.months != null && Number(bookingData.months) > 0) {
    bookingData.months = Number(bookingData.months);
  } else {
    delete bookingData.months;
  }

  const booking = await Booking.create(bookingData);
  return booking;
};

/**
 * Get all bookings with optional filters
 * @param {Object} filters - Optional filters (status, paymentStatus, etc.)
 * @returns {Promise<Array>} - Array of booking documents
 */
export const getAllBookings = async (filters = {}) => {
  return Booking.find(filters)
    .populate("userId", "name email")
    .populate("apartmentId", "title location address")
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 });
};

/**
 * Get all bookings for a specific user
 * Matches both string and ObjectId userId so count is correct for existing data
 * @param {string} userId - User ID (e.g. "renter-001" or ObjectId string)
 * @returns {Promise<Array>} - Array of booking documents for the user
 */
export const getUserBookings = async (userId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(userId) && String(userId).length === 24;
  const query = isObjectId
    ? { $or: [ { userId }, { userId: new mongoose.Types.ObjectId(userId) } ] }
    : { userId };
  return Booking.find(query)
    .populate("apartmentId", "title location address price")
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 });
};

/**
 * Get a single booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object|null>} - Booking document or null if not found
 */
export const getBookingById = async (bookingId) => {
  try {
    return await Booking.findById(bookingId)
      .populate("userId", "name email")
      .populate("apartmentId", "title location address price")
      .populate("approvedBy", "name email");
  } catch (error) {
    // If populate fails (e.g., User model doesn't exist), return booking without populate
    return await Booking.findById(bookingId);
  }
};

/**
 * Update a booking
 * @param {string} bookingId - Booking ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} - Updated booking document or null if not found
 */
export const updateBooking = async (bookingId, updateData) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  const checkInDate = updateData.checkInDate || booking.checkInDate;
  const checkOutDate = updateData.checkOutDate || booking.checkOutDate;

  if (updateData.checkInDate || updateData.checkOutDate) {
    const isAvailable = await checkAvailability(
      updateData.apartmentId || booking.apartmentId,
      checkInDate,
      checkOutDate,
      bookingId
    );

    if (!isAvailable) {
      throw new Error("Apartment is not available for the selected dates");
    }
  }

  const shouldRecalcPrice =
    updateData.checkInDate ||
    updateData.checkOutDate ||
    updateData.stayType ||
    updateData.apartmentId ||
    updateData.months != null;

  if (shouldRecalcPrice) {
    const apartmentId = updateData.apartmentId || booking.apartmentId;
    const stayType = updateData.stayType || booking.stayType;
    const property = await Property.findById(apartmentId);
    if (property) {
      const monthsForCalc =
        stayType === "long"
          ? updateData.months != null
            ? Number(updateData.months)
            : booking.months != null
              ? Number(booking.months)
              : undefined
          : undefined;
      updateData.totalPrice = calculateTotalPrice(
        stayType,
        checkInDate,
        checkOutDate,
        property,
        { months: monthsForCalc }
      );
    }
  }

  Object.assign(booking, updateData);
  await booking.save();

  return booking;
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @param {string} approvedBy - Optional user ID who approved
 * @returns {Promise<Object|null>} - Updated booking document or null if not found
 */
export const updateBookingStatus = async (bookingId, status, approvedBy = null) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  booking.status = status;
  if (approvedBy) {
    booking.approvedBy = approvedBy;
  }

  await booking.save();
  return booking;
};

/**
 * Update payment status
 * @param {string} bookingId - Booking ID
 * @param {string} paymentStatus - New payment status ("unpaid" or "paid")
 * @returns {Promise<Object|null>} - Updated booking document or null if not found
 */
export const updatePaymentStatus = async (bookingId, paymentStatus) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  booking.paymentStatus = paymentStatus;
  if (paymentStatus === "paid" && booking.status !== "completed") {
    booking.status = "confirmed";
  }
  await booking.save();

  return booking;
};

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @param {string} cancellationReason - Optional reason for cancellation
 * @returns {Promise<Object|null>} - Updated booking document or null if not found
 */
export const cancelBooking = async (bookingId, cancellationReason = null) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  booking.status = "cancelled";
  if (cancellationReason) {
    booking.cancellationReason = cancellationReason;
  }

  await booking.save();
  return booking;
};

/**
 * Request a refund for a cancelled paid booking
 * @param {string} bookingId - Booking ID
 * @param {string} refundReason - Optional reason for refund request
 * @returns {Promise<Object|null>} - Updated booking document or null if not found
 */
export const requestRefund = async (bookingId, refundReason = null) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  if (booking.paymentStatus !== "paid") {
    throw new Error("RefundAllowedOnlyForPaidBookings");
  }

  if (booking.status !== "cancelled") {
    throw new Error("RefundRequiresCancelledBooking");
  }

  if (["requested", "approved", "refunded"].includes(booking.refundStatus)) {
    throw new Error("RefundAlreadyRequestedOrProcessed");
  }

  booking.refundStatus = "requested";
  booking.refundRequestedAt = new Date();
  if (refundReason && String(refundReason).trim()) {
    booking.refundReason = String(refundReason).trim();
  }

  await booking.save();
  return booking;
};

/**
 * Delete a booking permanently
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object|null>} - Deleted booking document or null if not found
 */
export const deleteBooking = async (bookingId) => {
  return Booking.findByIdAndDelete(bookingId);
};
