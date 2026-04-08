import { jest } from "@jest/globals";

const mockGetAirQualityScore = jest.fn();
const mockEcoCreate = jest.fn();
const mockEcoFindById = jest.fn();
const mockPropertyFindByIdAndUpdate = jest.fn();

jest.unstable_mockModule("../../services/airQualityService.js", () => ({
  getAirQualityScore: mockGetAirQualityScore,
}));

jest.unstable_mockModule("../../models/EcoRating.js", () => ({
  default: {
    create: mockEcoCreate,
    find: jest.fn(),
    findById: mockEcoFindById,
    findByIdAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/Property.js", () => ({
  default: {
    findByIdAndUpdate: mockPropertyFindByIdAndUpdate,
  },
}));

const {
  calculateTotalScore,
  createEcoRating,
  updateEcoRating,
} = await import("../../services/ecoRatingService.js");

describe("ecoRatingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calculateTotalScore is capped at 100", () => {
    const score = calculateTotalScore({
      energyRating: "A",
      solarPanels: true,
      ledLighting: true,
      efficientAc: true,
      waterSavingTaps: true,
      rainwaterHarvesting: true,
      waterMeter: true,
      recyclingAvailable: true,
      compostAvailable: true,
      transportDistance: "< 1 km",
      evCharging: true,
      goodVentilationSunlight: true,
    });

    expect(score).toBe(100);
  });

  test("createEcoRating persists with air quality and links property", async () => {
    mockGetAirQualityScore.mockResolvedValue({ score: 7, data: { source: "aq" } });
    mockEcoCreate.mockResolvedValue({ _id: "eco-1" });

    const payload = {
      listingId: "listing-1",
      location: { latitude: 6.9, longitude: 79.8 },
      criteria: { energyRating: "B" },
      externalSignals: { previous: true },
    };

    await createEcoRating(payload);

    expect(mockEcoCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        listingId: "listing-1",
        airQualityScore: 7,
        externalSignals: expect.objectContaining({
          previous: true,
          airQuality: { source: "aq" },
        }),
      })
    );
    expect(mockPropertyFindByIdAndUpdate).toHaveBeenCalledWith("listing-1", {
      ecoRatingId: "eco-1",
      ecoRatingClearedAt: null,
    });
  });

  test("updateEcoRating merges criteria and saves", async () => {
    const set = jest.fn();
    const save = jest.fn().mockResolvedValue(undefined);

    mockEcoFindById.mockResolvedValue({
      criteria: { toObject: () => ({ energyRating: "C", solarPanels: false }) },
      externalSignals: { old: 1 },
      airQualityScore: 4,
      set,
      save,
    });

    const result = await updateEcoRating("eco-1", { criteria: { solarPanels: true } });

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        criteria: expect.objectContaining({ energyRating: "C", solarPanels: true }),
      })
    );
    expect(save).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
