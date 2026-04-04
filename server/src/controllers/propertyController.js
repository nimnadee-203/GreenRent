import {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../services/propertyService.js";
import Property from "../models/Property.js";
import {
  validatePropertyCreate,
  validatePropertyUpdate,
} from "../validators/propertyValidators.js";
import jwt from "jsonwebtoken";

export const createPropertyHandler = async (req, res) => {
  try {
    const errors = validatePropertyCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const propertyData = {
      ...req.body,
      ownerId: req.user.id,
    };

    const property = await createProperty(propertyData);
    return res.status(201).json(property);
  } catch (error) {
    console.error("Create property error:", error);
    return res.status(500).json({ message: "Failed to create property" });
  }
};

export const listPropertiesHandler = async (req, res) => {
  try {
    const filter = {};
    let includeHidden = false;

    if (req.query.includeHidden === "true") {
      let token = req.cookies?.token;
      if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return res.status(401).json({ message: "Authentication required for includeHidden" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.role !== "admin") {
          return res.status(403).json({ message: "Only admin can view hidden listings" });
        }
        includeHidden = true;
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    }

    if (req.query.propertyType) {
      filter.propertyType = req.query.propertyType;
    }
    if (req.query.availabilityStatus) {
      filter.availabilityStatus = req.query.availabilityStatus;
    }
    if (req.query.ownerId) {
      filter.ownerId = req.query.ownerId;
    }
    if (req.query.minPrice != null) {
      filter.price = filter.price || {};
      filter.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice != null) {
      filter.price = filter.price || {};
      filter.price.$lte = Number(req.query.maxPrice);
    }

    const options = {
      filter,
      search: req.query.search,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      skip: req.query.skip ? Number(req.query.skip) : undefined,
      includeHidden,
    };

    const properties = await listProperties(options);
    return res.status(200).json(properties);
  } catch (error) {
    console.error("List properties error:", error);
    return res.status(500).json({ message: "Failed to fetch properties" });
  }
};

export const getPropertyByIdHandler = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate("ecoRatingId");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    return res.status(200).json(property);
  } catch (error) {
    console.error("Get property error:", error);
    return res.status(500).json({ message: "Failed to fetch property" });
  }
};

export const updatePropertyHandler = async (req, res) => {
  try {
    const errors = validatePropertyUpdate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const existing = await getPropertyById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Property not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = existing.ownerId && String(existing.ownerId) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "You can only update your own properties" });
    }

    const property = await updateProperty(req.params.id, req.body);
    return res.status(200).json(property);
  } catch (error) {
    console.error("Update property error:", error);
    return res.status(500).json({ message: "Failed to update property" });
  }
};

export const deletePropertyHandler = async (req, res) => {
  try {
    const existing = await getPropertyById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Property not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = existing.ownerId && String(existing.ownerId) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "You can only delete your own properties" });
    }

    await deleteProperty(req.params.id);
    return res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    console.error("Delete property error:", error);
    return res.status(500).json({ message: "Failed to delete property" });
  }
};
 export const deleteAllPropertiesHandler = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete all properties" });
    }

    const result = await Property.deleteMany({});
    return res.status(200).json({
      message: "All properties deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all properties error:", error);
    return res.status(500).json({ message: "Failed to delete properties" });
  }
};
export const clearEcoRatingHandler = async (req, res) => { 
  try { 
    const { default: Property } = await import('../models/Property.js'); 
    const property = await Property.findById(req.params.id); 
    if (!property) return res.status(404).json({ message: 'Not found' }); 
    const requestUserId = req.user?.id || req.user?._id;
    const isOwner = property.ownerId && requestUserId && String(property.ownerId) === String(requestUserId); 
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' }); 

    if (property.ecoRatingId) { 
      const { default: EcoRating } = await import('../models/EcoRating.js'); 
      const ecoRatingId = property.ecoRatingId?._id || property.ecoRatingId;

      try {
        await EcoRating.findByIdAndDelete(ecoRatingId);
      } catch (deleteError) {
        console.warn('Failed to delete linked EcoRating, continuing to clear property reference:', deleteError?.message || deleteError);
      }
    } 

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ecoRatingId: null,
          ecoRatingClearedAt: new Date(),
        },
      },
      { new: true }
    );

    return res.status(200).json(updatedProperty); 
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ message: e?.message || 'Error clearing eco rating' }); 
  } 
};