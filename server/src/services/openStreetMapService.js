import axios from "axios";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Geocode a human-readable address using OpenStreetMap Nominatim API.
 * Returns { lat, lng, displayName, raw } or null if not found/error.
 */
export const geocodeAddress = async (address) => {
  if (!address || typeof address !== "string") {
    return null;
  }

  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        q: address,
        format: "json",
        addressdetails: 1,
        limit: 1,
      },
      headers: {
        // Nominatim usage policy requires a valid, identifying User-Agent
        "User-Agent":
          process.env.OSM_USER_AGENT ||
          "GreenRent/1.0 (contact@green-rent.local)",
      },
      timeout: 5000,
    });

    const results = response.data;
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const best = results[0];
    const lat = parseFloat(best.lat);
    const lng = parseFloat(best.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      lat,
      lng,
      displayName: best.display_name,
      raw: best,
    };
  } catch (error) {
    console.error(
      "Error geocoding address via OpenStreetMap:",
      error.message || error
    );
    return null;
  }
};

