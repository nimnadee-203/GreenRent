import axios from "axios";

const OPEN_METEO_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

/**
 * Fetch air quality data from Open-Meteo API (100% Free - No API Key Required)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Air quality data including European AQI
 */
export const fetchAirQuality = async (lat, lon) => {
  try {
    const response = await axios.get(OPEN_METEO_API_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: "european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
      },
      timeout: 5000, // 5 second timeout
    });

    const airQualityData = response.data;

    if (!airQualityData || !airQualityData.current) {
      console.warn("Invalid air quality data received");
      return null;
    }

    return airQualityData;
  } catch (error) {
    console.error("Error fetching air quality data:", error.message);
    return null; // Don't fail the entire rating if API is down
  }
};

/**
 * Convert European AQI (0-125+ scale) to 0-10 score
 * Based on European Air Quality Index standards:
 * 0-20 (Good) = 10
 * 20-40 (Fair) = 8
 * 40-60 (Moderate) = 6
 * 60-80 (Poor) = 4
 * 80-100 (Very Poor) = 2
 * 100+ (Extremely Poor) = 0
 * @param {number} europeanAqi - European Air Quality Index (0-125+)
 * @returns {number} Score between 0-10
 */
export const convertAQItoScore = (europeanAqi) => {
  if (europeanAqi === null || europeanAqi === undefined) {
    return 5; // Default to moderate if no data
  }

  if (europeanAqi <= 20) return 10;      // Good
  if (europeanAqi <= 40) return 8;       // Fair
  if (europeanAqi <= 60) return 6;       // Moderate
  if (europeanAqi <= 80) return 4;       // Poor
  if (europeanAqi <= 100) return 2;      // Very Poor
  return 0;                               // Extremely Poor (100+)
};

/**
 * Get air quality score and full data for given coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{score: number, data: object}>} Air quality score and raw data
 */
export const getAirQualityScore = async (lat, lon) => {
  const airQualityData = await fetchAirQuality(lat, lon);

  if (!airQualityData) {
    return { score: null, data: null };
  }

  const europeanAqi = airQualityData.current.european_aqi;
  const score = convertAQItoScore(europeanAqi);

  return {
    score,
    data: {
      europeanAqi,
      pm10: airQualityData.current.pm10,
      pm2_5: airQualityData.current.pm2_5,
      carbonMonoxide: airQualityData.current.carbon_monoxide,
      nitrogenDioxide: airQualityData.current.nitrogen_dioxide,
      sulphurDioxide: airQualityData.current.sulphur_dioxide,
      ozone: airQualityData.current.ozone,
      timestamp: airQualityData.current.time,
      coordinates: { lat, lon },
      source: "Open-Meteo Air Quality API",
    },
  };
};
