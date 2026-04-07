# GreenRent Backend Service

The GreenRent backend is a robust RESTful API built with Node.js, Express, and MongoDB. It powers property management, sustainability scoring, and community reviews for the GreenRent platform.

## 🚀 Key Modules

### 🏠 Property Management
- Full CRUD operations for property listings.
- **OSM Geocoding**: Automatically converts addresses to coordinates using the OpenStreetMap Nominatim service.
- **Search Engine**: Text-based search across titles, descriptions, and addresses.

### 🌱 Eco Sustainability Engine
- **Scoring Logic**: Calculates a 0-100 sustainability score based on energy, water, waste, and transit criteria.
- **Air Quality Integration**: Fetches real-time AQI data from Open-Meteo (No API key required) to provide live environmental context.
- **Hybrid Comparisons**: Aggregates landlord data and renter feedback for a balanced "Trust Score".

### 💬 Community & Reviews
- Independent review system for tenants.
- Status-based moderation (Pending/Approved/Rejected).
- Statistics aggregation (Average scores, recommendation rates).

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Database & tool configurations
│   ├── controller/      # Auth and User handlers
│   ├── controllers/     # Eco-rating and Property handlers
│   ├── middleware/      # Auth (JWT), RBAC, and validation
│   ├── models/          # Data schemas (Property, EcoRating, RenterReview, User)
│   ├── routes/          # API endpoint definitions
│   ├── services/        # Business logic, OSM & Air Quality integrations
│   └── validators/      # Input schema validation
├── docs/                # Comprehensive system documentation
└── package.json         # Scripts and dependencies
```

## 🔐 API Reference (Summary)

### Properties
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/properties` | Public | List & search properties |
| POST | `/api/properties` | Landlord | Create new listing (Auto-geocodes) |
| PUT | `/api/properties/:id` | Owner | Update listing details |

### Eco-Ratings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/eco-ratings` | Landlord | Submit sustainability data |
| GET | `/api/eco-ratings` | Public | List ratings |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/renter-reviews` | Renter | Submit a lived-experience review |
| PATCH | `/api/renter-reviews/:id/status` | Admin | Moderate reviews |

## 🛠️ Setup & Installation

1. **Install Dependencies**: `npm install`
2. **Environment**: Copy `.env.example` to `.env` and configure your `MONGODB_URI` and `JWT_SECRET`.
3. **Seed/Tokens**: Run `npm run generate-tokens` to create test credentials for different roles.
4. **Run**: `npm run dev` for development with auto-reload.

## 🧪 Documentation & Testing
- **[HYBRID_SYSTEM.md](docs/HYBRID_SYSTEM.md)**: Full architecture and API deep-dive.
- **[API_EXAMPLES.md](docs/API_EXAMPLES.md)**: Ready-to-use curling examples for all roles.
- **[REQUIREMENTS_CHECKLIST.md](docs/REQUIREMENTS_CHECKLIST.md)**: Mapping of features to assignment requirements.

---
**GreenRent Backend** - Powering the future of sustainable housing.
