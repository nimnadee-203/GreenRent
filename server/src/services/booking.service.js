import Booking from "../models/booking.model.js";
import Property from "../models/Property.js";

/**
 * Calculate total price based on stay type
 * @param {string} stayType - "short" or "long"
 * @param {Date} checkInDate - Check-in date
 * @param {Date} checkOutDate - Check-out date
 * @param {Object} property - Property object with price information
 * @returns {number} - Calculated total price
 */
export const calculateTotalPrice = (stayType, checkInDate, checkOutDate, property) => {
  if (!property || !property.price) {
    throw new Error("Property price information is required");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (stayType === "short") {
    // Short stay: price per night × number of nights
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const nights = Math.ceil((checkOut - checkIn) / oneDay);
    return property.price * nights;
  } else if (stayType === "long") {
    // Long stay: price per month × number of months
    // Calculate months difference
    const monthsDiff =
      (checkOut.getFullYear() - checkIn.getFullYear()) * 12 +
      (checkOut.getMonth() - checkIn.getMonth());
    const months = Math.ceil(monthsDiff);
    return property.price * Math.max(1, months); // At least 1 month
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

  // Get property to calculate price if not provided
  if (!bookingData.totalPrice) {
    const property = await Property.findById(bookingData.apartmentId);
    if (!property) {
      throw new Error("Property not found");
    }
    bookingData.totalPrice = calculateTotalPrice(
      bookingData.stayType,
      bookingData.checkInDate,
      bookingData.checkOutDate,
      property
    );
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
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of booking documents for the user
 */
export const getUserBookings = async (userId) => {
  return Booking.find({ userId })
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

  // If dates are being updated, check availability
  if (updateData.checkInDate || updateData.checkOutDate) {
    const checkInDate = updateData.checkInDate || booking.checkInDate;
    const checkOutDate = updateData.checkOutDate || booking.checkOutDate;

    const isAvailable = await checkAvailability(
      updateData.apartmentId || booking.apartmentId,
      checkInDate,
      checkOutDate,
      bookingId
    );

    if (!isAvailable) {
      throw new Error("Apartment is not available for the selected dates");
    }

    // Recalculate price if dates or stayType changed
    if (
      updateData.checkInDate ||
      updateData.checkOutDate ||
      updateData.stayType ||
      updateData.apartmentId
    ) {
      const apartmentId = updateData.apartmentId || booking.apartmentId;
      const stayType = updateData.stayType || booking.stayType;
      const property = await Property.findById(apartmentId);
      if (property) {
        updateData.totalPrice = calculateTotalPrice(
          stayType,
          checkInDate,
          checkOutDate,
          property
        );
      }
    }
  }

  // Update booking
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
 * Delete a booking permanently
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object|null>} - Deleted booking document or null if not found
 */
export const deleteBooking = async (bookingId) => {
  return Booking.findByIdAndDelete(bookingId);
};
