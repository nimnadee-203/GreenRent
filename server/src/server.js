import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

import ecoRatingRoutes from "./routes/ecoRatingRoutes.js";
import renterReviewRoutes from "./routes/renterReviewRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.backup.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import bookingRoutes from "./routes/booking.routes.js";


dotenv.config();

// Connect to Database
await connectDB();



const app = express();

// Middlewares
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173"
}));

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/eco-ratings", ecoRatingRoutes);
app.use("/api/renter-reviews", renterReviewRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("GreenRent API is running...");
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
