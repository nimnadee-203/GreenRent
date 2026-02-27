import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
        const databaseName = process.env.DB_NAME || "green-rent";

        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        await mongoose.connect(mongoUri, {
            dbName: databaseName,
        });

    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
};
