import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Settings, Sparkles } from 'lucide-react';

export default function RecommendationsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> AI-Powered Matching
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Recommended <span className="text-emerald-600">for You</span>
        </h1>
        <p className="mt-3 text-slate-500 text-lg max-w-2xl">
          Our Smart Eco Score calculates the best match based on your budget, required amenities, and sustainability goals.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
        >
          <LayoutGrid size={18} />
          Browse All
        </Link>
        <Link
          to="/preference-setup"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-emerald-300 transition-all shadow-sm"
        >
          <Settings size={18} className="text-emerald-500" />
          Update Preferences
        </Link>
      </div>
    </div>
  );
}
