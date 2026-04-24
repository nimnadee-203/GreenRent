import RenterReview from "../models/RenterReview.js";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";

const CRITERIA_WEIGHTS = {
  energyEfficiency: 0.25,
  waterEfficiency: 0.2,
  wasteManagement: 0.15,
  transitAccess: 0.2,
  greenAmenities: 0.2,
};

// round to next decimal place 
const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

/**
 * Calculate total score from criteria
 */
export const calculateReviewScore = (criteria) => {
  let score = 0;
  Object.keys(CRITERIA_WEIGHTS).forEach((key) => {
    score += Number(criteria[key]) * CRITERIA_WEIGHTS[key]; // add up to score 
  });
  return roundToOneDecimal(score);
};

// Checks if this renter is allowed to review this listing.
const hasEligibleBookingForListing = async (renterId, listingId) => {
  const statusQuery = { $in: ["confirmed", "completed"] };
  const bookingQuery = {
    apartmentId: listingId,
    status: statusQuery,
  };

  // This checks whether renter id looks like a MongoDB ObjectId
  const isObjectId = mongoose.Types.ObjectId.isValid(renterId) && String(renterId).length === 24;
  if (isObjectId) {
    bookingQuery.$or = [
      { userId: renterId },
      { userId: new mongoose.Types.ObjectId(renterId) },
    ];
  } else {
    bookingQuery.userId = renterId;
  }

  // search booking
  const eligibleBooking = await Booking.findOne(bookingQuery).select("_id");
  return Boolean(eligibleBooking);
};

/**
 * check booking, calculate score, save review.
 */
export const createRenterReview = async (data, renterId, renterName) => {
  const canReview = await hasEligibleBookingForListing(renterId, data.listingId);
  if (!canReview) {
    throw new Error("ReviewNotAllowedForUnbookedListing");
  }

  const totalScore = calculateReviewScore(data.criteria); // calculate score

  const review = await RenterReview.create({
    ...data,
    renterId,
    renterName: renterName || "Anonymous",
    totalScore,
    status: "approved", // Reviews are visible by default
  });

  return review;
};

/**
 * Get all reviews for a specific listing
 * By default include both approved and pending reviews so renters
 * can see their feedback immediately.
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
 * Update a review (only by original creator or admin) check permission, merge changes, recalculate score, save.
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

  if (userRole !== "admin") {
    const canReview = await hasEligibleBookingForListing(userId, review.listingId);
    if (!canReview) {
      throw new Error("ReviewNotAllowedForUnbookedListing");
    }
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
 * Delete a review (only by original creator or admin) check permission and delete review.
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

  if (userRole !== "admin") {
    const canReview = await hasEligibleBookingForListing(userId, review.listingId);
    if (!canReview) {
      throw new Error("ReviewNotAllowedForUnbookedListing");
    }
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

  const normalizedStatus = status === "hidden" ? "rejected" : status;
  review.status = normalizedStatus;
  
  if (normalizedStatus === "approved") {
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
    { returnDocument: "after" }
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

  // if no review then 0 
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

  // summ all review 
  reviews.forEach((review) => {
    Object.keys(avgCriteria).forEach((key) => {
      avgCriteria[key] += review.criteria[key];
    });
    totalScore += review.totalScore;
  });

  // This turns totals into avarages
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

// admin review list with filters.
export const getReviewsForAdmin = async (filter = {}) => {
  const query = {};
  if (filter.status) {
    if (filter.status === "hidden") {
      query.status = "rejected";
    } else if (filter.status === "visible") {
      query.status = "approved";
    } else {
      query.status = filter.status;
    }
  }

  return RenterReview.find(query)
    .sort({ createdAt: -1 })
    .select("-__v");
};

//  add a new reply to review.
export const addReplyToReview = async (reviewId, payload, user) => {
  const review = await RenterReview.findById(reviewId);
  if (!review) return null;

  review.replies.push({
    userId: user.id,
    userName: user.name || "Anonymous",
    userRole: user.role || "user",
    text: payload.text.trim(),
  });

  await review.save();
  return review;
};

// Deletes one reply from a review.
export const deleteReplyFromReview = async (reviewId, replyId, user) => {
  const review = await RenterReview.findById(reviewId);
  if (!review) return null;

  const reply = review.replies.id(replyId);
  if (!reply) return null;

  const canDelete = user.role === "admin" || String(reply.userId) === String(user.id);
  if (!canDelete) {
    throw new Error("Unauthorized to delete this reply");
  }

  review.replies.pull(replyId);
  await review.save();
  return review;
};
