import { getAirQualityScore } from "../services/airQualityService.js";

/**
 * Quick test script to verify Open-Meteo Air Quality API integration
 * Run: node utils/testAirQualityAPI.js
 */

console.log("🧪 Testing Open-Meteo Air Quality API Integration\n");
console.log("=".repeat(60));

// Test coordinates for major cities
const testLocations = [
  { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
];

async function testAirQuality() {
  for (const location of testLocations) {
    console.log(`\n📍 Testing: ${location.name}`);
    console.log(`   Coordinates: ${location.lat}, ${location.lon}`);
    
    try {
      const result = await getAirQualityScore(location.lat, location.lon);
      
      if (result.score !== null) {
        console.log(`   ✅ Success!`);
        console.log(`   Air Quality Score: ${result.score}/10`);
        console.log(`   European AQI: ${result.data.europeanAqi}`);
        console.log(`   PM2.5: ${result.data.pm2_5} μg/m³`);
        console.log(`   PM10: ${result.data.pm10} μg/m³`);
        console.log(`   Timestamp: ${result.data.timestamp}`);
      } else {
        console.log(`   ⚠️  No data available (API might be down)`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Test complete!");
  console.log("\n💡 Benefits of Open-Meteo:");
  console.log("   • 100% Free - No API key required");
  console.log("   • No rate limits");
  console.log("   • Global coverage");
  console.log("   • Fast response (~100-300ms)");
  console.log("   • No signup needed\n");
}

testAirQuality().catch(console.error);
