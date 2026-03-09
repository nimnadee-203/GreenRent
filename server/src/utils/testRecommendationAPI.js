import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "http://localhost:5000/api";
const JWT_SECRET = process.env.JWT_SECRET || "secret#text";

// Generate a test token for a renter
const testToken = jwt.sign(
    {
        id: "6996fb36aafadbc113f6139d",
        email: "renter@test.com",
        role: "user", // Consistently use 'user' role for renters as per userModel
        name: "Test Renter",
    },
    JWT_SECRET,
    { expiresIn: "1h" }
);

// Generate a test token for a landlord
const landlordToken = jwt.sign(
    {
        id: "6996fb36aafadbc113f6139d",
        email: "landlord@test.com",
        role: "landlord",
        name: "Test Landlord",
    },
    JWT_SECRET,
    { expiresIn: "1h" }
);

async function runTests() {
    console.log("🚀 Starting Recommendation API Tests...");

    try {
        // 0. Create a Property
        console.log("\n0️⃣ Creating test property...");
        const propertyData = {
            title: "Eco Studio NYC",
            description: "A very nice eco-friendly studio.",
            location: {
                address: "123 Green St, New York, NY",
                coordinates: { lat: 40.7128, lng: -74.0060 }
            },
            price: 2000,
            propertyType: "apartment",
            ecoFeatures: {
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
                goodVentilationSunlight: true
            }
        };

        try {
            await axios.post(`${API_URL}/properties`, propertyData, {
                headers: { Authorization: `Bearer ${landlordToken}` }
            });
            console.log("✅ Test property created");
        } catch (e) {
            console.log("ℹ️ Property creation skipped (API disabled), using existing data.");
        }

        // 1. Update Preferences
        console.log("\n1️⃣ Updating user preferences...");
        const prefData = {
            location: "New York",
            budgetMin: 500,
            budgetMax: 3000,
            ecoPriority: "high",
            propertyType: "apartment"
        };

        const updateRes = await axios.put(`${API_URL}/recommendations/preferences`, prefData, {
            headers: { Authorization: `Bearer ${testToken}` }
        });
        console.log("✅ Preferences updated successfully");

        // 2. Get Recommendations
        console.log("\n2️⃣ Fetching recommendations...");
        const recRes = await axios.get(`${API_URL}/recommendations`, {
            headers: { Authorization: `Bearer ${testToken}` }
        });

        if (recRes.data.success) {
            console.log(`✅ Received ${recRes.data.recommendations.length} recommendations`);
            if (recRes.data.recommendations.length > 0) {
                console.log("🔝 Top recommendation smartScore:", recRes.data.recommendations[0].smartScore);
            }
        } else {
            console.log("❌ Failed to fetch recommendations:", recRes.data.message);
        }

        // 3. Reset Preferences
        console.log("\n3️⃣ Resetting preferences...");
        const resetRes = await axios.delete(`${API_URL}/recommendations/preferences`, {
            headers: { Authorization: `Bearer ${testToken}` }
        });
        console.log("✅ Preferences reset to default:", resetRes.data.preferences.ecoPriority);

    } catch (error) {
        if (error.response) {
            console.error("❌ Test failed with status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("❌ Test failed:", error.message);
            console.log("Note: Make sure the server is running on http://localhost:5000");
        }
    }
}

runTests();
