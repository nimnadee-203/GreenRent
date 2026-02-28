import RenterReview from "../models/RenterReview.js";

const CRITERIA_WEIGHTS = {
  energyEfficiency: 0.25,
  waterEfficiency: 0.2,
  wasteManagement: 0.15,
  transitAccess: 0.2,
  greenAmenities: 0.2,
};

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

/**
 * Calculate total score from criteria
 */
export const calculateReviewScore = (criteria) => {
  let score = 0;
  Object.keys(CRITERIA_WEIGHTS).forEach((key) => {
    score += Number(criteria[key]) * CRITERIA_WEIGHTS[key];
  });
  return roundToOneDecimal(score);
};

/**
 * Create a new renter review
 */
export const createRenterReview = async (data, renterId, renterName) => {
  const totalScore = calculateReviewScore(data.criteria);

  const review = await RenterReview.create({
    ...data,
    renterId,
    renterName: renterName || "Anonymous",
    totalScore,
    status: "pending", // All reviews start as pending
  });

  return review;
};

/**
 * Get all reviews for a specific listing
 */
export const getReviewsByListing = async (listingId, includeStatus = ["approved"]) => {
  const query = { listingId };
  
  if (includeStatus.length > 0) {
    query.status = { $in: includeStatus };
  }

  return RenterReview.find(query)
    .sort({ createdAt: -1 })
    .select("-__v");
};

/**
 * Get all reviews for a specific eco rating
 */
export const getReviewsByEcoRating = async (ecoRatingId, includeStatus = ["approved"]) => {
  const query = { ecoRatingId };
  
  if (includeStatus.length > 0) {
    query.status = { $in: includeStatus };
  }

  return RenterReview.find(query)
    .sort({ createdAt: -1 })
    .select("-__v");
};

/**
 * Get all reviews by a specific renter
 */
export const getReviewsByRenter = async (renterId) => {
  return RenterReview.find({ renterId })
    .sort({ createdAt: -1 })
    .select("-__v");
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (reviewId) => {
  return RenterReview.findById(reviewId);
};

/**
 * Update a review (only by original creator or admin)
 */
export const updateRenterReview = async (reviewId, data, userId, userRole) => {
  const review = await RenterReview.findById(reviewId);
  
  if (!review) {
    return null;
  }

  // Check permissions
  if (review.renterId !== userId && userRole !== "admin") {
    throw new Error("Unauthorized to update this review");
  }

  // Recalculate score if criteria changed
  let totalScore = review.totalScore;
  let updatedCriteria = review.criteria;
  if (data.criteria) {
    updatedCriteria = { ...review.criteria.toObject(), ...data.criteria };
    totalScore = calculateReviewScore(updatedCriteria);
  }

  const updatedVerification = data.verification
    ? { ...(review.verification?.toObject?.() || review.verification || {}), ...data.verification }
    : review.verification;

  Object.assign(review, data, {
    criteria: updatedCriteria,
    verification: updatedVerification,
  });
  review.totalScore = totalScore;

  await review.save();
  return review;
};

/**
 * Delete a review (only by original creator or admin)
 */
export const deleteRenterReview = async (reviewId, userId, userRole) => {
  const review = await RenterReview.findById(reviewId);
  
  if (!review) {
    return null;
  }

  // Check permissions
  if (review.renterId !== userId && userRole !== "admin") {
    throw new Error("Unauthorized to delete this review");
  }

  await RenterReview.findByIdAndDelete(reviewId);
  return review;
};

/**
 * Approve/reject review (admin only)
 */
export const updateReviewStatus = async (reviewId, status, adminId) => {
  const review = await RenterReview.findById(reviewId);
  
  if (!review) {
    return null;
  }

  review.status = status;
  
  if (status === "approved") {
    review.verified = true;
    review.verifiedBy = adminId;
  }

  await review.save();
  return review;
};

/**
 * Mark review as helpful (increment helpful count)
 */
export const markReviewHelpful = async (reviewId) => {
  return RenterReview.findByIdAndUpdate(
    reviewId,
    { $inc: { helpfulCount: 1 } },
    { new: true }
  );
};

/**
 * Get average renter scores for a listing
 */
export const getAverageRenterScores = async (listingId) => {
  const reviews = await RenterReview.find({ 
    listingId, 
    status: "approved" 
  });

  if (reviews.length === 0) {
    return null;
  }

  const avgCriteria = {
    energyEfficiency: 0,
    waterEfficiency: 0,
    wasteManagement: 0,
    transitAccess: 0,
    greenAmenities: 0,
  };

  let totalScore = 0;

  reviews.forEach((review) => {
    Object.keys(avgCriteria).forEach((key) => {
      avgCriteria[key] += review.criteria[key];
    });
    totalScore += review.totalScore;
  });

  Object.keys(avgCriteria).forEach((key) => {
    avgCriteria[key] = roundToOneDecimal(avgCriteria[key] / reviews.length);
  });

  return {
    averageCriteria: avgCriteria,
    averageTotalScore: roundToOneDecimal(totalScore / reviews.length),
    reviewCount: reviews.length,
    recommendationRate: roundToOneDecimal(
      (reviews.filter((r) => r.wouldRecommend).length / reviews.length) * 100
    ),
  };
};
