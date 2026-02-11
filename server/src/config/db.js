import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => 
            console.log("Connected to MongoDB")
        );

        // Use environment variable or fallback to localhost
        const baseUri = (process.env.MONGODB_URI || "mongodb://localhost:27017")
            .replace(/\/+$/, "");
        const mongoUri = `${baseUri}/green-rent`;

        await mongoose.connect(mongoUri);

    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
};
