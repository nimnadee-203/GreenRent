import mongoose from "mongoose";

const criteriaSchema = new mongoose.Schema(
  {
    energyRating: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      required: true,
    },
    solarPanels: {
      type: Boolean,
      required: true,
    },
    ledLighting: {
      type: Boolean,
      required: true,
    },
    efficientAc: {
      type: Boolean,
      required: true,
    },
    waterSavingTaps: {
      type: Boolean,
      required: true,
    },
    rainwaterHarvesting: {
      type: Boolean,
      required: true,
    },
    waterMeter: {
      type: Boolean,
      required: true,
    },
    recyclingAvailable: {
      type: Boolean,
      required: true,
    },
    compostAvailable: {
      type: Boolean,
      required: true,
    },
    transportDistance: {
      type: String,
      enum: ["< 1 km", "1-3 km", "> 3 km"],
      required: true,
    },
    evCharging: {
      type: Boolean,
      required: true,
    },
    goodVentilationSunlight: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const ecoRatingSchema = new mongoose.Schema(
  {
    listingId: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        trim: true,
        default: "",
      },
    },
    criteria: {
      type: criteriaSchema,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    airQualityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    evidenceLinks: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    externalSignals: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: String,
      trim: true,
      default: "",
    },
    renterReviewStats: {
      reviewCount: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: null,
      },
      recommendationRate: {
        type: Number,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const EcoRating = mongoose.model("EcoRating", ecoRatingSchema);

export default EcoRating;
