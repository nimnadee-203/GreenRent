import React, { useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const MapDisplay = ({ properties = [], isLoading = false, error = '' }) => {
  const [geocodedProps, setGeocodedProps] = useState([]);

  // Geocode addresses and initialize map
  useEffect(() => {
    if (!properties.length) return;

    const geocodeAndMap = async () => {
      const geocoded = await Promise.all(
        properties.map(async (prop) => {
          // Try to use existing coordinates first
          if (prop.location?.coordinates?.lat && prop.location?.coordinates?.lng) {
            return {
              ...prop,
              lat: prop.location.coordinates.lat,
              lng: prop.location.coordinates.lng,
            };
          }

          // Try to geocode the address
          try {
            const response = await fetch('https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
              q: prop.location?.address || 'Sri Lanka',
              format: 'json',
              limit: 1,
            }), {
              headers: {
                'User-Agent': 'GreenRent/1.0',
              },
            });

            const data = await response.json();
            if (data && data.length > 0) {
              const { lat, lon } = data[0];
              return {
                ...prop,
                lat: parseFloat(lat),
                lng: parseFloat(lon),
              };
            }
          } catch (err) {
            console.error(`Could not geocode ${prop.location?.address}:`, err.message);
          }

          // Default fallback (center of Sri Lanka)
          return {
            ...prop,
            lat: 7.8731,
            lng: 80.7718,
          };
        })
      );

      setGeocodedProps(geocoded);
      initializeMap(geocoded);
    };

    geocodeAndMap();
  }, [properties]);

  // Initialize Leaflet map
  const initializeMap = (propsWithCoords) => {
    if (!window.L) {
      // Load Leaflet CSS and JS dynamically
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        createMap(propsWithCoords);
      };
      document.body.appendChild(script);
    } else {
      createMap(propsWithCoords);
    }
  };

  const createMap = (propsWithCoords) => {
    const mapElement = document.getElementById('property-map');
    if (!mapElement) return;

    // Calculate center based on properties
    const centerLat = propsWithCoords.reduce((sum, p) => sum + p.lat, 0) / propsWithCoords.length;
    const centerLng = propsWithCoords.reduce((sum, p) => sum + p.lng, 0) / propsWithCoords.length;

    const mapInstance = window.L.map('property-map').setView([centerLat, centerLng], 7);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    // Add property markers
    propsWithCoords.forEach((prop) => {
      const marker = window.L.marker([prop.lat, prop.lng])
        .addTo(mapInstance)
        .bindPopup(
          `<div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${prop.title || 'Property'}</h3>
            <p style="margin: 4px 0; font-size: 14px;">📍 ${prop.location?.address || 'Location'}</p>
            <p style="margin: 4px 0; font-size: 14px;">💰 Rs ${prop.price?.toLocaleString('en-LK') || 'N/A'}/month</p>
            <p style="margin: 4px 0; font-size: 14px;">${prop.propertyType || 'Property'}</p>
            <a href="/properties/${prop._id}" style="color: #059669; text-decoration: none; font-weight: 500; margin-top: 8px; display: inline-block;">View Details →</a>
          </div>`,
          { maxWidth: 250 }
        );
    });
  };

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">Could not load properties</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && properties.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-800">No properties available</p>
        </div>
      )}

      {!isLoading && !error && properties.length > 0 && (
        <>
          <div className="mb-4 text-sm text-slate-600">
            Showing {geocodedProps.length} properties on the map
          </div>
          <div
            id="property-map"
            className="w-full rounded-xl border border-slate-200 shadow-md"
            style={{ height: '600px' }}
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop) => (
              <a
                key={prop._id}
                href={`/properties/${prop._id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-emerald-200"
              >
                <h3 className="font-semibold text-slate-900 line-clamp-1">{prop.title}</h3>
                <p className="mt-1 text-sm text-slate-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {prop.location?.address || 'Location unavailable'}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  Rs {prop.price?.toLocaleString('en-LK') || 'N/A'}
                  <span className="text-sm font-normal text-slate-600">/month</span>
                </p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MapDisplay;
