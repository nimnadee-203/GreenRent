import dotenv from "dotenv";
dotenv.config();

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
import chatRoutes from "./routes/chat.routes.js";
import paymentRoutes from "./routes/payment.routes.js";


dotenv.config();

// Connect to Database
await connectDB();



const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

const isLocalDevOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
};

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients (Postman)
    if (allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Origin not allowed"));
    }
  }
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
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);

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
