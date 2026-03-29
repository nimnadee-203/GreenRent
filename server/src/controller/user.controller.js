import * as userService from "../services/userService.js";
import * as recommendationService from "../services/recommendationService.js";
import * as recommendationValidators from "../validators/recommendationValidators.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserData(userId);

    return res.status(200).json({
      success: true,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerRequest: user.sellerRequest,
      }
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  const errors = recommendationValidators.validatePreferences(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  try {
    const userId = req.user.id;
    const user = await recommendationService.updatePreferences(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Preferences updated",
      user,
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const wishlist = await userService.addToWishlist(userId, propertyId);

    return res.status(200).json({
      success: true,
      message: "Property added to wishlist",
      wishlist,
    });
  } catch (error) {
    const statusCode = error.message === "Property not found" ? 404 : error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const wishlist = await userService.removeFromWishlist(userId, propertyId);

    return res.status(200).json({
      success: true,
      message: "Property removed from wishlist",
      wishlist,
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await userService.getWishlist(userId);

    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const isWishlisted = await userService.isInWishlist(userId, propertyId);

    return res.status(200).json({
      success: true,
      isWishlisted,
    });
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};