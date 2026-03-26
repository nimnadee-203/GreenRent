import Property from "../models/Property.js";
import { geocodeAddress } from "./openStreetMapService.js";

/**
 * Helper to geocode an address if coordinates are missing or if the address changed.
 * Returns the updated location object or throws if geocoding fails.
 */
const geocodeIfNeeded = async (data, existingLocation = null) => {
  const location = data?.location;
  if (!location || !location.address) {
    return data;
  }

  const addressChanged = existingLocation && existingLocation.address !== location.address;
  const coordinatesMissing = !location.coordinates || (location.coordinates.lat === null && location.coordinates.lng === null);

  if (addressChanged || coordinatesMissing) {
    const geo = await geocodeAddress(location.address);
    if (!geo) {
      throw new Error("GEOCODING_FAILED");
    }
    return {
      ...data,
      location: {
        ...location,
        coordinates: {
          lat: geo.lat,
          lng: geo.lng,
        },
      },
    };
  }

  return data;
};

/**
 * Ensure latitude and longitude are always present as nullable fields.
 * If coordinates are missing, they are initialized as { lat: null, lng: null }.
 */
const withNullableCoordinates = (data) => {
  const location = data?.location;
  if (!location) {
    return data;
  }

  if (!location.coordinates) {
    return {
      ...data,
      location: {
        ...location,
        coordinates: {
          lat: null,
          lng: null,
        },
      },
    };
  }

  return data;
};

/**
 * Create a new property listing
 */
export const createProperty = async (data) => {
  // First ensure structure is correct
  let payload = withNullableCoordinates(data);
  // Then attempt geocoding
  payload = await geocodeIfNeeded(payload);
  
  const property = await Property.create(payload);
  return property;
};

/**
 * List properties with optional filtering, text search, and sorting
 * @param {Object} options - { filter, search, sortBy, sortOrder, limit, skip }
 */
export const listProperties = async (options = {}) => {
  const {
    filter = {},
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    limit,
    skip = 0,
  } = options;

  const query = { ...filter };

  // Filter hidden listings for public (where ownerId is missing)
  if (!filter.ownerId && !filter._id) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const validityOr = [
      { ecoRatingId: { $ne: null } },
      { ecoRatingId: null, ecoRatingClearedAt: null, createdAt: { $gte: fortyEightHoursAgo } },
      { ecoRatingId: null, ecoRatingClearedAt: { $ne: null }, ecoRatingClearedAt: { $gte: oneHourAgo } }
    ];
    query.$and = query.$and || [];
    query.$and.push({ $or: validityOr });
  }

  if (search && search.trim()) {
    const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: new RegExp(term, "i") },
      { description: new RegExp(term, "i") },
      { "location.address": new RegExp(term, "i") },
    ];
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const queryBuilder = Property.find(query).sort(sort).skip(skip);

  if (limit != null && limit > 0) {
    queryBuilder.limit(limit);
  }

  const properties = await queryBuilder.populate("ecoRatingId").lean();
  return properties;
};

/**
 * Get a single property by ID
 */
export const getPropertyById = async (id) => {
  const property = await Property.findById(id).populate("ecoRatingId");
  return property;
};

/**
 * Update a property by ID
 */
export const updateProperty = async (id, data) => {
  const existing = await Property.findById(id);
  if (!existing) return null;

  let payload = withNullableCoordinates(data);
  payload = await geocodeIfNeeded(payload, existing.location);

  const property = await Property.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return property;
};

/**
 * Delete a property by ID
 */
export const deleteProperty = async (id) => {
  const property = await Property.findByIdAndDelete(id);
  return property;
};
