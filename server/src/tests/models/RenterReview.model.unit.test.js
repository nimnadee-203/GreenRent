import mongoose from "mongoose";
import RenterReview from "../../models/RenterReview.js";

const baseCriteria = {
  energyEfficiency: 8,
  waterEfficiency: 7,
  wasteManagement: 9,
  transitAccess: 6,
  greenAmenities: 8,
};

describe("RenterReview model", () => {
  test("applies defaults for status and helpfulCount", () => {
    const doc = new RenterReview({
      ecoRatingId: new mongoose.Types.ObjectId(),
      listingId: "listing-1",
      renterId: "renter-1",
      criteria: baseCriteria,
      totalScore: 8.2,
    });

    const error = doc.validateSync();
    expect(error).toBeUndefined();
    expect(doc.status).toBe("approved");
    expect(doc.helpfulCount).toBe(0);
    expect(doc.replies).toEqual([]);
  });

  test("fails validation when criteria score is out of range", () => {
    const doc = new RenterReview({
      ecoRatingId: new mongoose.Types.ObjectId(),
      listingId: "listing-2",
      renterId: "renter-2",
      criteria: { ...baseCriteria, energyEfficiency: 11 },
      totalScore: 7.5,
    });

    const error = doc.validateSync();
    expect(error.errors["criteria.energyEfficiency"]).toBeDefined();
  });

  test("declares unique index for listingId + renterId", () => {
    const indexes = RenterReview.schema.indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        [{ listingId: 1, renterId: 1 }, expect.objectContaining({ unique: true })],
      ])
    );
  });
});
