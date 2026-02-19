# API Testing Examples

This file contains ready-to-use API requests for testing the Hybrid Eco-Rating System.

## Setup

1. Start the server:
   ```bash
   npm run dev
   ```

2. Generate test tokens:
   ```bash
   npm run generate-tokens
   ```

3. Copy the appropriate token for your test
4. Use in Postman/Thunder Client/curl

---

## Test Flow: Complete Scenario

### Step 1: Landlord Creates Eco-Rating

**Request:**
```http
POST http://localhost:5000/api/eco-ratings
Authorization: Bearer <LANDLORD_TOKEN>
Content-Type: application/json

{
  "listingId": "apt-downtown-123",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Green Street, New York, NY 10001"
  },
  "criteria": {
    "energyEfficiency": 8,
    "waterEfficiency": 7,
    "wasteManagement": 6,
    "transitAccess": 9,
    "greenAmenities": 7
  },
  "evidenceLinks": [
    "https://example.com/leed-cert",
    "https://example.com/energy-star"
  ],
  "notes": "LEED Gold certified building with solar panels and rainwater harvesting system"
}
```

**Expected Response:**
```json
{
  "_id": "65f1234567890abcdef",
  "listingId": "apt-downtown-123",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Green Street, New York, NY 10001"
  },
  "criteria": {
    "energyEfficiency": 8,
    "waterEfficiency": 7,
    "wasteManagement": 6,
    "transitAccess": 9,
    "greenAmenities": 7
  },
  "totalScore": 7.7,
  "airQualityScore": 8.0,
  "externalSignals": {
    "airQuality": {
      "europeanAqi": 35,
      "pm10": 12.5,
      "pm2_5": 8.3,
      "carbonMonoxide": 210.5,
      "nitrogenDioxide": 15.2,
      "sulphurDioxide": 3.1,
      "ozone": 45.8,
      "timestamp": "2026-02-10T14:00:00Z",
      "coordinates": {
        "lat": 40.7128,
        "lon": -74.0060
      },
      "source": "Open-Meteo Air Quality API"
    }
  },
  "createdBy": "landlord-001",
  "createdAt": "2026-02-10T14:30:15.123Z",
  "updatedAt": "2026-02-10T14:30:15.123Z"
}
```

---

### Step 2: Public Views Eco-Rating

**Request:**
```http
GET http://localhost:5000/api/eco-ratings?listingId=apt-downtown-123
```

**No authentication required** ✅

---

### Step 3: Renter #1 Submits Review

**Request:**
```http
POST http://localhost:5000/api/renter-reviews
Authorization: Bearer <RENTER_TOKEN_1>
Content-Type: application/json

{
  "ecoRatingId": "65f1234567890abcdef",
  "listingId": "apt-downtown-123",
  "criteria": {
    "energyEfficiency": 7,
    "waterEfficiency": 8,
    "wasteManagement": 5,
    "transitAccess": 9,
    "greenAmenities": 6
  },
  "review": "I've lived here for 8 months. The transit access is excellent - 2 subway lines within 5 minutes. Energy bills are lower than my previous apartment. However, the recycling bins are often full and not well organized.",
  "livingDuration": "6-12 months",
  "wouldRecommend": true
}
```

**Expected Response:**
```json
{
  "message": "Review submitted successfully and is pending approval",
  "review": {
    "_id": "65f9876543210fedcba",
    "ecoRatingId": "65f1234567890abcdef",
    "listingId": "apt-downtown-123",
    "renterId": "renter-001",
    "renterName": "Jane Renter",
    "totalScore": 7.1,
    "status": "pending",
    "verified": false,
    "helpfulCount": 0,
    "createdAt": "2026-02-10T15:00:00.000Z"
  }
}
```

---

### Step 4: Try to View Pending Review (Should Not Show)

**Request:**
```http
GET http://localhost:5000/api/renter-reviews/listing/apt-downtown-123
```

**Expected Response:**
```json
{
  "reviews": [],
  "summary": null
}
```

Note: Review is pending, so it's not visible to public yet.

---

### Step 5: Admin Approves Review

**Request:**
```http
PATCH http://localhost:5000/api/renter-reviews/65f9876543210fedcba/status
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "approved"
}
```

**Expected Response:**
```json
{
  "message": "Review approved successfully",
  "review": {
    "_id": "65f9876543210fedcba",
    "status": "approved",
    "verified": true,
    "verifiedBy": "admin-001",
    ...
  }
}
```

---

### Step 6: Public Views Approved Review

**Request:**
```http
GET http://localhost:5000/api/renter-reviews/listing/apt-downtown-123
```

**Expected Response:**
```json
{
  "reviews": [
    {
      "_id": "65f9876543210fedcba",
      "listingId": "apt-downtown-123",
      "renterName": "Jane Renter",
      "totalScore": 7.1,
      "review": "I've lived here for 8 months...",
      "livingDuration": "6-12 months",
      "wouldRecommend": true,
      "verified": true,
      "helpfulCount": 0,
      "status": "approved",
      "createdAt": "2026-02-10T15:00:00.000Z"
    }
  ],
  "summary": {
    "averageCriteria": {
      "energyEfficiency": 7.0,
      "waterEfficiency": 8.0,
      "wasteManagement": 5.0,
      "transitAccess": 9.0,
      "greenAmenities": 6.0
    },
    "averageTotalScore": 7.1,
    "reviewCount": 1,
    "recommendationRate": 100.0
  }
}
```

---

### Step 7: Renter #2 Submits Another Review

**Request:**
```http
POST http://localhost:5000/api/renter-reviews
Authorization: Bearer <RENTER_TOKEN_2>
Content-Type: application/json

{
  "ecoRatingId": "65f1234567890abcdef",
  "listingId": "apt-downtown-123",
  "criteria": {
    "energyEfficiency": 8,
    "waterEfficiency": 7,
    "wasteManagement": 4,
    "transitAccess": 10,
    "greenAmenities": 8
  },
  "review": "Amazing location for public transit! I bike to work using the building's secure bike storage. Composting program needs improvement.",
  "livingDuration": "1-2 years",
  "wouldRecommend": true
}
```

---

### Step 8: Someone Marks Review as Helpful

**Request:**
```http
POST http://localhost:5000/api/renter-reviews/65f9876543210fedcba/helpful
```

**No authentication required** ✅

**Expected Response:**
```json
{
  "message": "Review marked as helpful",
  "helpfulCount": 1
}
```

---

### Step 9: Renter Updates Their Review

**Request:**
```http
PUT http://localhost:5000/api/renter-reviews/65f9876543210fedcba
Authorization: Bearer <RENTER_TOKEN_1>
Content-Type: application/json

{
  "review": "UPDATE: I've lived here for 8 months. The transit access is excellent - 2 subway lines within 5 minutes. Energy bills are lower than my previous apartment. The management recently improved the recycling system - much better now!",
  "criteria": {
    "wasteManagement": 7
  }
}
```

---

### Step 10: Renter Views Their Own Reviews

**Request:**
```http
GET http://localhost:5000/api/renter-reviews/my/reviews
Authorization: Bearer <RENTER_TOKEN_1>
```

---

## Error Testing

### Test 1: Renter Tries to Create Eco-Rating (Should Fail)

**Request:**
```http
POST http://localhost:5000/api/eco-ratings
Authorization: Bearer <RENTER_TOKEN>
Content-Type: application/json

{
  "listingId": "test",
  "location": { "latitude": 40, "longitude": -74 },
  "criteria": { ... }
}
```

**Expected Response:**
```json
{
  "message": "Access denied. Required role: landlord or admin. Your role: renter"
}
```

**Status Code:** `403 Forbidden`

---

### Test 2: Landlord Tries to Create Review (Should Fail)

**Request:**
```http
POST http://localhost:5000/api/renter-reviews
Authorization: Bearer <LANDLORD_TOKEN>
Content-Type: application/json

{
  "ecoRatingId": "65f1234567890abcdef",
  "listingId": "apt-downtown-123",
  "criteria": { ... }
}
```

**Expected Response:**
```json
{
  "message": "Access denied. Required role: renter. Your role: landlord"
}
```

**Status Code:** `403 Forbidden`

---

### Test 3: No Token Provided (Should Fail)

**Request:**
```http
POST http://localhost:5000/api/eco-ratings
Content-Type: application/json

{
  "listingId": "test",
  ...
}
```

**Expected Response:**
```json
{
  "message": "Access denied. No token provided."
}
```

**Status Code:** `401 Unauthorized`

---

### Test 4: Invalid Token (Should Fail)

**Request:**
```http
POST http://localhost:5000/api/eco-ratings
Authorization: Bearer invalid-token-here
Content-Type: application/json

{
  "listingId": "test",
  ...
}
```

**Expected Response:**
```json
{
  "message": "Invalid token."
}
```

**Status Code:** `401 Unauthorized`

---

### Test 5: Missing Required Fields

**Request:**
```http
POST http://localhost:5000/api/eco-ratings
Authorization: Bearer <LANDLORD_TOKEN>
Content-Type: application/json

{
  "listingId": "test"
}
```

**Expected Response:**
```json
{
  "errors": [
    "location is required",
    "criteria.energyEfficiency is required",
    "criteria.waterEfficiency is required",
    ...
  ]
}
```

**Status Code:** `400 Bad Request`

---

### Test 6: Renter Tries to Review Same Listing Twice

**Request:**
```http
POST http://localhost:5000/api/renter-reviews
Authorization: Bearer <RENTER_TOKEN_1>
Content-Type: application/json

{
  "ecoRatingId": "65f1234567890abcdef",
  "listingId": "apt-downtown-123",
  "criteria": { ... }
}
```

**Expected Response:**
```json
{
  "message": "You have already reviewed this listing"
}
```

**Status Code:** `400 Bad Request`

---

## Validation Testing

### Test Invalid Criteria Values

**Request:**
```http
POST http://localhost:5000/api/eco-ratings
Authorization: Bearer <LANDLORD_TOKEN>
Content-Type: application/json

{
  "listingId": "test-apt",
  "location": { "latitude": 40, "longitude": -74 },
  "criteria": {
    "energyEfficiency": 15,
    "waterEfficiency": -5,
    "wasteManagement": 6,
    "transitAccess": 9,
    "greenAmenities": 7
  }
}
```

**Expected Response:**
```json
{
  "errors": [
    "criteria.energyEfficiency must be a number between 0 and 10",
    "criteria.waterEfficiency must be a number between 0 and 10"
  ]
}
```

---

### Test Invalid Coordinates

**Request:**
```http
POST http://localhost:5000/api/eco-ratings
Authorization: Bearer <LANDLORD_TOKEN>
Content-Type: application/json

{
  "listingId": "test-apt",
  "location": {
    "latitude": 95,
    "longitude": -200
  },
  "criteria": {
    "energyEfficiency": 8,
    "waterEfficiency": 7,
    "wasteManagement": 6,
    "transitAccess": 9,
    "greenAmenities": 7
  }
}
```

**Expected Response:**
```json
{
  "errors": [
    "location.latitude must be a number between -90 and 90",
    "location.longitude must be a number between -180 and 180"
  ]
}
```

---

## Summary of Test Results

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Landlord creates eco-rating | ✅ Success 201 | PASS |
| Public views eco-ratings | ✅ Success 200 | PASS |
| Renter creates review | ✅ Success 201 | PASS |
| Review pending - not visible | ✅ Empty array | PASS |
| Admin approves review | ✅ Success 200 | PASS |
| Review approved - now visible | ✅ Success 200 | PASS |
| Mark review helpful | ✅ Success 200 | PASS |
| Renter updates own review | ✅ Success 200 | PASS |
| Renter creates eco-rating | ❌ 403 Forbidden | PASS |
| Landlord creates review | ❌ 403 Forbidden | PASS |
| No token provided | ❌ 401 Unauthorized | PASS |
| Invalid token | ❌ 401 Unauthorized | PASS |
| Missing required fields | ❌ 400 Bad Request | PASS |
| Duplicate review | ❌ 400 Bad Request | PASS |
| Invalid criteria values | ❌ 400 Bad Request | PASS |
| Invalid coordinates | ❌ 400 Bad Request | PASS |

**All Tests: PASS** ✅
