import { jest } from "@jest/globals";

const mockRenterReviewCreate = jest.fn();
const mockRenterReviewFind = jest.fn();
const mockBookingFindOne = jest.fn();

jest.unstable_mockModule("../../models/RenterReview.js", () => ({
  default: {
    create: mockRenterReviewCreate,
    find: mockRenterReviewFind,
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/booking.model.js", () => ({
  default: {
    findOne: mockBookingFindOne,
  },
}));

const {
  calculateReviewScore,
  createRenterReview,
  getAverageRenterScores,
} = await import("../../services/renterReviewService.js");

describe("renterReviewService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calculateReviewScore returns weighted rounded score", () => {
    const score = calculateReviewScore({
      energyEfficiency: 8,
      waterEfficiency: 7,
      wasteManagement: 6,
      transitAccess: 9,
      greenAmenities: 10,
    });

    expect(score).toBe(8.1);
  });

  test("createRenterReview throws when renter has no eligible booking", async () => {
    mockBookingFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(
      createRenterReview({ listingId: "listing-1", criteria: {} }, "renter-1", "Renter")
    ).rejects.toThrow("ReviewNotAllowedForUnbookedListing");
  });

  test("createRenterReview stores score and default approved status", async () => {
    mockBookingFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "booking-1" }),
    });
    mockRenterReviewCreate.mockResolvedValue({ _id: "review-1" });

    await createRenterReview(
      {
        listingId: "listing-1",
        criteria: {
          energyEfficiency: 8,
          waterEfficiency: 8,
          wasteManagement: 8,
          transitAccess: 8,
          greenAmenities: 8,
        },
      },
      "renter-1",
      "R One"
    );

    expect(mockRenterReviewCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        renterId: "renter-1",
        renterName: "R One",
        status: "approved",
        totalScore: 8,
      })
    );
  });

  test("getAverageRenterScores returns null when no approved reviews", async () => {
    mockRenterReviewFind.mockResolvedValue([]);

    const result = await getAverageRenterScores("listing-1");
    expect(result).toBeNull();
  });
});
