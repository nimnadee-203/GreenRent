import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize2, Trash2 } from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80";

const WishlistGrid = ({ wishlist = [], removingIds = [], onRemove, isLoading = false, error = "" }) => {
  if (isLoading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Loading wishlist...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <p className="font-semibold">Could not load wishlist.</p>
        <p className="mt-1 text-sm">{error}</p>
        <Link
          to="/login"
          className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-slate-800">Your wishlist is empty.</p>
        <p className="mt-2 text-sm text-slate-500">Tap the heart on any property card to save it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {wishlist.map((property) => {
        const bedrooms = property.bedrooms ?? property.beds ?? 1;
        const bathrooms = property.bathrooms ?? property.baths ?? 1;
        const primaryImage = property.images?.[0] || FALLBACK_IMAGE;

        return (
          <article
            key={property._id}
            className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
          >
            <Link to={`/properties/${property._id}`} className="block group">
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={primaryImage}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Link>

            <div className="p-4 flex-1 flex flex-col">
              <Link to={`/properties/${property._id}`}>
                <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{property.title}</h2>
              </Link>

              <p className="mt-1 text-sm text-slate-500 flex items-center line-clamp-1">
                <MapPin className="w-4 h-4 mr-1" /> {property.location?.address || "Address not provided"}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="inline-flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {bedrooms} Beds
                </span>
                <span className="inline-flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {bathrooms} Baths
                </span>
                {property.area && (
                  <span className="inline-flex items-center">
                    <Maximize2 className="w-4 h-4 mr-1" />
                    {Number(property.area).toLocaleString("en-LK")} sq.ft
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xl font-bold text-slate-900">
                  Rs {Number(property.price || 0).toLocaleString("en-LK")}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(property._id)}
                  disabled={removingIds.includes(property._id)}
                  className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default WishlistGrid;
