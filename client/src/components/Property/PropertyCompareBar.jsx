import React from "react";

export default function PropertyCompareBar({ compareCount, onClear, onCompareNow }) {
  if (compareCount <= 0) return null;

  return (
    <section className="sticky top-16 z-30 border-y border-emerald-200 bg-emerald-50/95 backdrop-blur-sm">
      <div className="w-full px-4 md:px-8 xl:px-12 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm font-semibold text-emerald-800">
          {compareCount} / 3 selected for comparison
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 text-sm font-semibold hover:bg-emerald-100"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onCompareNow}
            disabled={compareCount < 2}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Compare Now
          </button>
        </div>
      </div>
    </section>
  );
}
