import Property from "../models/Property.js";
import { createEcoRating } from "./ecoRatingService.js";

export const createProperty = async (propertyData, userId) => {
    // 1. Create the associated EcoRating first
    const ecoRating = await createEcoRating({
        listingId: "pending", // Will update after property is created
        location: {
            latitude: propertyData.location.coordinates.lat,
            longitude: propertyData.location.coordinates.lng,
            address: propertyData.location.address
        },
        criteria: propertyData.ecoFeatures, // Initial criteria from landlord
        createdBy: userId
    });

    // 2. Create the property
    const property = await Property.create({
        ...propertyData,
        ownerId: userId,
        ecoRatingId: ecoRating._id
    });

    // 3. Update EcoRating with the actual listingId (property._id)
    ecoRating.listingId = property._id.toString();
    await ecoRating.save();

    return property;
};

export const listProperties = async (filter = {}) => {
    return Property.find(filter).populate("ecoRatingId").sort({ createdAt: -1 });
};

export const getPropertyById = async (id) => {
    return Property.findById(id).populate("ecoRatingId");
};

export const updateProperty = async (id, data, userId, userRole) => {
    const property = await Property.findById(id);
    if (!property) return null;

    // Authorization check: only owner or admin can update
    if (property.ownerId !== userId && userRole !== "admin") {
        throw new Error("Unauthorized to update this property");
    }

    Object.assign(property, data);
    await property.save();
    return property;
};

export const deleteProperty = async (id, userId, userRole, permanent = false) => {
    const property = await Property.findById(id);
    if (!property) return null;

    // Authorization check: only owner or admin can delete
    if (property.ownerId !== userId && userRole !== "admin") {
        throw new Error("Unauthorized to delete this property");
    }

    if (permanent) {
        return Property.findByIdAndDelete(id);
    } else {
        property.availabilityStatus = "archived";
        await property.save();
        return property;
    }
};
