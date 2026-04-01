import {
  createRenterReview,
  getReviewsByListing,
  getReviewsByEcoRating,
  getReviewsByRenter,
  getReviewById,
  updateRenterReview,
  deleteRenterReview,
  updateReviewStatus,
  markReviewHelpful,
  getAverageRenterScores,
} from "../services/renterReviewService.js";
import {
  validateRenterReviewCreate,
  validateRenterReviewUpdate,
  validateStatusUpdate,
} from "../validators/renterReviewValidators.js";

/**
 * Create a new renter review (Protected - Renter only)
 */
export const createRenterReviewHandler = async (req, res) => {
  try {
    const errors = validateRenterReviewCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const review = await createRenterReview(
      req.body,
      req.user.id,
      req.user.name
    );

    return res.status(201).json({
      message: "Review submitted successfully and is pending approval",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this listing",
      });
    }
    if (error.message === "ReviewNotAllowedForUnbookedListing") {
      return res.status(403).json({
        message: "You can review only properties you have booked.",
      });
    }
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Failed to create review" });
  }
};

/**
 * Get all reviews for a listing (Public)
 */
export const getListingReviewsHandler = async (req, res) => {
  try {
    const { listingId } = req.params;
    const includeStatus = req.query.status 
      ? req.query.status.split(",")
      : ["approved", "pending"];

    const reviews = await getReviewsByListing(listingId, includeStatus);
    const averages = await getAverageRenterScores(listingId);

    return res.status(200).json({
      reviews,
      summary: averages,
    });
  } catch (error) {
    console.error("Get listing reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * Get all reviews for an eco rating (Public)
 */
export const getEcoRatingReviewsHandler = async (req, res) => {
  try {
    const { ecoRatingId } = req.params;
    const includeStatus = req.query.status 
      ? req.query.status.split(",")
      : ["approved"];

    const reviews = await getReviewsByEcoRating(ecoRatingId, includeStatus);

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get eco rating reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * Get all reviews by current renter (Protected - Renter own)
 */
export const getMyReviewsHandler = async (req, res) => {
  try {
    const reviews = await getReviewsByRenter(req.user.id);
    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get my reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch your reviews" });
  }
};

/**
 * Get a single review by ID (Public)
 */
export const getReviewByIdHandler = async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ review });
  } catch (error) {
    console.error("Get review error:", error);
    return res.status(500).json({ message: "Failed to fetch review" });
  }
};

/**
 * Update a review (Protected - Renter owner or Admin)
 */
export const updateRenterReviewHandler = async (req, res) => {
  try {
    const errors = validateRenterReviewUpdate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const review = await updateRenterReview(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    if (error.message === "Unauthorized to update this review") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "ReviewNotAllowedForUnbookedListing") {
      return res.status(403).json({
        message: "You can update reviews only for properties you currently use or used previously.",
      });
    }
    console.error("Update review error:", error);
    return res.status(500).json({ message: "Failed to update review" });
  }
};

/**
 * Delete a review (Protected - Renter owner or Admin)
 */
export const deleteRenterReviewHandler = async (req, res) => {
  try {
    const review = await deleteRenterReview(
      req.params.id,
      req.user.id,
      req.user.role
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    if (error.message === "Unauthorized to delete this review") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "ReviewNotAllowedForUnbookedListing") {
      return res.status(403).json({
        message: "You can delete reviews only for properties you currently use or used previously.",
      });
    }
    console.error("Delete review error:", error);
    return res.status(500).json({ message: "Failed to delete review" });
  }
};

/**
 * Approve or reject a review (Protected - Admin only)
 */
export const updateReviewStatusHandler = async (req, res) => {
  try {
    const errors = validateStatusUpdate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const review = await updateReviewStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: `Review ${req.body.status} successfully`,
      review,
    });
  } catch (error) {
    console.error("Update review status error:", error);
    return res.status(500).json({ message: "Failed to update review status" });
  }
};

/**
 * Mark a review as helpful (Public)
 */
export const markReviewHelpfulHandler = async (req, res) => {
  try {
    const review = await markReviewHelpful(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: "Review marked as helpful",
      helpfulCount: review.helpfulCount,
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    return res.status(500).json({ message: "Failed to mark review as helpful" });
  }
};

/**
 * Get average scores for a listing (Public)
 */
export const getListingAveragesHandler = async (req, res) => {
  try {
    const { listingId } = req.params;
    const averages = await getAverageRenterScores(listingId);

    if (!averages) {
      return res.status(200).json({
        message: "No approved reviews yet",
        averages: null,
      });
    }

    return res.status(200).json({ averages });
  } catch (error) {
    console.error("Get averages error:", error);
    return res.status(500).json({ message: "Failed to calculate averages" });
  }
};
