import Property from "../models/Property.js";

/**
 * Create a new property listing
 */
export const createProperty = async (data) => {
  const property = await Property.create(data);
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
  const property = await Property.findByIdAndUpdate(
    id,
    { $set: data },
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
