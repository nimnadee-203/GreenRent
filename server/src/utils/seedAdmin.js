import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import userModel from "../models/userModel.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL || "admin@greenrent.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        const adminName = "System Admin";

        // Check if admin already exists
        const existingAdmin = await userModel.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adminName)}`;

        const adminUser = new userModel({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            avatar: avatar
        });

        await adminUser.save();
        console.log("Admin user created successfully!");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error.message);
        process.exit(1);
    }
};

seedAdmin();
