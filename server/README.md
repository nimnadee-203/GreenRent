# GreenRent Backend - Eco Sustainability Rating Engine

> A hybrid eco-rating system combining landlord-provided data with real renter experiences, powered by third-party air quality data (100% free, no API key required).

## 🌱 Overview

The Eco Sustainability Rating Engine is a key component of the GreenRent platform that helps renters find environmentally sustainable apartments through:

- **Official Eco-Ratings** created by landlords based on building features
- **Renter Reviews** submitted by actual tenants based on lived experience
- **Air Quality Data** fetched in real-time from Open-Meteo API (completely free!)
- **Hybrid Comparison** showing both official and community scores

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB running locally or remote connection
- **No API keys needed!** Open-Meteo is 100% free

### Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (see .env.example)
cp .env.example .env

# Edit .env and add your credentials
# - MONGODB_URI
# - JWT_SECRET
# Note: Air quality API needs no key!

# Start development server
npm run dev
```

Server will start on `http://localhost:5000`

### Generate Test Tokens

```bash
npm run generate-tokens
```

This creates JWT tokens for testing different user roles (landlord, renter, admin).

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── ecoRatingController.js   # Eco-rating endpoints
│   │   └── renterReviewController.js # Review endpoints
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication & authorization
│   ├── models/
│   │   ├── EcoRating.js             # Landlord eco-rating schema
│   │   └── RenterReview.js          # Renter review schema
│   ├── routes/
│   │   ├── ecoRatingRoutes.js       # Eco-rating routes
│   │   └── renterReviewRoutes.js    # Review routes
│   ├── services/
│   │   ├── ecoRatingService.js      # Eco-rating business logic
│   │   ├── renterReviewService.js   # Review business logic
│   │   └── airQualityService.js     # OpenWeatherMap API integration
│   ├── validators/
│   │   ├── ecoRatingValidators.js   # Eco-rating validation
│   │   └── renterReviewValidators.js # Review validation
│   └── utils/
│       └── generateTestTokens.js    # Test token generator
├── docs/
│   ├── REQUIREMENTS_CHECKLIST.md # Assignment requirements met
│   ├── HYBRID_SYSTEM.md          # System architecture & API docs
│   ├── THIRD_PARTY_API.md        # OpenWeatherMap integration
│   └── API_EXAMPLES.md           # Ready-to-use test cases
├── .env.example                  # Environment variables template
├── src/server.js                 # Entry point
└── package.json                  # Dependencies & scripts
```

## 🔐 User Roles

### Landlord
- Create eco-ratings when listing properties
- Update their own ratings
- **Cannot** create renter reviews

### Renter
- View all eco-ratings (public)
- Submit reviews for properties they've lived in
- Update/delete their own reviews
- **Cannot** create eco-ratings

### Admin
- Full access to all operations
- Approve/reject renter reviews
- Moderate content

## 🛠️ API Endpoints

### Eco-Ratings (Landlord-Created)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/eco-ratings` | ✅ | landlord, admin | Create eco-rating |
| GET | `/api/eco-ratings` | ❌ | public | List all eco-ratings |
| GET | `/api/eco-ratings/:id` | ❌ | public | Get single eco-rating |
| PUT | `/api/eco-ratings/:id` | ✅ | landlord, admin | Update eco-rating |
| DELETE | `/api/eco-ratings/:id` | ✅ | admin | Delete eco-rating |

### Renter Reviews

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/renter-reviews` | ✅ | renter | Create review |
| GET | `/api/renter-reviews/listing/:id` | ❌ | public | Get reviews for listing |
| GET | `/api/renter-reviews/my/reviews` | ✅ | renter | Get my reviews |
| GET | `/api/renter-reviews/:id` | ❌ | public | Get single review |
| PUT | `/api/renter-reviews/:id` | ✅ | renter, admin | Update review |
| DELETE | `/api/renter-reviews/:id` | ✅ | renter, admin | Delete review |
| PATCH | `/api/renter-reviews/:id/status` | ✅ | admin | Approve/reject review |
| POST | `/api/renter-reviews/:id/helpful` | ❌ | public | Mark review helpful |

## 📦 Key Features

### ✅ RESTful CRUD Operations
- Complete Create, Read, Update, Delete operations
- Standard HTTP methods and status codes
- Proper error responses

### ✅ Third-Party API Integration
- **Open-Meteo Air Quality API** (100% free, no API key required)
- Real-time air quality data by coordinates
- European AQI with 6 pollutant measurements
- Automatic score calculation
- 15% weight in sustainability rating
- Zero setup - works immediately

### ✅ MongoDB Integration
- Two collections: `ecoratings`, `renterreviews`
- Mongoose schemas with validation
- Indexes for performance
- Relationships between collections

### ✅ Protected Routes & RBAC
- JWT authentication
- Role-based authorization (landlord, renter, admin)
- Secure token handling
- Permission validation

### ✅ Validation & Error Handling
- Input validation for all requests
- Specific error messages
- Try-catch error handling
- Graceful API fallbacks

### ✅ Clean Architecture
- Layered architecture (routes → controllers → services → models)
- Separation of concerns
- Reusable components
- Best practices throughout

### ✅ Comprehensive Documentation
- Complete API documentation
- Request/response examples
- Testing guide
- Architecture overview

## 🧪 Testing

### 1. Generate Test Tokens
```bash
npm run generate-tokens
```

Copy the token for the role you want to test.

### 2. Test with curl

**Create Eco-Rating (Landlord):**
```bash
curl -X POST http://localhost:5000/api/eco-ratings \
  -H "Authorization: Bearer <LANDLORD_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "apt-123",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "New York, NY"
    },
    "criteria": {
      "energyEfficiency": 8,
      "waterEfficiency": 7,
      "wasteManagement": 6,
      "transitAccess": 9,
      "greenAmenities": 7
    }
  }'
```

**Create Renter Review:**
```bash
curl -X POST http://localhost:5000/api/renter-reviews \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "ecoRatingId": "<ECO_RATING_ID>",
    "listingId": "apt-123",
    "criteria": {
      "energyEfficiency": 7,
      "waterEfficiency": 8,
      "wasteManagement": 5,
      "transitAccess": 9,
      "greenAmenities": 6
    },
    "review": "Great location and energy efficient!",
    "livingDuration": "6-12 months",
    "wouldRecommend": true
  }'
```

### 3. View Public Data (No Auth)
```bash
# Get all eco-ratings
curl http://localhost:5000/api/eco-ratings

# Get reviews for a listing
curl http://localhost:5000/api/renter-reviews/listing/apt-123
```

See [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) for 16+ detailed test cases.

## 📚 Documentation

- **[REQUIREMENTS_CHECKLIST.md](docs/REQUIREMENTS_CHECKLIST.md)** - Complete requirements analysis
- **[HYBRID_SYSTEM.md](docs/HYBRID_SYSTEM.md)** - System architecture & API reference
- **[THIRD_PARTY_API.md](docs/THIRD_PARTY_API.md)** - OpenWeatherMap integration guide
- **[API_EXAMPLES.md](docs/API_EXAMPLES.md)** - Ready-to-use test cases

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017

# Server Port
PORT=5000

# JWT Secret (CHANGE THIS!)
JWAir quality from Open-Meteo API (100% free, no API key needed!)
# Get free key at: https://openweathermap.org/api
OPENWEATHER_API_KEY=your_api_key_here
```

## 📊 Data Models

### EcoRating (Landlord)
- **listingId**: String - Apartment listing ID
- **location**: Object - Coordinates & address
- **criteria**: Object - 5 sustainability scores (0-10)
- **totalScore**: Number - Weighted calculated score
- **airQualityScore**: Number - From OpenWeatherMap API
- **createdBy**: String - Landlord user ID
- **renterReviewStats**: Object - Average renter scores

### RenterReview
- **ecoRatingId**: ObjectId - Reference to eco-rating
- **listingId**: String - Apartment listing ID
- **renterId**: String - Renter user ID
- **criteria**: Object - 5 sustainability scores (0-10)
- **totalScore**: Number - Calculated score
- **review**: String - Written review (max 1000 chars)
- **livingDuration**: Enum - How long they lived there
- **wouldRecommend**: Boolean - Recommendation flag
- **status**: Enum - pending/approved/rejected
- **verified**: Boolean - Admin verified

## 🤝 Assignment Requirements

This component fulfills **ALL** assignment requirements:

- ✅ RESTful API with Express.js
- ✅ 4+ functional components
- ✅ Complete CRUD operations with proper HTTP methods/status codes
- ✅ Third-party API integration (Open-Meteo - 100% free, no key needed!)
- ✅ MongoDB database with 2 collections
- ✅ Protected routes with JWT authentication
- ✅ Role-based access control (3 roles)
- ✅ Input validation & error handling
- ✅ Clean architecture & best practices
- ✅ Comprehensive API documentation

See [docs/REQUIREMENTS_CHECKLIST.md](docs/REQUIREMENTS_CHECKLIST.md) for detailed evidence.

## 🛡️ Security

- JWT token authentication
- Role-based authorization
- Input validation & sanitization
- MongoDB injection prevention
- Secure password handling (for auth system)
- CORS configuration
- Error message sanitization

## 🎯 Benefits

### For Renters
- Transparent eco-ratings from multiple sources
- Real-world validation of landlord claims
- Community reviews from actual tenants
- Air quality data for health concerns

### For Landlords
- Showcase sustainability features
- Build trust through transparency
- Verified by third-party data
- Differentiate eco-friendly properties

### For The Platform
- Data-driven sustainability metrics
- Community engagement
- Quality control through moderation
- Credible environmental impact

## 📝 Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Generate test JWT tokens
npm run generate-tokens
```

## 🐛 Troubleshooting

**MongoDB connection failed:**
- Check MongoDB is running: `mongod --version`
- Verify MONGODB_URI in .env
- Check network/firewall settings

**JWT token invalid:**
- Generate new tokens: `npm run generate-tokens`
- Check JWT_SECRET matches in .env
- Token might be expired (7 day expiry)

**Air quality API not working:**
- Check coordinates are valid (-90/90, -180/180)
- Open-Meteo has no rate limits or API key requirements
- System works without API (graceful fallback)
- Test directly: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=40.7128&longitude=-74.0060&current=european_aqi`

## 📄 License

This project is part of the GreenRent platform for academic purposes.

## 👥 Contributors

- **Eco Sustainability Rating Engine Component** - Your Name

## 🔗 Related Components

This component integrates with other GreenRent components:
- Apartment Listings (provides listingId)
- User Authentication (provides user roles & JWT)
- Frontend Display (consumes API data)

---

**GreenRent** - Making sustainable living accessible 🌍
