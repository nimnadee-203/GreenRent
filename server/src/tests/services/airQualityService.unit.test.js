import { jest } from "@jest/globals";

const mockAxiosGet = jest.fn();

jest.unstable_mockModule("axios", () => ({
  default: {
    get: mockAxiosGet,
  },
}));

const {
  fetchAirQuality,
  convertAQItoScore,
  getAirQualityScore,
} = await import("../../services/airQualityService.js");

describe("airQualityService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("convertAQItoScore maps expected boundaries", () => {
    expect(convertAQItoScore(10)).toBe(10);
    expect(convertAQItoScore(40)).toBe(8);
    expect(convertAQItoScore(60)).toBe(6);
    expect(convertAQItoScore(80)).toBe(4);
    expect(convertAQItoScore(100)).toBe(2);
    expect(convertAQItoScore(130)).toBe(0);
    expect(convertAQItoScore(null)).toBe(5);
  });

  test("fetchAirQuality returns null for invalid payload", async () => {
    mockAxiosGet.mockResolvedValue({ data: {} });

    const result = await fetchAirQuality(6.9, 79.8);
    expect(result).toBeNull();
  });

  test("getAirQualityScore returns normalized score and metadata", async () => {
    mockAxiosGet.mockResolvedValue({
      data: {
        current: {
          european_aqi: 35,
          pm10: 11,
          pm2_5: 6,
          carbon_monoxide: 1,
          nitrogen_dioxide: 2,
          sulphur_dioxide: 3,
          ozone: 4,
          time: "2026-04-08T09:00",
        },
      },
    });

    const result = await getAirQualityScore(6.9271, 79.8612);
    expect(result.score).toBe(8);
    expect(result.data.europeanAqi).toBe(35);
    expect(result.data.coordinates).toEqual({ lat: 6.9271, lon: 79.8612 });
  });
});
