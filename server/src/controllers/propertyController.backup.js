import {
    createProperty,
    listProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} from "../services/propertyService.js";
import {
    validatePropertyCreate,
    validatePropertyUpdate
} from "../validators/propertyValidators.js";

export const createPropertyHandler = async (req, res) => {
    try {
        const errors = validatePropertyCreate(req.body);
        if (errors.length) {
            return res.status(400).json({ success: false, errors });
        }

        const property = await createProperty(req.body, req.user.id);
        return res.status(201).json({ success: true, property });
    } catch (error) {
        console.error("Create property error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const listPropertiesHandler = async (req, res) => {
    try {
        const filter = { availabilityStatus: "available" };
        if (req.query.propertyType) filter.propertyType = req.query.propertyType;

        const properties = await listProperties(filter);
        return res.status(200).json({ success: true, properties });
    } catch (error) {
        console.error("List properties error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPropertyByIdHandler = async (req, res) => {
    try {
        const property = await getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }
        return res.status(200).json({ success: true, property });
    } catch (error) {
        console.error("Get property error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePropertyHandler = async (req, res) => {
    try {
        const errors = validatePropertyUpdate(req.body);
        if (errors.length) {
            return res.status(400).json({ success: false, errors });
        }

        const property = await updateProperty(
            req.params.id,
            req.body,
            req.user.id,
            req.user.role
        );

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        return res.status(200).json({ success: true, property });
    } catch (error) {
        if (error.message === "Unauthorized to update this property") {
            return res.status(403).json({ success: false, message: error.message });
        }
        console.error("Update property error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePropertyHandler = async (req, res) => {
    try {
        const permanent = req.query.permanent === "true";
        const property = await deleteProperty(
            req.params.id,
            req.user.id,
            req.user.role,
            permanent
        );

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        return res.status(200).json({
            success: true,
            message: permanent ? "Property deleted permanently" : "Property archived"
        });
    } catch (error) {
        if (error.message === "Unauthorized to delete this property") {
            return res.status(403).json({ success: false, message: error.message });
        }
        console.error("Delete property error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
