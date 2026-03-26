import React from "react";
import { Search, X } from "lucide-react";

export default function PropertyFilterBar({
  filters,
  updateFilter,
  updateCheckOutDate,
  typeOptions,
  activeFilters,
  removeFilterChip,
  resetFilters,
}) {
  return (
    <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="w-full px-4 md:px-8 xl:px-12 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-full shadow-lg border border-slate-200 p-2 flex items-center gap-1">
            <div className="flex-1 px-6 py-3 border-r border-emerald-100">
              <p className="text-xs font-semibold text-slate-900">Where</p>
              <input
                type="text"
                value={filters.search}
                onChange={updateFilter("search")}
                placeholder="Search locations or keywords"
                className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
              />
            </div>

            <div className="hidden md:flex flex-1 px-6 py-3 border-r border-emerald-100">
              <div className="w-full">
                <p className="text-xs font-semibold text-slate-900">Check in</p>
                <input
                  type="date"
                  value={filters.checkInDate}
                  onChange={updateFilter("checkInDate")}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="hidden md:flex flex-1 px-6 py-3 border-r border-emerald-100">
              <div className="w-full">
                <p className="text-xs font-semibold text-slate-900">Check out</p>
                <input
                  type="date"
                  value={filters.checkOutDate}
                  onChange={updateCheckOutDate}
                  min={filters.checkInDate || undefined}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="hidden md:flex flex-1 px-6 py-3 border-r border-emerald-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">Type</p>
                <select
                  value={filters.propertyType}
                  onChange={updateFilter("propertyType")}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">All types</option>
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 px-6 py-3 border-r border-emerald-100">
              <div className="w-full">
                <p className="text-xs font-semibold text-slate-900">Price</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={updateFilter("minPrice")}
                    placeholder="Min"
                    min="0"
                    className="w-12 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={updateFilter("maxPrice")}
                    placeholder="Max"
                    min="0"
                    className="w-12 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mr-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 flex items-center justify-center transition shadow-sm hover:shadow-md"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {activeFilters.length > 0 && (
                <>
                  {activeFilters.map((filter) => (
                    <span
                      key={filter}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-sm font-medium text-emerald-700 border border-emerald-200"
                    >
                      {filter}
                      <button
                        onClick={() => removeFilterChip(filter)}
                        className="text-emerald-400 hover:text-emerald-600"
                        type="button"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={resetFilters}
                    className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                    type="button"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}