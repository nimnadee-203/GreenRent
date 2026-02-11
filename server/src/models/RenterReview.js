import mongoose from "mongoose";

const renterCriteriaSchema = new mongoose.Schema(
  {
    energyEfficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    waterEfficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    wasteManagement: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    transitAccess: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    greenAmenities: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
  },
  { _id: false }
);

const renterReviewSchema = new mongoose.Schema(
  {
    ecoRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcoRating",
      required: true,
    },
    listingId: {
      type: String,
      required: true,
      trim: true,
    },
    renterId: {
      type: String,
      required: true,
      trim: true,
    },
    renterName: {
      type: String,
      trim: true,
      default: "Anonymous",
    },
    criteria: {
      type: renterCriteriaSchema,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    livingDuration: {
      type: String,
      enum: ["< 3 months", "3-6 months", "6-12 months", "1-2 years", "> 2 years"],
      default: "< 3 months",
    },
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: String,
      trim: true,
      default: "",
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
renterReviewSchema.index({ ecoRatingId: 1, createdAt: -1 });
renterReviewSchema.index({ listingId: 1, createdAt: -1 });
renterReviewSchema.index({ renterId: 1 });
renterReviewSchema.index({ status: 1 });

// Prevent duplicate reviews from same renter for same listing
renterReviewSchema.index({ listingId: 1, renterId: 1 }, { unique: true });

const RenterReview = mongoose.model("RenterReview", renterReviewSchema);

export default RenterReview;
