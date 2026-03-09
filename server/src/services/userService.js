import userModel from "../models/userModel.js";

export const getUserData = async (userId) => {
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
