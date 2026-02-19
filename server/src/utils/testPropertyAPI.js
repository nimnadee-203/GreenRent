import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "http://localhost:5000/api";
const LANDLORD_TOKEN = process.env.TEST_LANDLORD_TOKEN; // Set this in your .env or replace manually
const RENTER_TOKEN = process.env.TEST_RENTER_TOKEN;

async function runTests() {
    console.log("🚀 Starting Property API Verification Tests...");

    if (!LANDLORD_TOKEN) {
        console.error("❌ TEST_LANDLORD_TOKEN not found in .env. Please run 'npm run generate-tokens' first or set it manually.");
        return;
    }

    let createdPropertyId;

    try {
        // 1. Create a Property (Protected - Landlord)
        console.log("\n1️⃣ Testing Property Creation...");
        const propertyData = {
            title: "Eco-Friendly Studio in Central Park",
            description: "A beautiful, sustainable studio with solar panels and energy-efficient appliances.",
            location: {
                address: "123 Green St, New York, NY",
                coordinates: { lat: 40.785091, lng: -73.968285 }
            },
            price: 2500,
            propertyType: "studio",
            ecoFeatures: {
                energyRating: "A",
                solarPanels: true,
                ledLighting: true,
                efficientAc: true,
                waterSavingTaps: true,
                rainwaterHarvesting: false,
                waterMeter: true,
                recyclingAvailable: true,
                compostAvailable: true,
                transportDistance: "< 1 km",
                evCharging: true,
                goodVentilationSunlight: true
            },
            images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
        };

        const createRes = await axios.post(`${API_URL}/properties`, propertyData, {
            headers: { Authorization: `Bearer ${LANDLORD_TOKEN}` }
        });

        console.log("✅ Property created successfully:", createRes.data.property._id);
        createdPropertyId = createRes.data.property._id;
        console.log("🌿 EcoRating ID:", createRes.data.property.ecoRatingId);

        // 2. Retrieve All Properties (Public)
        console.log("\n2️⃣ Testing Property Listing (Public)...");
        const listRes = await axios.get(`${API_URL}/properties`);
        console.log(`✅ Found ${listRes.data.properties.length} available properties.`);

        // 3. Retrieve Single Property (Public)
        console.log("\n3️⃣ Testing Single Property Retrieval (Public)...");
        const getRes = await axios.get(`${API_URL}/properties/${createdPropertyId}`);
        console.log("✅ Fetched property details for:", getRes.data.property.title);
        if (getRes.data.property.ecoRatingId) {
            console.log("✅ EcoRating data populated:", getRes.data.property.ecoRatingId.totalScore);
        }

        // 4. Update Property (Protected - Owner)
        console.log("\n4️⃣ Testing Property Update (Owner)...");
        const updateData = {
            price: 2400,
            ecoFeatures: {
                rainwaterHarvesting: true // Changed from false
            }
        };

        const updateRes = await axios.put(`${API_URL}/properties/${createdPropertyId}`, updateData, {
            headers: { Authorization: `Bearer ${LANDLORD_TOKEN}` }
        });
        console.log("✅ Property updated successfully. New Price:", updateRes.data.property.price);

        // 5. Try Updating with different user (Protected - Failure expected)
        if (RENTER_TOKEN) {
            console.log("\n5️⃣ Testing Property Update (Non-owner - Should Fail)...");
            try {
                await axios.put(`${API_URL}/properties/${createdPropertyId}`, { price: 1000 }, {
                    headers: { Authorization: `Bearer ${RENTER_TOKEN}` }
                });
                console.log("❌ Error: Property update should have failed for non-owner.");
            } catch (err) {
                console.log("✅ Properly denied access to unauthorized user:", err.response.status);
            }
        }

        // 6. Delete/Archive Property (Protected - Owner)
        console.log("\n6️⃣ Testing Property Archiving...");
        const archiveRes = await axios.delete(`${API_URL}/properties/${createdPropertyId}`, {
            headers: { Authorization: `Bearer ${LANDLORD_TOKEN}` }
        });
        console.log("✅ Property archived successfully.");

        // 7. Verify hard delete
        console.log("\n7️⃣ Testing Permanent Property Deletion...");
        const deleteRes = await axios.delete(`${API_URL}/properties/${createdPropertyId}?permanent=true`, {
            headers: { Authorization: `Bearer ${LANDLORD_TOKEN}` }
        });
        console.log("✅ Property deleted permanently.");

    } catch (error) {
        console.error("❌ Test failed:", error.response ? error.response.data : error.message);
    }
}

runTests();
