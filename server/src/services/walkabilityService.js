import axios from "axios";

/**
 * Fetch nearby amenities and transit from OpenStreetMap (Overpass API)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in meters (default 1000m)
 * @returns {Promise<object>} Mobility data and calculated score
 */
export const getWalkabilityScore = async (lat, lon, radius = 1000) => {
    try {
        // Overpass QL query: Find parks, transit, and shops
        const query = `
      [out:json][timeout:25];
      (
        node["highway"="bus_stop"](around:${radius},${lat},${lon});
        node["railway"="station"](around:${radius},${lat},${lon});
        node["amenity"~"market|supermarket|grocery|pharmacy|school"](around:${radius},${lat},${lon});
        node["leisure"="park"](around:${radius},${lat},${lon});
        way["leisure"="park"](around:${radius},${lat},${lon});
      );
      out count;
    `;

        const response = await axios.post("https://overpass-api.de/api/interpreter", query, {
            headers: { "Content-Type": "text/plain" },
            timeout: 10000
        });

        const counts = response.data.elements[0].tags;

        // Extract individual counts (Overpass returns total nodes/ways/relations)
        const totalAmenities = parseInt(response.data.elements[0].count) || 0;

        // Logic for 0-10 Score
        let score = 0;
        if (totalAmenities >= 15) score = 10;
        else if (totalAmenities >= 10) score = 8;
        else if (totalAmenities >= 5) score = 6;
        else if (totalAmenities >= 2) score = 4;
        else if (totalAmenities >= 1) score = 2;

        let label = "Low";
        if (score >= 9) label = "Excellent";
        else if (score >= 7) label = "Very Good";
        else if (score >= 5) label = "Good";
        else if (score >= 3) label = "Moderate";

        return {
            score,
            label,
            amenityCount: totalAmenities,
            radius: `${radius}m`,
            source: "OpenStreetMap"
        };
    } catch (error) {
        console.error("Walkability API error:", error.message);
        return {
            score: 5, // Neutral fallback
            label: "Moderate",
            amenityCount: null,
            error: "Service temporarily unavailable"
        };
    }
};
