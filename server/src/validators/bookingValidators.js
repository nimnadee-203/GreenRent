import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

// Helper function to check if a date is today or in the future
const isNotPastDate = (date) => {
  if (!date) return false;
  
  const inputDate = new Date(date);
  const today = new Date();

  // Set both dates to start of the day (00:00:00) to ignore time
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return inputDate >= today;
};

// Helper function to check if checkout is after checkin
const isCheckoutAfterCheckin = (checkOutDate, { req }) => {
  if (!checkOutDate || !req.body.checkInDate) return false;
  const checkIn = new Date(req.body.checkInDate);
  const checkOut = new Date(checkOutDate);
  return checkOut > checkIn;
};

// Validation rules for creating a booking
export const validateCreateBooking = [
  // userId optional (set from auth token for renter); if provided must be non-empty string
  body("userId")
    .optional()
    .isString()
    .withMessage("userId must be a string")
    .custom((value) => {
      if (value !== undefined && value !== null && String(value).trim().length === 0) {
        throw new Error("userId cannot be empty");
      }
      return true;
    }),

  // apartmentId validation
  body("apartmentId")
    .notEmpty()
    .withMessage("apartmentId is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("apartmentId must be a valid MongoDB ObjectId");
      }
      return true;
    }),

  // stayType validation
  body("stayType")
    .notEmpty()
    .withMessage("stayType is required")
    .isIn(["short", "long"])
    .withMessage('stayType must be either "short" or "long"'),

  // checkInDate validation
  body("checkInDate")
    .notEmpty()
    .withMessage("checkInDate is required")
    .isISO8601()
    .withMessage("checkInDate must be a valid ISO 8601 date")
    .custom((value) => {
      if (!isNotPastDate(value)) {
        throw new Error("checkInDate cannot be in the past");
      }
      return true;
    }),

  // checkOutDate validation
  body("checkOutDate")
    .notEmpty()
    .withMessage("checkOutDate is required")
    .isISO8601()
    .withMessage("checkOutDate must be a valid ISO 8601 date")
    .custom((value) => {
      if (!isNotPastDate(value)) {
        throw new Error("checkOutDate cannot be in the past");
      }
      return true;
    })
    .custom(isCheckoutAfterCheckin)
    .withMessage("checkOutDate must be after checkInDate"),

  // totalPrice validation (optional)
  body("totalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("totalPrice must be a positive number"),

  // numberOfGuests validation
  body("numberOfGuests")
    .notEmpty()
    .withMessage("numberOfGuests is required")
    .isInt({ min: 1 })
    .withMessage("numberOfGuests must be a positive integer"),

  // paymentStatus validation (optional, defaults to "unpaid")
  body("paymentStatus")
    .optional()
    .isIn(["unpaid", "paid"])
    .withMessage('paymentStatus must be either "unpaid" or "paid"'),

  // status validation (optional, defaults to "pending")
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage('status must be one of: "pending", "confirmed", "cancelled", "completed"'),

  // cancellationReason validation (optional)
  body("cancellationReason")
    .optional()
    .isString()
    .withMessage("cancellationReason must be a string")
    .trim(),

  // approvedBy validation (optional)
  body("approvedBy")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("approvedBy must be a valid MongoDB ObjectId");
      }
      return true;
    }),
];

// Validation rules for updating a booking
export const validateUpdateBooking = [
  // apartmentId validation (optional)
  body("apartmentId")
    .optional()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("apartmentId must be a valid MongoDB ObjectId");
      }
      return true;
    }),

  // stayType validation (optional)
  body("stayType")
    .optional()
    .isIn(["short", "long"])
    .withMessage('stayType must be either "short" or "long"'),

  // checkInDate validation (optional)
  body("checkInDate")
    .optional()
    .isISO8601()
    .withMessage("checkInDate must be a valid ISO 8601 date")
    .custom((value) => {
      if (!isNotPastDate(value)) {
        throw new Error("checkInDate cannot be in the past");
      }
      return true;
    }),

  // checkOutDate validation (optional)
  body("checkOutDate")
    .optional()
    .isISO8601()
    .withMessage("checkOutDate must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (!isNotPastDate(value)) {
        throw new Error("checkOutDate cannot be in the past");
      }
      // If checkInDate is also being updated, validate against it
      const checkInDate = req.body.checkInDate || req.booking?.checkInDate;
      if (checkInDate && value) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(value);
        if (checkOut <= checkIn) {
          throw new Error("checkOutDate must be after checkInDate");
        }
      }
      return true;
    }),

  // totalPrice validation (optional)
  body("totalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("totalPrice must be a positive number"),

  // numberOfGuests validation (optional)
  body("numberOfGuests")
    .optional()
    .isInt({ min: 1 })
    .withMessage("numberOfGuests must be a positive integer"),

  // status validation (optional)
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage('status must be one of: "pending", "confirmed", "cancelled", "completed"'),

  // paymentStatus validation (optional)
  body("paymentStatus")
    .optional()
    .isIn(["unpaid", "paid"])
    .withMessage('paymentStatus must be either "unpaid" or "paid"'),

  // cancellationReason validation (optional)
  body("cancellationReason")
    .optional()
    .isString()
    .withMessage("cancellationReason must be a string")
    .trim(),

  // approvedBy validation (optional)
  body("approvedBy")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("approvedBy must be a valid MongoDB ObjectId");
      }
      return true;
    }),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((error) => error.msg),
    });
  }
  next();
};
