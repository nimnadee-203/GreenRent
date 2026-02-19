import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "../src/routes/auth.routes.js"
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';

// Connect to Database
await connectDB();

const app = express();

// Middlewares
app.use(cors({ credentials: true, origin: 'http://localhost:5173' })); // Adjusted origin to common Vite port, ideally should be env var
app.use(express.json());
app.use(cookieParser());

//API endpoints
app.get("/", (req, res) => {
    res.send("GreenRent API is running...");
});
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
