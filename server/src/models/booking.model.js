import mongoose from "mongoose";

const PAYMENT_TIMEOUT_MS = 15 * 60 * 1000;

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    stayType: {
      type: String,
      enum: ["short", "long"],
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    numberOfGuests: {
      type: Number,
      min: 1,
    },
    months: {
      type: Number,
      min: 1,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    refundReason: {
      type: String,
      trim: true,
    },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "refunded"],
      default: "none",
    },
    refundRequestedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentDueAt: {
      type: Date,
      default: () => new Date(Date.now() + PAYMENT_TIMEOUT_MS),
    },
    expiredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Business rule: once a booking is paid, it must be at least confirmed.
bookingSchema.pre("validate", function () {
  // Keep cancelled/completed bookings as-is. Auto-promote only active unpaid-like states.
  if (this.paymentStatus === "paid" && ["pending", "expired"].includes(this.status)) {
    this.status = "confirmed";
    this.expiredAt = undefined;
  }
});

// Indexes for efficient queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ apartmentId: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
