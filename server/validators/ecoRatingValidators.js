const ENERGY_RATINGS = ["A", "B", "C", "D", "E"];
const TRANSPORT_DISTANCES = ["< 1 km", "1-3 km", "> 3 km"];

const isBoolean = (value) => typeof value === "boolean";

const validateCriteria = (criteria, requireAll) => {
  const errors = [];

  if (!criteria || typeof criteria !== "object") {
    return ["criteria must be an object"];
  }

  const requiredFields = [
    "energyRating",
    "solarPanels",
    "ledLighting",
    "efficientAc",
    "waterSavingTaps",
    "rainwaterHarvesting",
    "waterMeter",
    "recyclingAvailable",
    "compostAvailable",
    "transportDistance",
    "evCharging",
    "goodVentilationSunlight",
  ];

  requiredFields.forEach((key) => {
    if (criteria[key] === undefined) {
      if (requireAll) {
        errors.push(`criteria.${key} is required`);
      }
    }
  });

  if (criteria.energyRating !== undefined && !ENERGY_RATINGS.includes(criteria.energyRating)) {
    errors.push("criteria.energyRating must be one of: A, B, C, D, E");
  }

  if (criteria.transportDistance !== undefined && !TRANSPORT_DISTANCES.includes(criteria.transportDistance)) {
    errors.push("criteria.transportDistance must be one of: < 1 km, 1-3 km, > 3 km");
  }

  const booleanFields = [
    "solarPanels",
    "ledLighting",
    "efficientAc",
    "waterSavingTaps",
    "rainwaterHarvesting",
    "waterMeter",
    "recyclingAvailable",
    "compostAvailable",
    "evCharging",
    "goodVentilationSunlight",
  ];

  booleanFields.forEach((key) => {
    if (criteria[key] !== undefined && !isBoolean(criteria[key])) {
      errors.push(`criteria.${key} must be a boolean`);
    }
  });

  return errors;
};

const validateEvidenceLinks = (links) => {
  if (links === undefined) {
    return [];
  }
  if (!Array.isArray(links)) {
    return ["evidenceLinks must be an array of strings"];
  }
  const invalid = links.some((link) => typeof link !== "string");
  return invalid ? ["evidenceLinks must be an array of strings"] : [];
};

const isNumberBetween = (value, min, max) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max;
};

const validateLocation = (location, isRequired) => {
  const errors = [];

  if (!location) {
    if (isRequired) {
      errors.push("location is required");
    }
    return errors;
  }

  if (typeof location !== "object") {
    errors.push("location must be an object");
    return errors;
  }

  if (location.latitude === undefined) {
    if (isRequired) {
      errors.push("location.latitude is required");
    }
  } else if (!isNumberBetween(location.latitude, -90, 90)) {
    errors.push("location.latitude must be a number between -90 and 90");
  }

  if (location.longitude === undefined) {
    if (isRequired) {
      errors.push("location.longitude is required");
    }
  } else if (!isNumberBetween(location.longitude, -180, 180)) {
    errors.push("location.longitude must be a number between -180 and 180");
  }

  if (location.address !== undefined && typeof location.address !== "string") {
    errors.push("location.address must be a string");
  }

  return errors;
};

export const validateEcoRatingCreate = (payload) => {
  const errors = [];

  if (!payload.listingId || typeof payload.listingId !== "string") {
    errors.push("listingId is required and must be a string");
  }

  errors.push(...validateLocation(payload.location, true));
  errors.push(...validateCriteria(payload.criteria, true));
  errors.push(...validateEvidenceLinks(payload.evidenceLinks));

  return errors;
};

export const validateEcoRatingUpdate = (payload) => {
  const errors = [];

  if (payload.listingId !== undefined && typeof payload.listingId !== "string") {
    errors.push("listingId must be a string");
  }

  if (payload.location !== undefined) {
    errors.push(...validateLocation(payload.location, false));
  }

  if (payload.criteria !== undefined) {
    errors.push(...validateCriteria(payload.criteria, false));
  }

  errors.push(...validateEvidenceLinks(payload.evidenceLinks));

  return errors;
};
