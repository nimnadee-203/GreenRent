# GreenRent - Sustainable Apartment Finder

GreenRent is a modern web application designed to help users find environmentally sustainable apartments. It combines official building data, real-time environmental metrics, and community feedback to provide a transparent view of a property's ecological footprint.

## 🌿 Key Features

### 1. Property Management & Search
- Comprehensive listing system for apartments, houses, and studios.
- **Automated Geocoding**: Integrated with **OpenStreetMap (OSM)** to automatically determine precise coordinates from simple addresses.
- Advanced filtering by price, type, and sustainability features.

### 2. Eco Sustainability Rating Engine
- **Weighted Scoring**: Multi-category evaluation including energy efficiency, water conservation, waste management, and transit accessibility.
- **Real-Time Air Quality**: Automatic integration with the **Open-Meteo API** (100% free) to fetch live AQI data and incorporate it into the property's score.
- **Hybrid Validation**: Combines official landlord ratings with independent reviews from actual tenants.

### 3. Community-Driven Insights
- **Verified Renter Reviews**: Lived-experience feedback on sustainability claims.
- **Moderation Workflow**: Admin-controlled review approval to ensure high-quality, authentic community data.

## 🏗️ Project Structure

```
GreenRent/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI elements
│   │   └── pages/       # Page-level components
├── server/              # Node.js Express backend
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API endpoints
│   │   └── services/    # Business logic & 3rd-party integrations
│   └── docs/            # Detailed API and system documentation
└── README.md            # Project overview
```

## 🚀 Getting Started

### Backend Setup
1. Navigate to the `server/` directory.
2. Install dependencies: `npm install`.
3. Set up your `.env` file (refer to `.env.example`).
4. Start the server: `npm run dev`.

### Frontend Setup
1. Navigate to the `client/` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## 📚 Documentation
Detailed documentation is available in the `server/docs/` directory:
- [System Architecture & Hybrid View](server/docs/HYBRID_SYSTEM.md)
- [Property API Reference](server/docs/Property API.md)
- [Requirements Checklist](server/docs/REQUIREMENTS_CHECKLIST.md)
- [API Usage Examples](server/docs/API_EXAMPLES.md)

---
**GreenRent** - Making sustainable living accessible 🌍
