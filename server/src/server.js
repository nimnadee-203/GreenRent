import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import ecoRatingRoutes from "./routes/ecoRatingRoutes.js";
import renterReviewRoutes from "./routes/renterReviewRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();

// Connect to Database
await connectDB();

const app = express();

// Middlewares
app.use(cors({ credentials: true, origin: 'http://localhost:5173' })); // Adjusted origin to common Vite port, ideally should be env var
app.use(express.json());
app.use(cookieParser());

// Route middlewares
app.use("/api/eco-ratings", ecoRatingRoutes);
app.use("/api/renter-reviews", renterReviewRoutes);
app.use("/api/properties", propertyRoutes);

app.get("/", (req, res) => {
    res.send("GreenRent API is running...");
});
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
