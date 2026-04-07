import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    sellerRequest: {
      type: Boolean,
      default: false,
    },

    sellerApplication: {
      sellerName: String,
      businessName: String,
      contactNumber: String,
      sellingPlan: {
        type: String,
        enum: ["personal_property", "business_property"],
      },
    },
    avatar: {
      type: String,
      default: "",
    },
    isPreferenceSet: {
      type: Boolean,
      default: false,
    },
    preferences: {
      location: {
        type: String,
        default: ""
      },
      budgetMin: {
        type: Number,
        default: 0
      },
      budgetMax: {
        type: Number,
        default: 1000000
      },
      ecoPriority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
      },
      propertyType: {
        type: String,
        enum: ["apartment", "house", "studio", "townhouse", "any"],
        default: "any"
      },
      transportPreference: {
        type: String,
        default: "Any"
      },
      greenAmenities: {
        type: [String],
        default: []
      }
    },
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
      default: [],
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model('User', userSchema);


export default userModel;
