import mongoose from "mongoose";
import AIInsightCache from "../../models/AIInsightCache.js";

describe("AIInsightCache model", () => {
  test("sets required fields and applies expiresAt default", () => {
    const now = Date.now();
    const doc = new AIInsightCache({
      userId: new mongoose.Types.ObjectId(),
      propertyId: new mongoose.Types.ObjectId(),
      preferencesHash: "prefs-hash",
      insight: "Prefer locations with better air quality.",
    });

    const error = doc.validateSync();
    expect(error).toBeUndefined();

    const ttlMs = doc.expiresAt.getTime() - now;
    expect(ttlMs).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
    expect(ttlMs).toBeLessThan(8 * 24 * 60 * 60 * 1000);
  });

  test("declares ttl and compound unique indexes", () => {
    const indexes = AIInsightCache.schema.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        [{ expiresAt: 1 }, expect.objectContaining({ expireAfterSeconds: 0 })],
        [
          { userId: 1, propertyId: 1, preferencesHash: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ])
    );
  });
});
