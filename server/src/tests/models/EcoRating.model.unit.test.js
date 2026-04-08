import EcoRating from "../../models/EcoRating.js";

const baseCriteria = {
  energyRating: "A",
  solarPanels: true,
  ledLighting: true,
  efficientAc: true,
  waterSavingTaps: true,
  rainwaterHarvesting: false,
  waterMeter: true,
  recyclingAvailable: true,
  compostAvailable: false,
  transportDistance: "1-3 km",
  evCharging: false,
  goodVentilationSunlight: true,
};

describe("EcoRating model", () => {
  test("validates a correct eco rating payload", () => {
    const doc = new EcoRating({
      listingId: "listing-1",
      location: { latitude: 6.9271, longitude: 79.8612, address: "Colombo" },
      criteria: baseCriteria,
      totalScore: 87,
    });

    const error = doc.validateSync();
    expect(error).toBeUndefined();
    expect(doc.evidenceLinks).toEqual([]);
  });

  test("fails validation when location latitude is out of range", () => {
    const doc = new EcoRating({
      listingId: "listing-2",
      location: { latitude: 120, longitude: 79.8612 },
      criteria: baseCriteria,
      totalScore: 70,
    });

    const error = doc.validateSync();
    expect(error.errors["location.latitude"]).toBeDefined();
  });

  test("fails validation when totalScore is missing", () => {
    const doc = new EcoRating({
      listingId: "listing-3",
      location: { latitude: 6.9, longitude: 79.8 },
      criteria: baseCriteria,
    });

    const error = doc.validateSync();
    expect(error.errors.totalScore).toBeDefined();
  });
});
