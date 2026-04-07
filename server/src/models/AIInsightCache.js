import mongoose from "mongoose";

const aiInsightCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    preferencesHash: {
      type: String,
      required: true,
    },
    insight: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Cache for 7 days
      index: { expires: 0 } // Auto-delete after expiry
    }
  },
  { timestamps: true }
);

// Compound index to quickly find cache for specific user, property and preference state
aiInsightCacheSchema.index({ userId: 1, propertyId: 1, preferencesHash: 1 }, { unique: true });

const AIInsightCache = mongoose.model("AIInsightCache", aiInsightCacheSchema);

export default AIInsightCache;
