import {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../services/propertyService.js";
import {
  validatePropertyCreate,
  validatePropertyUpdate,
} from "../validators/propertyValidators.js";

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
    if (error?.message === "GEOCODING_FAILED") {
      return res.status(400).json({
        message:
          "Unable to locate the address via OpenStreetMap. Please check the address or provide coordinates.",
      });
    }
    console.error("Create property error:", error);
    return res.status(500).json({ message: "Failed to create property" });
  }
};

export const listPropertiesHandler = async (req, res) => {
  try {
    const filter = {};

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
    const property = await getPropertyById(req.params.id);
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
    if (error?.message === "GEOCODING_FAILED") {
      return res.status(400).json({
        message:
          "Unable to locate the address via OpenStreetMap. Please check the address or provide coordinates.",
      });
    }
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