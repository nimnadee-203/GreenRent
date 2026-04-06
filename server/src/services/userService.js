import userModel from "../models/userModel.js";
import Property from "../models/Property.js";

export const getUserData = async (userId) => {
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};

export const getPendingSellerRequests = async () => {
    return userModel
        .find({ sellerRequest: true, role: { $ne: "seller" } })
        .select("name email sellerApplication sellerRequest createdAt updatedAt")
        .sort({ updatedAt: -1 });
};

export const getPublicSellerProfile = async (userId) => {
    const user = await userModel
        .findById(userId)
        .select("name email role sellerApplication");

    if (!user) {
        throw new Error("User not found");
    }

    return {
        id: user._id,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        sellerApplication: user.sellerApplication || {},
    };
};

export const addToWishlist = async (userId, propertyId) => {
    const property = await Property.findById(propertyId).select("_id");
    if (!property) {
        throw new Error("Property not found");
    }

    const user = await userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: propertyId } },
        { returnDocument: "after" }
    ).select("wishlist");

    if (!user) {
        throw new Error("User not found");
    }

    return user.wishlist;
};

export const removeFromWishlist = async (userId, propertyId) => {
    const user = await userModel.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: propertyId } },
        { returnDocument: "after" }
    ).select("wishlist");

    if (!user) {
        throw new Error("User not found");
    }

    return user.wishlist;
};

export const getWishlist = async (userId) => {
    const user = await userModel.findById(userId)
        .select("wishlist")
        .populate("wishlist");

    if (!user) {
        throw new Error("User not found");
    }

    return user.wishlist || [];
};

export const isInWishlist = async (userId, propertyId) => {
    const user = await userModel.findById(userId).select("wishlist");

    if (!user) {
        throw new Error("User not found");
    }

    const inWishlist = (user.wishlist || []).some((id) => String(id) === String(propertyId));
    return inWishlist;
};
