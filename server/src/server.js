import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import ecoRatingRoutes from "./routes/ecoRatingRoutes.js";
import renterReviewRoutes from "./routes/renterReviewRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route middlewares
app.use("/api/eco-ratings", ecoRatingRoutes);
app.use("/api/renter-reviews", renterReviewRoutes);
app.use("/api/properties", propertyRoutes);

app.get("/", (req, res) => {
    res.send("GreenRent API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
