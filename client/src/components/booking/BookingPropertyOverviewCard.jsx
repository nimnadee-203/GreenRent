import React from "react";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";

export default function BookingPropertyOverviewCard({ property }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col sm:flex-row">
      <div className="sm:w-1/3 h-48 sm:h-auto bg-slate-100 relative">
        <img
          src={property.images && property.images.length > 0 ? property.images[0] : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600"}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur font-bold text-[#0071c2] text-[11px] px-2 py-1 rounded uppercase tracking-wider">
          {property.propertyType || "Apartment"}
        </div>
      </div>
      <div className="sm:w-2/3 p-5 sm:p-6 flex flex-col">
        <h2 className="text-[22px] font-bold text-slate-900 leading-tight mb-2">{property.title}</h2>
        <p className="text-[14px] text-slate-600 flex items-start gap-1.5 mb-4">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
          {property.location?.address || "Location not provided"}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-700 font-bold mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-[#008234]" /> {property.bedrooms || 1} Bedrooms</div>
          <div className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-[#008234]" /> {property.bathrooms || 1} Bathrooms</div>
          <div className="flex items-center gap-1.5"><Maximize className="w-4 h-4 text-[#008234]" /> {property.area || "N/A"} sqft</div>
        </div>

        <p className="text-[13px] text-slate-600 line-clamp-2 mt-auto">
          {property.description || "A beautiful, eco-friendly property perfectly equipped for your stay."}
        </p>
      </div>
    </div>
  );
}
