const REQUIRED_CRITERIA = [
  "energyEfficiency",
  "waterEfficiency",
  "wasteManagement",
  "transitAccess",
  "greenAmenities",
];

const VALID_LIVING_DURATIONS = [
  "< 3 months",
  "3-6 months",
  "6-12 months",
  "1-2 years",
  "> 2 years",
];

const VALID_STATUSES = ["pending", "approved", "rejected", "hidden"];

const VERIFICATION_FIELDS = [
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

const isNumberBetween = (value, min, max) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max;
};

const validateCriteria = (criteria, requireAll) => {
  const errors = [];

  if (!criteria || typeof criteria !== "object") {
    return ["criteria must be an object"];
  }

  REQUIRED_CRITERIA.forEach((key) => {
    if (criteria[key] === undefined) {
      if (requireAll) {
        errors.push(`criteria.${key} is required`);
      }
      return;
    }
    if (!isNumberBetween(criteria[key], 0, 10)) {
      errors.push(`criteria.${key} must be a number between 0 and 10`);
    }
  });

  return errors;
};

const isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const validateVerification = (verification) => {
  if (verification === undefined) {
    return [];
  }

  if (!verification || typeof verification !== "object") {
    return ["verification must be an object"];
  }

  const errors = [];

  VERIFICATION_FIELDS.forEach((key) => {
    if (verification[key] !== undefined && typeof verification[key] !== "boolean") {
      errors.push(`verification.${key} must be a boolean`);
    }
  });

  return errors;
};

export const validateRenterReviewCreate = (payload) => {
  const errors = [];

  // Validate ecoRatingId
  if (!payload.ecoRatingId) {
    errors.push("ecoRatingId is required");
  } else if (!isValidMongoId(payload.ecoRatingId)) {
    errors.push("ecoRatingId must be a valid MongoDB ObjectId");
  }

  // Validate listingId
  if (!payload.listingId || typeof payload.listingId !== "string") {
    errors.push("listingId is required and must be a string");
  }

  // Validate criteria
  errors.push(...validateCriteria(payload.criteria, true));

  // Validate review text (optional but if provided must be valid)
  if (payload.review !== undefined) {
    if (typeof payload.review !== "string") {
      errors.push("review must be a string");
    } else if (payload.review.length > 1000) {
      errors.push("review must be 1000 characters or less");
    }
  }

  // Validate livingDuration (optional)
  if (payload.livingDuration !== undefined) {
    if (!VALID_LIVING_DURATIONS.includes(payload.livingDuration)) {
      errors.push(
        `livingDuration must be one of: ${VALID_LIVING_DURATIONS.join(", ")}`
      );
    }
  }

  // Validate wouldRecommend (optional)
  if (payload.wouldRecommend !== undefined) {
    if (typeof payload.wouldRecommend !== "boolean") {
      errors.push("wouldRecommend must be a boolean");
    }
  }

  // Validate verification (optional)
  errors.push(...validateVerification(payload.verification));

  return errors;
};

export const validateRenterReviewUpdate = (payload) => {
  const errors = [];

  // Criteria validation (optional for updates)
  if (payload.criteria !== undefined) {
    errors.push(...validateCriteria(payload.criteria, false));
  }

  // Validate review text (optional)
  if (payload.review !== undefined) {
    if (typeof payload.review !== "string") {
      errors.push("review must be a string");
    } else if (payload.review.length > 1000) {
      errors.push("review must be 1000 characters or less");
    }
  }

  // Validate livingDuration (optional)
  if (payload.livingDuration !== undefined) {
    if (!VALID_LIVING_DURATIONS.includes(payload.livingDuration)) {
      errors.push(
        `livingDuration must be one of: ${VALID_LIVING_DURATIONS.join(", ")}`
      );
    }
  }

  // Validate wouldRecommend (optional)
  if (payload.wouldRecommend !== undefined) {
    if (typeof payload.wouldRecommend !== "boolean") {
      errors.push("wouldRecommend must be a boolean");
    }
  }

  // Validate verification (optional)
  errors.push(...validateVerification(payload.verification));

  return errors;
};

export const validateStatusUpdate = (payload) => {
  const errors = [];

  if (!payload.status) {
    errors.push("status is required");
  } else if (!VALID_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  return errors;
};

export const validateReviewReply = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return ["payload must be an object"];
  }

  if (!payload.text || typeof payload.text !== "string") {
    errors.push("text is required and must be a string");
  } else {
    const trimmed = payload.text.trim();
    if (!trimmed.length) {
      errors.push("text cannot be empty");
    }
    if (trimmed.length > 500) {
      errors.push("text must be 500 characters or less");
    }
  }

  return errors;
};
