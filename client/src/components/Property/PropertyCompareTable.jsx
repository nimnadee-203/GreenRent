import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, Bed, Bath, Leaf, MapPin } from "lucide-react";

export default function PropertyCompareTable({ properties, onRemoveCompareId, toEcoScore, toLocationLabel, getPrimaryPriceInfo }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[780px] w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 w-44">Feature</th>
              {properties.map((property) => (
                <th key={property._id} className="text-left px-4 py-3 min-w-[220px]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{property.title}</p>
                      <Link
                        to={`/properties/${property._id}`}
                        className="text-xs text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <ArrowLeftRight size={12} /> View details
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCompareId(property._id)}
                      className="text-xs px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">Price</td>
              {properties.map((property) => {
                const { value, unit } = getPrimaryPriceInfo(property);
                return (
                  <td key={`${property._id}-price`} className="px-4 py-3 text-sm text-slate-900 font-semibold">
                    Rs {Number(value || 0).toLocaleString("en-LK")} {unit}
                  </td>
                );
              })}
            </tr>

            <tr className="border-b border-slate-100 bg-slate-50/40">
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">Eco Score</td>
              {properties.map((property) => (
                <td key={`${property._id}-eco`} className="px-4 py-3 text-sm text-slate-900 font-semibold inline-flex items-center gap-1.5">
                  <Leaf size={14} className="text-emerald-600" /> {toEcoScore(property)}
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">Location</td>
              {properties.map((property) => (
                <td key={`${property._id}-location`} className="px-4 py-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-500" /> {toLocationLabel(property)}
                  </span>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-100 bg-slate-50/40">
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">Bedrooms</td>
              {properties.map((property) => (
                <td key={`${property._id}-beds`} className="px-4 py-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Bed size={14} className="text-slate-500" /> {property.bedrooms ?? property.beds ?? "N/A"}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">Bathrooms</td>
              {properties.map((property) => (
                <td key={`${property._id}-baths`} className="px-4 py-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Bath size={14} className="text-slate-500" /> {property.bathrooms ?? property.baths ?? "N/A"}
                  </span>
                </td>
              ))}
            </tr>

            <tr className="border-t border-slate-200 bg-slate-50/60">
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">Next Step</td>
              {properties.map((property) => (
                <td key={`${property._id}-action`} className="px-4 py-3">
                  <Link
                    to={`/properties/${property._id}`}
                    className="inline-flex items-center justify-center w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    View & Book
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
