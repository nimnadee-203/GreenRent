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
          required: true,
          min: -90,
          max: 90,
        },
        lng: {
          type: Number,
          required: true,
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
    ownerId: {
      type: String,
      required: true,
    },
    ecoRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcoRating",
    },
  },
  { timestamps: true }
);

// Index for search functionality
propertySchema.index({ title: "text", description: "text", "location.address": "text" });

const Property = mongoose.model("Property", propertySchema);

export default Property;
