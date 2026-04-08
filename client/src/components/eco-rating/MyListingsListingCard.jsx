import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Ban, Clock, Edit2, Eye, Leaf, MapPin, Trash2 } from "lucide-react";

export default function MyListingsListingCard({
  property,
  ecoState,
  formatPrice,
  onOpenUpdateModal,
  onOpenEcoModal,
  onDeleteListing,
}) {
  return (
    <div className="group flex flex-col rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <MapPin className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-semibold uppercase tracking-wider">No Image</span>
          </div>
        )}

        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md flex items-center shadow-sm ${ecoState.color}`}>
            {ecoState.status === "active" && <Leaf className="w-3.5 h-3.5 mr-1.5" />}
            {ecoState.status === "pending" && <Clock className="w-3.5 h-3.5 mr-1.5" />}
            {ecoState.status === "hidden" && <Ban className="w-3.5 h-3.5 mr-1.5" />}
            {ecoState.label}
            {ecoState.status === "active" && <span className="ml-1.5 px-1.5 py-0.5 bg-white/50 rounded-md">{ecoState.score}/100</span>}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{property.title}</h2>
          <span className="text-lg font-extrabold text-emerald-600">{formatPrice(property.price)}</span>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <p className="text-sm text-slate-500 flex items-center"><MapPin className="w-4 h-4 mr-1 opacity-70" /> {property.location?.address}</p>
          <p className="text-sm text-slate-500 flex items-center"><Clock className="w-4 h-4 mr-1 opacity-70" /> Posted on: {new Date(property.createdAt).toLocaleDateString()}</p>
        </div>

        {ecoState.status !== "active" && (
          <div className={`mt-auto mb-5 p-4 rounded-xl border ${ecoState.status === "hidden" ? "bg-red-50/50 border-red-100" : "bg-amber-50/50 border-amber-100"}`}>
            <div className="flex gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${ecoState.status === "hidden" ? "text-red-600" : "text-amber-600"}`} />
              <div>
                <p className={`text-sm font-bold ${ecoState.status === "hidden" ? "text-red-800" : "text-amber-800"}`}>
                  {ecoState.status === "hidden" ? "Listing Hidden" : "Action Required"}
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${ecoState.status === "hidden" ? "text-red-600" : "text-amber-700"}`}>
                  {ecoState.status === "hidden"
                    ? ecoState.reason === "admin"
                      ? "Your property is hidden by an admin visibility override."
                      : "Your property is hidden from public view because it lacks an Eco-Rating."
                    : `Add an Eco-Rating before time runs out or your listing will be hidden. Time left: ${ecoState.timeLeftText}.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={ecoState.status === "active" ? "mt-auto pt-5 border-t border-slate-100" : "pt-5 border-t border-slate-100"}>
          <div className="grid grid-cols-2 gap-2">
            <Link to={`/properties/${property._id}`} className={`flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${ecoState.status !== "hidden" ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "border opacity-50 cursor-not-allowed text-slate-400"}`}>
              <Eye className="w-4 h-4 mr-1.5" /> View
            </Link>
            <button onClick={() => onOpenUpdateModal(property)} className="flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
              <Edit2 className="w-4 h-4 mr-1.5" /> Update Details
            </button>
            <button onClick={() => onOpenEcoModal(property)} className="flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors">
              {ecoState.status === "active" ? <><Leaf className="w-4 h-4 mr-1.5" /> Edit Rating</> : <><Leaf className="w-4 h-4 mr-1.5" /> Add Rating</>}
            </button>
            <button onClick={() => onDeleteListing(property._id)} className="flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4 mr-1.5 font-bold" /> Delete Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
