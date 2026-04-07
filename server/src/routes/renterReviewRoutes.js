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
  getAdminReviewsHandler,
  addReviewReplyHandler,
  deleteReviewReplyHandler,
} from "../controllers/renterReviewController.js";

const router = Router();

// Public routes
router.get("/listing/:listingId", getListingReviewsHandler);
router.get("/listing/:listingId/averages", getListingAveragesHandler);
router.get("/eco-rating/:ecoRatingId", getEcoRatingReviewsHandler);
router.get("/admin/list", authenticate, authorize("admin"), getAdminReviewsHandler);
router.get("/:id", getReviewByIdHandler);
router.post("/:id/helpful", markReviewHelpfulHandler);
router.post("/:id/replies", authenticate, authorize("renter", "user", "seller", "admin"), addReviewReplyHandler);
router.delete("/:id/replies/:replyId", authenticate, authorize("renter", "user", "seller", "admin"), deleteReviewReplyHandler);

// Protected routes - Renter/user roles
// Allow both legacy "renter" role and current "user" role
router.post("/", authenticate, authorize("renter", "user"), createRenterReviewHandler);
router.get("/my/reviews", authenticate, authorize("renter", "user"), getMyReviewsHandler);
router.put("/:id", authenticate, authorize("renter", "user", "admin"), updateRenterReviewHandler);
router.delete("/:id", authenticate, authorize("renter", "user", "admin"), deleteRenterReviewHandler);

// Admin only routes
router.patch("/:id/status", authenticate, authorize("admin"), updateReviewStatusHandler);

export default router;
