import { jest } from "@jest/globals";

const mockCreateEcoRating = jest.fn();
const mockListEcoRatings = jest.fn();
const mockGetEcoRatingById = jest.fn();
const mockUpdateEcoRating = jest.fn();

const mockValidateCreate = jest.fn();
const mockValidateUpdate = jest.fn();

jest.unstable_mockModule("../../services/ecoRatingService.js", () => ({
  createEcoRating: mockCreateEcoRating,
  listEcoRatings: mockListEcoRatings,
  getEcoRatingById: mockGetEcoRatingById,
  updateEcoRating: mockUpdateEcoRating,
  deleteEcoRating: jest.fn(),
}));

jest.unstable_mockModule("../../validators/ecoRatingValidators.js", () => ({
  validateEcoRatingCreate: mockValidateCreate,
  validateEcoRatingUpdate: mockValidateUpdate,
}));

const {
  createEcoRatingHandler,
  listEcoRatingsHandler,
  updateEcoRatingHandler,
} = await import("../../controllers/ecoRatingController.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ecoRatingController unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateCreate.mockReturnValue([]);
    mockValidateUpdate.mockReturnValue([]);
  });

  test("createEcoRatingHandler returns 400 for validation errors", async () => {
    const req = { body: { listingId: "p1" }, user: { id: "u1" } };
    const res = createRes();
    mockValidateCreate.mockReturnValue(["listingId is required"]);

    await createEcoRatingHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: ["listingId is required"] });
    expect(mockCreateEcoRating).not.toHaveBeenCalled();
  });

  test("listEcoRatingsHandler passes listingId filter", async () => {
    const req = { query: { listingId: "listing-123" } };
    const res = createRes();
    mockListEcoRatings.mockResolvedValue([{ _id: "e1" }]);

    await listEcoRatingsHandler(req, res);

    expect(mockListEcoRatings).toHaveBeenCalledWith({ listingId: "listing-123" });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateEcoRatingHandler returns 404 when service returns null", async () => {
    const req = { params: { id: "e1" }, body: { criteria: {} } };
    const res = createRes();
    mockUpdateEcoRating.mockResolvedValue(null);

    await updateEcoRatingHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Eco rating not found" });
  });
});