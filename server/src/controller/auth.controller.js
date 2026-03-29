import * as authService from '../services/authService.js';
import * as authValidators from '../validators/authValidators.js';

// Helper for cookie options
// In local dev we set sameSite:'none', secure:false with origin support for different ports.
// In production we set secure:true and sameSite:'none' for cross-site usage from app host.
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

//register
export const register = async (req, res) => {
    const errors = authValidators.validateRegistration(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const { name, email, password } = req.body;

    try {
        const { token } = await authService.registerUser(name, email, password);

        res.cookie('token', token, cookieOptions);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token
        });

    } catch (error) {
        const statusCode = error.message === 'User already exists' ? 409 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

//login
export const login = async (req, res) => {
    const errors = authValidators.validateLogin(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const { email, password } = req.body;
    
    try {
        
        const { token } = await authService.loginUser(email, password);

        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token
        });

    } catch (error) {
        const statusCode = error.message === 'Invalid email or password' ? 401 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

//logout
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            ...cookieOptions,
            maxAge: 0
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//Become a seller
export const requestSeller = async (req, res) => {
    const errors = authValidators.validateSellerRequest(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors[0], errors });
    }

    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await authService.processSellerRequest(user, req.body);

        return res.status(200).json({
            success: true,
            message: "You are now a seller",
        });
    } catch (error) {
        const statusCode = error.message === "You are already a seller" ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};

//Approve seller
export const approveSeller = async (req, res) => {
    try {
        await authService.approveUserAsSeller(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Seller approved successfully",
        });
    } catch (error) {
        const statusCode = error.message === "User not found" ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};

