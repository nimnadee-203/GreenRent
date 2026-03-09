const PROPERTY_TYPES = ["apartment", "house", "studio", "townhouse", "other"];
const AVAILABILITY_STATUSES = ["available", "rented", "archived"];

const isNumber = (value) => typeof value === "number" && !isNaN(value);

export const validatePropertyCreate = (data) => {
    const errors = [];

    if (!data.title || typeof data.title !== "string" || data.title.length < 5) {
        errors.push("Title is required and must be at least 5 characters long");
    }

    if (!data.description || typeof data.description !== "string" || data.description.length < 10) {
        errors.push("Description is required and must be at least 10 characters long");
    }

    if (!data.location || typeof data.location !== "object") {
        errors.push("Location is required");
    } else {
        if (!data.location.address || typeof data.location.address !== "string") {
            errors.push("Location address is required");
        }
        if (data.location.coordinates !== undefined) {
            if (typeof data.location.coordinates !== "object") {
                errors.push("Location coordinates must be an object");
            } else {
                const { lat, lng } = data.location.coordinates;
                if (lat !== undefined && lat !== null && (!isNumber(lat) || lat < -90 || lat > 90)) {
                    errors.push("Latitude must be a number between -90 and 90");
                }
                if (lng !== undefined && lng !== null && (!isNumber(lng) || lng < -180 || lng > 180)) {
                    errors.push("Longitude must be a number between -180 and 180");
                }
            }
        }
    }

    if (!isNumber(data.price) || data.price < 0) {
        errors.push("Price must be a positive number");
    }

    if (!PROPERTY_TYPES.includes(data.propertyType)) {
        errors.push(`Property type must be one of: ${PROPERTY_TYPES.join(", ")}`);
    }

    if (!data.ecoFeatures || typeof data.ecoFeatures !== "object") {
        errors.push("Eco features are required");
    }

    if (data.images && !Array.isArray(data.images)) {
        errors.push("Images must be an array of strings");
    }

    return errors;
};

export const validatePropertyUpdate = (data) => {
    const errors = [];

    if (data.title !== undefined && (typeof data.title !== "string" || data.title.length < 5)) {
        errors.push("Title must be at least 5 characters long");
    }

    if (data.description !== undefined && (typeof data.description !== "string" || data.description.length < 10)) {
        errors.push("Description must be at least 10 characters long");
    }

    if (data.location !== undefined) {
        if (typeof data.location !== "object") {
            errors.push("Location must be an object");
        } else {
            if (data.location.address !== undefined && typeof data.location.address !== "string") {
                errors.push("Location address must be a string");
            }
            if (data.location.coordinates !== undefined) {
                if (typeof data.location.coordinates !== "object") {
                    errors.push("Location coordinates must be an object");
                } else {
                    const { lat, lng } = data.location.coordinates;
                    if (lat !== undefined && lat !== null && (!isNumber(lat) || lat < -90 || lat > 90)) {
                        errors.push("Latitude must be a number between -90 and 90");
                    }
                    if (lng !== undefined && lng !== null && (!isNumber(lng) || lng < -180 || lng > 180)) {
                        errors.push("Longitude must be a number between -180 and 180");
                    }
                }
            }
        }
    }

    if (data.price !== undefined && (!isNumber(data.price) || data.price < 0)) {
        errors.push("Price must be a positive number");
    }

    if (data.propertyType !== undefined && !PROPERTY_TYPES.includes(data.propertyType)) {
        errors.push(`Property type must be one of: ${PROPERTY_TYPES.join(", ")}`);
    }

    if (data.availabilityStatus !== undefined && !AVAILABILITY_STATUSES.includes(data.availabilityStatus)) {
        errors.push(`Availability status must be one of: ${AVAILABILITY_STATUSES.join(", ")}`);
    }

    if (data.ecoFeatures !== undefined && typeof data.ecoFeatures !== "object") {
        errors.push("Eco features must be an object");
    }

    if (data.images !== undefined && !Array.isArray(data.images)) {
        errors.push("Images must be an array of strings");
    }

    return errors;
};
