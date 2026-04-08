import { jest } from "@jest/globals";

const mockCreateRenterReview = jest.fn();
const mockGetReviewsByListing = jest.fn();
const mockGetAverageRenterScores = jest.fn();
const mockUpdateRenterReview = jest.fn();

const mockValidateRenterReviewCreate = jest.fn();
const mockValidateRenterReviewUpdate = jest.fn();

jest.unstable_mockModule("../../services/renterReviewService.js", () => ({
  createRenterReview: mockCreateRenterReview,
  getReviewsByListing: mockGetReviewsByListing,
  getReviewsByEcoRating: jest.fn(),
  getReviewsByRenter: jest.fn(),
  getReviewById: jest.fn(),
  updateRenterReview: mockUpdateRenterReview,
  deleteRenterReview: jest.fn(),
  updateReviewStatus: jest.fn(),
  markReviewHelpful: jest.fn(),
  getAverageRenterScores: mockGetAverageRenterScores,
  getReviewsForAdmin: jest.fn(),
  addReplyToReview: jest.fn(),
  deleteReplyFromReview: jest.fn(),
}));

jest.unstable_mockModule("../../validators/renterReviewValidators.js", () => ({
  validateRenterReviewCreate: mockValidateRenterReviewCreate,
  validateRenterReviewUpdate: mockValidateRenterReviewUpdate,
  validateStatusUpdate: jest.fn(),
  validateReviewReply: jest.fn(),
}));

const {
  createRenterReviewHandler,
  getListingReviewsHandler,
  updateRenterReviewHandler,
} = await import("../../controllers/renterReviewController.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("renterReviewController unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateRenterReviewCreate.mockReturnValue([]);
    mockValidateRenterReviewUpdate.mockReturnValue([]);
  });

  test("createRenterReviewHandler returns 400 on validation errors", async () => {
    const req = { body: { listingId: "l1" }, user: { id: "u1", name: "U One" } };
    const res = createRes();

    mockValidateRenterReviewCreate.mockReturnValue(["ecoRatingId is required"]);

    await createRenterReviewHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: ["ecoRatingId is required"] });
    expect(mockCreateRenterReview).not.toHaveBeenCalled();
  });

  test("getListingReviewsHandler uses approved status by default", async () => {
    const req = { params: { listingId: "listing-1" }, query: {} };
    const res = createRes();
    mockGetReviewsByListing.mockResolvedValue([]);
    mockGetAverageRenterScores.mockResolvedValue({ overall: 8.2 });

    await getListingReviewsHandler(req, res);

    expect(mockGetReviewsByListing).toHaveBeenCalledWith("listing-1", ["approved"]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateRenterReviewHandler maps unauthorized error to 403", async () => {
    const req = {
      params: { id: "r1" },
      body: { review: "Updated" },
      user: { id: "u2", role: "renter" },
    };
    const res = createRes();

    mockUpdateRenterReview.mockRejectedValue(new Error("Unauthorized to update this review"));

    await updateRenterReviewHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized to update this review" });
  });
});
