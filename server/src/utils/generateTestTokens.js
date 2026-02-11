import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Generate test JWT tokens for different user roles
 * Use these tokens in Postman/API testing
 */

// Landlord token
const landlordToken = jwt.sign(
  {
    id: "landlord-001",
    email: "landlord@greenrent.com",
    role: "landlord",
    name: "John Landlord",
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

// Renter token
const renterToken = jwt.sign(
  {
    id: "renter-001",
    email: "renter@greenrent.com",
    role: "renter",
    name: "Jane Renter",
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

// Admin token
const adminToken = jwt.sign(
  {
    id: "admin-001",
    email: "admin@greenrent.com",
    role: "admin",
    name: "Admin User",
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

// Another renter for testing multiple reviews
const renterToken2 = jwt.sign(
  {
    id: "renter-002",
    email: "renter2@greenrent.com",
    role: "renter",
    name: "Bob Renter",
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

console.log("=".repeat(80));
console.log("TEST TOKENS FOR GREENRENT API");
console.log("=".repeat(80));
console.log("\n📋 Copy these tokens and use them in your API requests");
console.log("   Add to Authorization header as: Bearer <token>\n");

console.log("🏠 LANDLORD TOKEN:");
console.log("-".repeat(80));
console.log(landlordToken);
console.log("\nUser Info: { id: 'landlord-001', role: 'landlord', name: 'John Landlord' }");
console.log("Can: Create/update eco-ratings");
console.log("Cannot: Create renter reviews\n");

console.log("🏘️  RENTER TOKEN #1:");
console.log("-".repeat(80));
console.log(renterToken);
console.log("\nUser Info: { id: 'renter-001', role: 'renter', name: 'Jane Renter' }");
console.log("Can: Create/update reviews");
console.log("Cannot: Create eco-ratings\n");

console.log("🏘️  RENTER TOKEN #2:");
console.log("-".repeat(80));
console.log(renterToken2);
console.log("\nUser Info: { id: 'renter-002', role: 'renter', name: 'Bob Renter' }");
console.log("Can: Create/update reviews");
console.log("Cannot: Create eco-ratings\n");

console.log("👤 ADMIN TOKEN:");
console.log("-".repeat(80));
console.log(adminToken);
console.log("\nUser Info: { id: 'admin-001', role: 'admin', name: 'Admin User' }");
console.log("Can: Everything (approve reviews, delete content, create ratings)\n");

console.log("=".repeat(80));
console.log("\n💡 QUICK START:");
console.log("1. Copy the token you need");
console.log("2. In Postman/Thunder Client, add header:");
console.log("   Authorization: Bearer <paste-token-here>");
console.log("3. Make your request!");
console.log("\n=".repeat(80));

// Export for programmatic use
export { landlordToken, renterToken, renterToken2, adminToken };
