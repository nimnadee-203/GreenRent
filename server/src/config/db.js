import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not defined in .env file");
            return;
        }

        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/green-rent`);

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1); // Exit if connection fails
    }
};
