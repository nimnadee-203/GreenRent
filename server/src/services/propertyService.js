import Property from "../models/Property.js";
import { geocodeAddress } from "./openStreetMapService.js";

const buildGeocodeQuery = (location = {}) => {
  if (!location || typeof location !== "object") {
    return "";
  }

  const parts = [
    location.displayAddress,
    location.address,
    location.city,
    location.state,
    location.country,
  ]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim());

  return parts.join(", ");
};

const buildGeocodeCandidates = (location = {}) => {
  const unique = new Set();

  const push = (parts = []) => {
    const query = parts
      .filter((part) => typeof part === "string" && part.trim())
      .map((part) => part.trim())
      .join(", ");

    if (query) {
      unique.add(query);
    }
  };

  push([
    location.displayAddress,
    location.address,
    location.city,
    location.state,
    location.country,
  ]);
  push([location.address, location.city, location.state, location.country]);
  push([location.address, location.city, location.country]);
  push([location.address, location.country]);
  push([location.address]);

  return Array.from(unique);
};

/**
 * Helper to geocode an address only when coordinates are missing.
 * Returns the updated location object. Geocoding failures are non-blocking (coordinates remain null).
 */
const geocodeIfNeeded = async (data, existingLocation = null) => {
  const location = data?.location;
  const geocodeQuery = buildGeocodeQuery(location);
  if (!location || !geocodeQuery) {
    return data;
  }

  const coordinatesMissing = !location.coordinates || (location.coordinates.lat === null && location.coordinates.lng === null);

  if (coordinatesMissing) {
    try {
      const candidates = buildGeocodeCandidates(location);
      let geo = null;

      for (const candidate of candidates) {
        geo = await geocodeAddress(candidate);
        if (geo) break;
      }

      if (geo) {
        // Geocoding succeeded, update coordinates
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
    } catch (error) {
      // Geocoding failed, log but don't throw - allow property creation with null coordinates
      console.warn(`Geocoding failed for location: ${geocodeQuery}`, error.message);
    }
    
    // Return data as-is with null coordinates (or existing coordinates if they were provided)
    // Client-side map will attempt to geocode when displaying
    return data;
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
 * @param {Object} options - { filter, search, sortBy, sortOrder, limit, skip, includeHidden }
 */
export const listProperties = async (options = {}) => {
  const {
    filter = {},
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    limit,
    skip = 0,
    includeHidden = false,
  } = options;

  const query = { ...filter };

  // Filter hidden listings for public (where ownerId is missing)
  if (!includeHidden && !filter.ownerId && !filter._id) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const validityOr = [
      { ecoRatingId: { $ne: null } },
      { ecoRatingId: null, ecoRatingClearedAt: null, createdAt: { $gte: fortyEightHoursAgo } },
      { ecoRatingId: null, ecoRatingClearedAt: { $ne: null }, ecoRatingClearedAt: { $gte: oneHourAgo } }
    ];
    query.$and = query.$and || [];

    // Manual visibility overrides by admin:
    // hidden  -> always hidden
    // visible -> always shown
    // auto    -> follow eco visibility rules
    query.$and.push({ visibilityStatus: { $ne: "hidden" } });
    query.$and.push({
      $or: [
        { visibilityStatus: "visible" },
        {
          $and: [
            {
              $or: [
                { visibilityStatus: "auto" },
                { visibilityStatus: { $exists: false } },
              ],
            },
            { $or: validityOr },
          ],
        },
      ],
    });
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
    { returnDocument: "after", runValidators: true }
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
