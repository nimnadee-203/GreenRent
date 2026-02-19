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

    preferences: {
      location: String,
      budgetMin: Number,
      budgetMax: Number,
      ecoPriority: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);
