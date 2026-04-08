import { jest } from "@jest/globals";

const mockGeocodeAddress = jest.fn();
const mockPropertyCreate = jest.fn();
const mockPropertyFind = jest.fn();
const mockPropertyFindById = jest.fn();
const mockPropertyFindByIdAndUpdate = jest.fn();

jest.unstable_mockModule("../../services/openStreetMapService.js", () => ({
  geocodeAddress: mockGeocodeAddress,
}));

jest.unstable_mockModule("../../models/Property.js", () => ({
  default: {
    create: mockPropertyCreate,
    find: mockPropertyFind,
    findById: mockPropertyFindById,
    findByIdAndUpdate: mockPropertyFindByIdAndUpdate,
    findByIdAndDelete: jest.fn(),
  },
}));

const {
  createProperty,
  listProperties,
  updateProperty,
} = await import("../../services/propertyService.js");

describe("propertyService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createProperty injects geocoded coordinates when missing", async () => {
    mockGeocodeAddress.mockResolvedValue({ lat: 6.9, lng: 79.8 });
    mockPropertyCreate.mockResolvedValue({ _id: "p1" });

    await createProperty({
      title: "A",
      location: { address: "Colombo" },
      ecoFeatures: {},
    });

    expect(mockPropertyCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        location: expect.objectContaining({
          coordinates: { lat: 6.9, lng: 79.8 },
        }),
      })
    );
  });

  test("listProperties applies public visibility filter by default", async () => {
    const lean = jest.fn().mockResolvedValue([]);
    const populate = jest.fn().mockReturnValue({ lean });
    const limit = jest.fn().mockReturnValue({ populate, lean });
    const skip = jest.fn().mockReturnValue({ limit, populate, lean });
    const sort = jest.fn().mockReturnValue({ skip, limit, populate, lean });
    mockPropertyFind.mockReturnValue({ sort, skip, limit, populate, lean });

    await listProperties({});

    expect(mockPropertyFind).toHaveBeenCalledWith(
      expect.objectContaining({
        $and: expect.arrayContaining([
          { visibilityStatus: { $ne: "hidden" } },
        ]),
      })
    );
  });

  test("updateProperty returns null when target property is not found", async () => {
    mockPropertyFindById.mockResolvedValue(null);

    const result = await updateProperty("missing-id", { title: "Updated" });
    expect(result).toBeNull();
    expect(mockPropertyFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});
