import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import UserPreference from '../models/UserPreference.js';
import transporter from '../config/nodemailer.js';

export const registerUser = async (name, email, password) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const existingUser = await userModel.findOne({ email: normalizedEmail });

    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = await userModel.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        avatar
    });

    // Initialize default eco-preferences in dedicated collection
    await UserPreference.create({ 
        userId: user._id,
        budgetMax: 500000,
        propertyType: "Any",
        ecoPriority: "Medium",
        transportPreference: "Any"
    });

    const token = generateToken(user._id, user.role, user.email, user.name);

    // Sending welcome email asynchronously
    sendWelcomeEmail(normalizedEmail).catch(err => console.error('Error sending welcome email:', err));

    return { user, token };
};

export const loginUser = async (email, password) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    // Try exact lowercase match first (for new users), then case-insensitive match
    let user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
        user = await userModel.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
    }

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken(user._id,user.role,user.email,user.name);

    return { user, token };
};

export const socialLogin = async (name, email, avatar) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    
    let user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
        // Create new user if they don't exist
        user = await userModel.create({
            name,
            email: normalizedEmail,
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            // password omitted for social users
        });

        // Initialize default eco-preferences in dedicated collection
        await UserPreference.create({ 
            userId: user._id,
            budgetMax: 500000,
            propertyType: "Any",
            ecoPriority: "Medium",
            transportPreference: "Any"
        });

        // Sending welcome email asynchronously
        sendWelcomeEmail(normalizedEmail).catch(err => console.error('Error sending welcome email:', err));
    }

    const token = generateToken(user._id, user.role, user.email, user.name);

    return { user, token };
};

export const processSellerRequest = async (user, businessData) => {
    if (user.role === "seller") {
        throw new Error("You are already a seller");
    }

    user.sellerRequest = true;
    user.sellerApplication = {
        sellerName: String(businessData.sellerName || "").trim(),
        businessName: String(businessData.businessName || "").trim(),
        contactNumber: String(businessData.contactNumber || "").trim(),
        sellingPlan: String(businessData.sellingPlan || "").trim(),
    };

    await user.save();
    return user;
};

export const approveUserAsSeller = async (userId) => {
    const user = await userModel.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.role = "seller";
    user.sellerRequest = false;

    await user.save();
    return user;
};

// Helper functions
export const generateToken = (userId,role,email,name) => {
    return jwt.sign(
        { id: userId ,role:role,email:email,name:name},
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const sendWelcomeEmail = async (email) => {
    const mailOption = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to the Green Rent',
        text: `Welcome to the Green Rent. Your account has been created with email id: ${email}`
    };

    console.log(`Attempting to send welcome email to: ${email}`);
    const info = await transporter.sendMail(mailOption);
    console.log('Email sent successfully:', info.messageId);
    return info;
};
