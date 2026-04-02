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

const reviewReplySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      default: "Anonymous",
    },
    userRole: {
      type: String,
      enum: ["user", "seller", "admin", "renter"],
      default: "user",
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
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
    verification: {
      solarPanels: {
        type: Boolean,
        default: null,
      },
      ledLighting: {
        type: Boolean,
        default: null,
      },
      efficientAc: {
        type: Boolean,
        default: null,
      },
      waterSavingTaps: {
        type: Boolean,
        default: null,
      },
      rainwaterHarvesting: {
        type: Boolean,
        default: null,
      },
      waterMeter: {
        type: Boolean,
        default: null,
      },
      recyclingAvailable: {
        type: Boolean,
        default: null,
      },
      compostAvailable: {
        type: Boolean,
        default: null,
      },
      evCharging: {
        type: Boolean,
        default: null,
      },
      goodVentilationSunlight: {
        type: Boolean,
        default: null,
      },
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
      default: "approved",
    },
    replies: {
      type: [reviewReplySchema],
      default: [],
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
