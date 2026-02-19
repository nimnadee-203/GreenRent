import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
    createPropertyHandler,
    listPropertiesHandler,
    getPropertyByIdHandler,
    updatePropertyHandler,
    deletePropertyHandler,
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
 * @access  Protected (Landlord/Admin)
 */
router.post("/", authenticate, authorize("landlord", "admin"), createPropertyHandler);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update a property listing
 * @access  Protected (Owner/Admin)
 */
router.put("/:id", authenticate, updatePropertyHandler);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete or archive a property listing
 * @access  Protected (Owner/Admin)
 */
router.delete("/:id", authenticate, deletePropertyHandler);

export default router;
