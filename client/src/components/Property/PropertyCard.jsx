import React from "react";
import { Link } from "react-router-dom";
import { Bath, Bed, Heart, Leaf, MapPin, Maximize2 } from "lucide-react";

export default function PropertyCard({
  property,
  location,
  ecoScore,
  airQuality,
  bedrooms,
  bathrooms,
  displayPrice,
  priceUnit,
  selectedForCompare,
  isWishlisting,
  ecoBadgeClass,
  onToggleCompareSelection,
  onAddToWishlist,
}) {
  const primaryImage = property.images?.[0] || "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80";

  return (
    <Link
      to={`/properties/${property._id}`}
      className="block group h-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-emerald-200"
    >
      <article className="h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          <button
            type="button"
            onClick={(event) => onToggleCompareSelection(event, property._id)}
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border z-10 transition-colors ${
              selectedForCompare
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white"
            }`}
          >
            {selectedForCompare ? "Selected" : "Compare"}
          </button>

          <button
            type="button"
            disabled={isWishlisting}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white transition-colors z-10 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={(event) => onAddToWishlist(event, property._id)}
          >
            <Heart className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
            <div className={`inline-flex items-center border rounded-full px-2.5 py-1 text-sm ${ecoBadgeClass(ecoScore)}`}>
              <Leaf className="w-4 h-4 mr-1.5" />
              <span className="font-bold">{ecoScore}</span>
            </div>
            {airQuality !== null && (
              <div
                className="inline-flex items-center border rounded-full px-2.5 py-1 text-sm bg-sky-50 text-sky-700 border-sky-200"
                title="Air Quality Score"
              >
                <span className="font-bold mr-1">{airQuality}</span>
                <span className="text-[10px] uppercase font-semibold">/ 10 AQ</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg leading-tight text-slate-900 line-clamp-1">{property.title}</h3>

          <div className="flex items-center text-slate-500 text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 flex-wrap">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>{bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>{bathrooms} Baths</span>
            </div>
            {property.area && (
              <div className="flex items-center">
                <Maximize2 className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>{Number(property.area).toLocaleString("en-LK")} sq.ft</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline">
            <span className="text-xl font-bold text-slate-900">
              Rs {Number(displayPrice || 0).toLocaleString("en-LK")}
            </span>
            <span className="text-slate-500 text-xs ml-1">{priceUnit}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
