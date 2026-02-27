import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                role: user.role

            }
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}