import React from "react";
import { Bus, ShoppingCart, Hospital, School } from "lucide-react";

const NearbyPlaces = ({ nearbyPlaces, nearbyLoading }) => {
  const nearbyPlacesByCategory = nearbyPlaces || {
    busStops: [],
    groceries: [],
    hospitals: [],
    schools: [],
  };

  const nearbyPlaceSections = [
    { key: "busStops", title: "Bus Stops", icon: Bus },
    { key: "groceries", title: "Groceries", icon: ShoppingCart },
    { key: "hospitals", title: "Hospitals", icon: Hospital },
    { key: "schools", title: "Schools", icon: School },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-2 border-b border-slate-100 pb-3 flex items-center">
        📍 Near You
      </h2>
      <p className="text-sm font-normal text-slate-600 mb-4">
        Nearby essentials to help with daily commute, groceries, health, and schooling.
      </p>

      {nearbyLoading && <p className="text-sm text-slate-500 mb-4">Fetching nearby places...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nearbyPlaceSections.map((section) => {
          const IconComponent = section.icon;
          const places = nearbyPlacesByCategory[section.key] || [];

          return (
            <div key={section.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-emerald-600" />
                {section.title}
              </h3>

              {places.length === 0 ? (
                <p className="text-xs text-slate-500">No nearby data yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {places.slice(0, 3).map((place) => (
                    <div key={place.name} className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{place.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{place.note}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          {place.distanceKm.toFixed(1)} km
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyPlaces;
