import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const registerUser = async (name, email, password) => {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        avatar
    });

    const token = generateToken(user._id);

    // Sending welcome email asynchronously
    sendWelcomeEmail(email).catch(err => console.error('Error sending welcome email:', err));

    return { user, token };
};

export const loginUser = async (email, password) => {
    const user = await userModel.findOne({ email });

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

export const processSellerRequest = async (user, businessData) => {
    if (user.role === "seller") {
        throw new Error("You are already a seller");
    }

    user.sellerRequest = true;
    user.sellerApplication = {
        businessName: businessData.businessName,
        contactNumber: businessData.contactNumber,
        reason: businessData.reason,
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
