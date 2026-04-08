import { jest } from "@jest/globals";

const mockAxiosGet = jest.fn();

jest.unstable_mockModule("axios", () => ({
  default: {
    get: mockAxiosGet,
  },
}));

const { geocodeAddress } = await import("../../services/openStreetMapService.js");

describe("openStreetMapService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns null for invalid address input", async () => {
    const result = await geocodeAddress(123);
    expect(result).toBeNull();
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  test("returns parsed coordinates for a valid result", async () => {
    mockAxiosGet.mockResolvedValue({
      data: [
        {
          lat: "6.9271",
          lon: "79.8612",
          display_name: "Colombo, Sri Lanka",
        },
      ],
    });

    const result = await geocodeAddress("Colombo");
    expect(result).toEqual(
      expect.objectContaining({
        lat: 6.9271,
        lng: 79.8612,
        displayName: "Colombo, Sri Lanka",
      })
    );
  });

  test("returns null when API responds with invalid coordinates", async () => {
    mockAxiosGet.mockResolvedValue({
      data: [{ lat: "NaN", lon: "x", display_name: "Bad" }],
    });

    const result = await geocodeAddress("Bad place");
    expect(result).toBeNull();
  });
});
