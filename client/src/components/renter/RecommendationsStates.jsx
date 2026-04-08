import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export function RecommendationsLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[450px] rounded-3xl bg-slate-200 animate-pulse" />
      ))}
    </div>
  );
}

export function RecommendationsErrorState({ error, onRetry }) {
  return (
    <div className="p-12 text-center bg-white rounded-3xl border border-red-100">
      <p className="text-red-500 font-bold mb-4">{error}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">
        Try Again
      </button>
    </div>
  );
}

export function RecommendationsEmptyState() {
  return (
    <div className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Leaf className="text-slate-300 w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800">No matches found yet</h3>
      <p className="text-slate-500 mt-2 max-w-sm mx-auto">
        Try broadening your budget or reducing mandatory amenities to see more listings.
      </p>
      <Link to="/preference-setup" className="mt-8 inline-block px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20">
        Adjust Preferences
      </Link>
    </div>
  );
}
