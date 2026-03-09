import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            console.error("MONGODB_URI is not defined in .env file");
            return;
        }

        const mongoUri = process.env.MONGODB_URI;
        const databaseName = process.env.DB_NAME || "green-rent";

        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

<<<<<<< Updated upstream
        await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connect(mongoUri, {
        dbName: databaseName,
    });
=======
        await mongoose.connect(mongoUri);
>>>>>>> Stashed changes

    } catch (error) {
        const message = error?.message || "Unknown MongoDB error";
        console.error("Failed to connect to MongoDB:", message);

        if (message.includes("querySrv ENOTFOUND")) {
            console.error("DNS lookup failed for the Atlas SRV host in MONGODB_URI.");
            console.error("Verify the cluster hostname in Atlas and your local DNS/network access.");
        }

        if (message.toLowerCase().includes("bad auth") || message.toLowerCase().includes("authentication failed")) {
            console.error("MongoDB credentials are invalid or expired.");
            console.error("Update username/password in MONGODB_URI from Atlas -> Database Access.");
        }

        process.exit(1); // Exit if connection fails
    }
};
