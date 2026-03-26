import { Router } from "express";
import userAuth from "../middleware/user.auth.js";
import { isSeller } from "../middleware/role.middleware.js";
import {
    createPropertyHandler,
    listPropertiesHandler,
    getPropertyByIdHandler,
    updatePropertyHandler,
    deletePropertyHandler,
    deleteAllPropertiesHandler,
    clearEcoRatingHandler,
} from "../controllers/propertyController.js";

const router = Router();

/**
 * @route   GET /api/properties
 * @desc    Get all properties with filtering, search, and sorting
 * @access  Public
 */
router.get("/", listPropertiesHandler);

/**
 * @route   GET /api/properties/:id
 * @desc    Get detailed property information
 * @access  Public
 */
router.get("/:id", getPropertyByIdHandler);

/**
 * @route   POST /api/properties
 * @desc    Create a new property listing
 * @access  Protected (Seller/Admin)
 */
router.post("/", userAuth, isSeller, createPropertyHandler);

/**
 * @route   DELETE /api/properties/delete-all
 * @desc    Delete all properties
 * @access  Protected (Admin)
 */
router.delete("/delete-all", userAuth, deleteAllPropertiesHandler);

/**
 * @route   PUT /api/properties/:id/clear-eco-rating
 * @desc    Clear a property's eco rating
 * @access  Protected (Owner/Admin)
 */
router.put("/:id/clear-eco-rating", userAuth, clearEcoRatingHandler);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update a property listing
 * @access  Protected (Owner/Admin)
 */
router.put("/:id", userAuth, updatePropertyHandler);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete or archive a property listing
 * @access  Protected (Owner/Admin)
 */
router.delete("/:id", userAuth, deletePropertyHandler);

export default router;
