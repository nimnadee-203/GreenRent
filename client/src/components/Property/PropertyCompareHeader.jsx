import React from "react";
import { Link } from "react-router-dom";

export default function PropertyCompareHeader({ onClear }) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Property Compare</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Compare Up To 3 Listings</h1>
          <p className="text-slate-600 mt-1">Price, eco score, location, bedrooms, and bathrooms side by side.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/properties"
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            Back to Listings
          </Link>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-100"
          >
            Clear All
          </button>
        </div>
      </div>
    </section>
  );
}
