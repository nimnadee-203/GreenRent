import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        budgetMin: {
            type: Number,
            default: 0,
        },
        budgetMax: {
            type: Number,
            default: 500000,
        },
        propertyType: {
            type: String,
            enum: ["House", "Apartment", "Studio", "Shared Room", "Any"],
            default: "Any",
        },
        ecoPriority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        transportPreference: {
            type: String,
            enum: ["Public Transport", "Walking/Cycling", "EV Charging", "Any"],
            default: "Any",
        },
        greenAmenities: {
            type: [String],
            default: [],
        },
        isDefault: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);

export default UserPreference;
