import {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../services/propertyService.js";
import { geocodeAddress } from "../services/openStreetMapService.js";
import Property from "../models/Property.js";
import {
  validatePropertyCreate,
  validatePropertyUpdate,
} from "../validators/propertyValidators.js";
import jwt from "jsonwebtoken";

const buildNearbyLocationQuery = (location) => {
  if (!location) return "";
  if (typeof location === "string") return location.trim();

  return [
    location.displayAddress,
    location.address,
    location.city,
    location.state,
    location.country,
  ]
    .filter((value, index, array) => value && array.indexOf(value) === index)
    .join(", ")
    .trim();
};

const distanceInKm = (lat1, lon1, lat2, lon2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const createPropertyHandler = async (req, res) => {
  try {
    const errors = validatePropertyCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const ownerId = req.user?.id || req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ message: "Authenticated user id not found" });
    }

    const propertyData = {
      ...req.body,
      ownerId: String(ownerId),
    };

    const property = await createProperty(propertyData);
    return res.status(201).json(property);
  } catch (error) {
    console.error("Create property error:", error);
    const message =
      error?.name === "ValidationError"
        ? Object.values(error.errors || {})
            .map((item) => item.message)
            .filter(Boolean)
            .join(" | ")
        : error?.message || "Failed to create property";

    return res.status(500).json({ message });
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
      { returnDocument: "after" }
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

export const getPropertyNearbyPlacesHandler = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).lean();
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    let lat = property.location?.coordinates?.lat;
    let lng = property.location?.coordinates?.lng;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const geocoded = await geocodeAddress(buildNearbyLocationQuery(property.location));
      lat = geocoded?.lat;
      lng = geocoded?.lng;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(200).json({
        source: "unavailable",
        places: { busStops: [], groceries: [], hospitals: [], schools: [] },
      });
    }

    const query = `
      [out:json][timeout:20];
      (
        node["highway"="bus_stop"](around:2500,${lat},${lng});
        node["shop"~"supermarket|convenience|grocery"](around:2500,${lat},${lng});
        node["amenity"="hospital"](around:4000,${lat},${lng});
        node["amenity"="school"](around:3500,${lat},${lng});
        way["shop"~"supermarket|convenience|grocery"](around:2500,${lat},${lng});
        way["amenity"="hospital"](around:4000,${lat},${lng});
        way["amenity"="school"](around:3500,${lat},${lng});
      );
      out center tags;
    `;

    const { default: axios } = await import("axios");
    const response = await axios.post("https://overpass-api.de/api/interpreter", query, {
      headers: { "Content-Type": "text/plain" },
      timeout: 12000,
    });

    const mapped = {
      busStops: [],
      groceries: [],
      hospitals: [],
      schools: [],
    };

    const elements = Array.isArray(response.data?.elements) ? response.data.elements : [];

    elements.forEach((element) => {
      const tags = element.tags || {};
      const itemLat = element.lat ?? element.center?.lat;
      const itemLng = element.lon ?? element.center?.lon;
      if (!Number.isFinite(itemLat) || !Number.isFinite(itemLng)) return;

      const place = {
        name: tags.name || tags.brand || "Unnamed place",
        distanceKm: distanceInKm(lat, lng, itemLat, itemLng),
        note: tags.operator || tags.amenity || tags.shop || "Nearby",
      };

      if (tags.highway === "bus_stop") mapped.busStops.push(place);
      else if (tags.shop === "supermarket" || tags.shop === "convenience" || tags.shop === "grocery") mapped.groceries.push(place);
      else if (tags.amenity === "hospital") mapped.hospitals.push(place);
      else if (tags.amenity === "school") mapped.schools.push(place);
    });

    const normalize = (items) => {
      const uniqueByName = new Map();
      items.forEach((item) => {
        const key = item.name.toLowerCase();
        if (!uniqueByName.has(key) || item.distanceKm < uniqueByName.get(key).distanceKm) {
          uniqueByName.set(key, item);
        }
      });

      return Array.from(uniqueByName.values())
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 4);
    };

    const places = {
      busStops: normalize(mapped.busStops),
      groceries: normalize(mapped.groceries),
      hospitals: normalize(mapped.hospitals),
      schools: normalize(mapped.schools),
    };

    const hasLiveData = Object.values(places).some((items) => items.length > 0);

    return res.status(200).json({
      source: hasLiveData ? "live" : "unavailable",
      places: hasLiveData ? places : { busStops: [], groceries: [], hospitals: [], schools: [] },
    });
  } catch (error) {
    console.error("Get nearby places error:", error);
    return res.status(200).json({
      source: "unavailable",
      places: { busStops: [], groceries: [], hospitals: [], schools: [] },
    });
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
      { returnDocument: "after" }
    );

    return res.status(200).json(updatedProperty); 
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ message: e?.message || 'Error clearing eco rating' }); 
  } 
};
