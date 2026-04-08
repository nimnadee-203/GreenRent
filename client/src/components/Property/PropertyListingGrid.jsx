import React from "react";
import { RefreshCw } from "lucide-react";
import PropertyCard from "./PropertyCard";

export default function PropertyListingGrid({
  isLoading,
  error,
  filteredProperties,
  pagedProperties,
  totalPages,
  currentPage,
  onRetry,
  onResetFilters,
  onPageChange,
  ecoBadgeClass,
  onToggleCompareSelection,
  onAddToWishlist,
  compareIds,
  wishlistingIds,
  toLocationLabel,
  toEcoScore,
  toAirQuality,
  getPrimaryPriceInfo,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="aspect-[16/10] bg-slate-200" />
            <div className="p-4 space-y-2.5">
              <div className="h-6 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="h-8 w-1/3 rounded bg-slate-200 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        <p className="font-semibold">Could not fetch apartments.</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={onRetry}
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (filteredProperties.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-slate-800">No apartments matched your filters.</p>
        <p className="mt-2 text-sm text-slate-500">Try broadening your search or clear all filters.</p>
        <button
          onClick={onResetFilters}
          type="button"
          className="mt-4 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {pagedProperties.map((property) => {
          const location = toLocationLabel(property);
          const ecoScore = toEcoScore(property);
          const airQuality = toAirQuality(property);
          const bedrooms = property.bedrooms ?? property.beds ?? 1;
          const bathrooms = property.bathrooms ?? property.baths ?? 1;
          const { value: displayPrice, unit: priceUnit } = getPrimaryPriceInfo(property);
          const selectedForCompare = compareIds.includes(property._id);

          return (
            <PropertyCard
              key={property._id}
              property={property}
              location={location}
              ecoScore={ecoScore}
              airQuality={airQuality}
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              displayPrice={displayPrice}
              priceUnit={priceUnit}
              selectedForCompare={selectedForCompare}
              isWishlisting={wishlistingIds.includes(property._id)}
              ecoBadgeClass={ecoBadgeClass}
              onToggleCompareSelection={onToggleCompareSelection}
              onAddToWishlist={onAddToWishlist}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange((prev) => Math.max(1, prev - 1))}
              className="h-10 px-4 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).slice(0, 3).map((_, idx) => {
              const pageNumber = idx + 1;
              const isActive = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  className={`h-10 w-10 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {totalPages > 3 && <span className="text-slate-400 px-2">...</span>}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange((prev) => Math.min(totalPages, prev + 1))}
              className="h-10 px-4 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
