import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
          default: null,
          min: -90,
          max: 90,
        },
        lng: {
          type: Number,
          default: null,
          min: -180,
          max: 180,
        },
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stayType: {
      type: String,
      enum: ["long", "short", "both"],
      default: "long",
    },
    monthlyPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    dailyPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    area: {
      type: Number,
      default: null,
      min: 0,
    },
    bedrooms: {
      type: Number,
      default: null,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: null,
      min: 0,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ["apartment", "house", "studio", "townhouse", "other"],
    },
    ecoFeatures: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "rented", "archived"],
      default: "available",
    },
    // auto: follow eco visibility rules, visible: force-show publicly, hidden: force-hide publicly
    visibilityStatus: {
      type: String,
      enum: ["auto", "visible", "hidden"],
      default: "auto",
    },
    ownerId: {
      type: String,
      required: true,
    },
    ecoRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcoRating",
    },
    ecoRatingClearedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for search functionality
propertySchema.index({ title: "text", description: "text", "location.address": "text" });

const Property = mongoose.model("Property", propertySchema);

export default Property;
