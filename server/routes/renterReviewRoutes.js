import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createRenterReviewHandler,
  getListingReviewsHandler,
  getEcoRatingReviewsHandler,
  getMyReviewsHandler,
  getReviewByIdHandler,
  updateRenterReviewHandler,
  deleteRenterReviewHandler,
  updateReviewStatusHandler,
  markReviewHelpfulHandler,
  getListingAveragesHandler,
} from "../controllers/renterReviewController.js";

const router = Router();

// Public routes
router.get("/listing/:listingId", getListingReviewsHandler);
router.get("/listing/:listingId/averages", getListingAveragesHandler);
router.get("/eco-rating/:ecoRatingId", getEcoRatingReviewsHandler);
router.get("/:id", getReviewByIdHandler);
router.post("/:id/helpful", markReviewHelpfulHandler);

// Protected routes - Renter only
router.post("/", authenticate, authorize("renter"), createRenterReviewHandler);
router.get("/my/reviews", authenticate, authorize("renter"), getMyReviewsHandler);
router.put("/:id", authenticate, authorize("renter", "admin"), updateRenterReviewHandler);
router.delete("/:id", authenticate, authorize("renter", "admin"), deleteRenterReviewHandler);

// Admin only routes
router.patch("/:id/status", authenticate, authorize("admin"), updateReviewStatusHandler);

export default router;
