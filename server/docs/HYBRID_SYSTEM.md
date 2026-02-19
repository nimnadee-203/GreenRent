# Hybrid Eco-Rating System Documentation

## Overview
The GreenRent Eco-Rating system uses a **hybrid approach** combining landlord-provided data with real renter experiences:

### System Architecture

1. **Landlord Ratings** (Official Score)
   - Created by property owners/managers when listing apartments
   - Based on building specs, certifications, and amenities
   - Includes third-party air quality data
   - **Role Required**: `landlord` or `admin`

2. **Renter Reviews** (Community Score)
   - Submitted by actual tenants based on lived experience
   - Goes through approval process (pending → approved/rejected)
   - Provides real-world validation of landlord claims
   - **Role Required**: `renter`

3. **Combined View**
   - Displays both landlord rating and average renter score
   - Shows recommendation rate and review count
   - Includes real-time air quality data (100% free API, no key needed)
   - Builds trust through transparency

---

## User Roles

### 1. **Landlord**
- Create eco-ratings when listing properties
- Update their own ratings
- Cannot create renter reviews

### 2. **Renter**
- View all eco-ratings (public)
- Submit reviews for properties they've lived in
- Update/delete their own reviews
- Cannot create eco-ratings

### 3. **Admin**
- Full access to all operations
- Approve/reject renter reviews
- Moderate content
- Delete inappropriate content

---

## API Endpoints

### Eco-Ratings (Landlord-Created)

#### Create Eco-Rating (Protected: Landlord/Admin)
```http
POST /api/eco-ratings
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "apt-123",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Green St, New York, NY"
  },
  "criteria": {
    "energyEfficiency": 8,
    "waterEfficiency": 7,
    "wasteManagement": 6,
    "transitAccess": 9,
    "greenAmenities": 7
  },
  "evidenceLinks": [
    "https://energy-cert.example.com/apt-123"
  ],
  "notes": "LEED Gold certified building"
}
```

#### Get All Eco-Ratings (Public)
```http
GET /api/eco-ratings?listingId=apt-123
```

#### Get Single Eco-Rating (Public)
```http
GET /api/eco-ratings/:id
```

#### Update Eco-Rating (Protected: Landlord/Admin)
```http
PUT /api/eco-ratings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "criteria": {
    "energyEfficiency": 9
  }
}
```

#### Delete Eco-Rating (Protected: Admin Only)
```http
DELETE /api/eco-ratings/:id
Authorization: Bearer <token>
```

---

### Renter Reviews

#### Create Review (Protected: Renter)
```http
POST /api/renter-reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "ecoRatingId": "65f1234567890abcdef",
  "listingId": "apt-123",
  "criteria": {
    "energyEfficiency": 7,
    "waterEfficiency": 8,
    "wasteManagement": 5,
    "transitAccess": 9,
    "greenAmenities": 6
  },
  "review": "Great public transit access, but recycling could be better organized.",
  "livingDuration": "6-12 months",
  "wouldRecommend": true
}
```

**Response:**
```json
{
  "message": "Review submitted successfully and is pending approval",
  "review": {
    "_id": "65f9876543210fedcba",
    "status": "pending",
    "totalScore": 7.1,
    ...
  }
}
```

#### Get Reviews for Listing (Public)
```http
GET /api/renter-reviews/listing/:listingId
```

**Response:**
```json
{
  "reviews": [...],
  "summary": {
    "averageCriteria": {
      "energyEfficiency": 7.5,
      "waterEfficiency": 8.0,
      "wasteManagement": 5.5,
      "transitAccess": 9.0,
      "greenAmenities": 6.5
    },
    "averageTotalScore": 7.3,
    "reviewCount": 12,
    "recommendationRate": 83.3
  }
}
```

#### Get My Reviews (Protected: Renter)
```http
GET /api/renter-reviews/my/reviews
Authorization: Bearer <token>
```

#### Update Review (Protected: Review Owner/Admin)
```http
PUT /api/renter-reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "review": "Updated: The building recently improved their waste management system!",
  "wouldRecommend": true
}
```

#### Delete Review (Protected: Review Owner/Admin)
```http
DELETE /api/renter-reviews/:id
Authorization: Bearer <token>
```

#### Approve/Reject Review (Protected: Admin)
```http
PATCH /api/renter-reviews/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"
}
```

#### Mark Review as Helpful (Public)
```http
POST /api/renter-reviews/:id/helpful
```

#### Get Average Scores for Listing (Public)
```http
GET /api/renter-reviews/listing/:listingId/averages
```

---

## Authentication

### JWT Token Format
All protected routes require a Bearer token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload
```json
{
  "id": "user-id-123",
  "email": "user@example.com",
  "role": "landlord" | "renter" | "admin",
  "name": "John Doe"
}
```

### Generating Tokens (Example)
```javascript
import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    id: "user-123",
    email: "landlord@example.com",
    role: "landlord",
    name: "Jane Smith"
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

---

## Data Models

### EcoRating (Landlord)
```javascript
{
  listingId: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  criteria: {
    energyEfficiency: Number (0-10),
    waterEfficiency: Number (0-10),
    wasteManagement: Number (0-10),
    transitAccess: Number (0-10),
    greenAmenities: Number (0-10)
  },
  totalScore: Number (calculated),
  airQualityScore: Number,
  evidenceLinks: [String],
  notes: String,
  externalSignals: Object,
  createdBy: String,
  renterReviewStats: {
    reviewCount: Number,
    averageScore: Number,
    recommendationRate: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### RenterReview
```javascript
{
  ecoRatingId: ObjectId (ref: EcoRating),
  listingId: String,
  renterId: String,
  renterName: String,
  criteria: {
    energyEfficiency: Number (0-10),
    waterEfficiency: Number (0-10),
    wasteManagement: Number (0-10),
    transitAccess: Number (0-10),
    greenAmenities: Number (0-10)
  },
  totalScore: Number (calculated),
  review: String (max 1000 chars),
  livingDuration: Enum,
  wouldRecommend: Boolean,
  verified: Boolean,
  verifiedBy: String,
  helpfulCount: Number,
  status: Enum ["pending", "approved", "rejected"],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Workflow Example

### 1. Landlord Creates Eco-Rating
```
Landlord (authenticated) → POST /api/eco-ratings
→ System fetches air quality data from OpenWeatherMap
→ Calculates total score (85% criteria + 15% air quality)
→ Stores rating with landlord ID
→ Status: Published (visible to all)
```

### 2. Renter Submits Review
```
Renter (authenticated) → POST /api/renter-reviews
→ System validates review data
→ Calculates renter's score
→ Status: Pending (not visible to public)
→ Admin receives notification
```

### 3. Admin Approves Review
```
Admin (authenticated) → PATCH /api/renter-reviews/:id/status
→ Sets status to "approved"
→ Marks as verified
→ Review becomes visible to public
```

### 4. Public Views Combined Data
```
Anyone → GET /api/eco-ratings/:id
→ Shows landlord rating

Anyone → GET /api/renter-reviews/listing/:listingId
→ Shows all approved renter reviews + averages
→ Displays: 
  - Official landlord score: 7.8
  - Average renter score: 7.3 (from 12 reviews)
  - 83% would recommend
```

---

## Security Features

✅ **Role-Based Access Control (RBAC)**
- Landlords can only create eco-ratings
- Renters can only create reviews
- Admins have full access

✅ **Protected Routes**
- JWT authentication required for write operations
- Token validation on every request

✅ **Data Validation**
- All inputs validated before processing
- Criteria scores must be 0-10
- Location coordinates validated

✅ **Duplicate Prevention**
- One review per renter per listing (unique index)
- Prevents review spam

✅ **Review Moderation**
- All reviews start as "pending"
- Admin approval required before public visibility
- Helps prevent fake/malicious reviews

---

## Benefits of Hybrid System

1. **Transparency**: Shows both official ratings and real experiences
2. **Trust**: Renters validate landlord claims
3. **Complete Picture**: Combines technical data with lived experience
4. **Quality Control**: Admin moderation prevents abuse
5. **Engagement**: Encourages community participation
6. **Accountability**: Landlords incentivized to maintain standards

---

## Testing

### Create Test Users
```javascript
// Landlord token
const landlordToken = jwt.sign(
  { id: "ll-001", role: "landlord", email: "landlord@test.com", name: "Test Landlord" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Renter token
const renterToken = jwt.sign(
  { id: "rn-001", role: "renter", email: "renter@test.com", name: "Test Renter" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Admin token
const adminToken = jwt.sign(
  { id: "ad-001", role: "admin", email: "admin@test.com", name: "Test Admin" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

### Test Scenarios

1. **Test Landlord Flow**
   - Create eco-rating with landlord token ✓
   - Try to create review with landlord token ✗ (403 Forbidden)

2. **Test Renter Flow**
   - Create review with renter token ✓
   - Try to create eco-rating with renter token ✗ (403 Forbidden)

3. **Test Admin Flow**
   - Approve/reject reviews ✓
   - Delete any content ✓

4. **Test Public Access**
   - View eco-ratings without token ✓
   - View approved reviews without token ✓
   - Try to create without token ✗ (401 Unauthorized)

---

## Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017

# Server Port
PORT=5000

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-key-here

# Note: Air quality data from Open-Meteo API (100% free, no API key needed)
```

---

## Summary

This hybrid system satisfies the **"Protected routes & role-based access"** requirement by implementing:

- ✅ JWT-based authentication
- ✅ Role-based authorization (landlord, renter, admin)
- ✅ Protected routes with middleware
- ✅ Public view access
- ✅ Permission validation
- ✅ Secure token handling

Combined with the existing features (CRUD, MongoDB, third-party API, validation), your Eco Sustainability Rating component now meets **ALL** assignment requirements!
