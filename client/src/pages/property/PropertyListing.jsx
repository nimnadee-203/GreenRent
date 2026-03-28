import React, { useEffect, useMemo, useState } from "react";
// Forced HMR update 
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Bath,
  Bed,
  Heart,
  Leaf,
  MapPin,
  RefreshCw,
  Maximize2,
} from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import PropertyFilterBar from "../../components/PropertyListing/PropertyFilterBar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DEFAULT_FILTERS = {
  search: "",
  propertyType: "",
  availabilityStatus: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const TYPE_OPTIONS = ["apartment", "house", "studio", "townhouse", "other"];

const AVAILABILITY_OPTIONS = ["available", "rented", "archived"];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80";

const ITEMS_PER_PAGE = 10;

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
};

const capitalize = (value) => {
  if (!value) return "";
  return value[0].toUpperCase() + value.slice(1);
};

export default function PropertyListing() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const requestParams = useMemo(() => {
    const params = {
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.propertyType) params.propertyType = filters.propertyType;
    if (filters.availabilityStatus) params.availabilityStatus = filters.availabilityStatus;
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);

    return params;
  }, [
    filters.search,
    filters.propertyType,
    filters.availabilityStatus,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/properties`, {
        params: requestParams,
      });
      setProperties(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load properties.");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProperties();
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [requestParams]);

  const updateFilter = (field) => (event) => {
    setFilters((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const activeFilters = useMemo(() => {
    const labels = [];
    if (filters.search.trim()) labels.push(`Search: ${filters.search.trim()}`);
    if (filters.propertyType) labels.push(`Type: ${capitalize(filters.propertyType)}`);
    if (filters.minPrice) labels.push(`Min: ${formatPrice(Number(filters.minPrice))}`);
    if (filters.maxPrice) labels.push(`Max: ${formatPrice(Number(filters.maxPrice))}`);
    return labels;
  }, [filters]);

  const removeFilterChip = (label) => {
    if (label.startsWith("Search:")) setFilters((prev) => ({ ...prev, search: "" }));
    if (label.startsWith("Type:")) setFilters((prev) => ({ ...prev, propertyType: "" }));
    if (label.startsWith("Min:")) setFilters((prev) => ({ ...prev, minPrice: "" }));
    if (label.startsWith("Max:")) setFilters((prev) => ({ ...prev, maxPrice: "" }));
    setCurrentPage(1);
  };

  const filteredProperties = useMemo(() => properties, [properties]);

  const totalVisible = filteredProperties.length;

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));

  const pagedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const toLocationLabel = (property) => {
    if (typeof property.location === "string") return property.location;
    if (!property.location) return "Location unavailable";

    const parts = [property.location.city, property.location.state, property.location.country].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    return property.location.address || "Location unavailable";
  };

  const toEcoScore = (property) => {
    const score =
      property.ecoScore ??
      property.ecoRatingId?.totalScore ??
      property.ecoRating?.overallScore ??
      property.ecoRating?.score ??
      0;
    const normalized = Number(score);
    if (Number.isNaN(normalized)) return 0;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  };

  const toAirQuality = (property) => {
    return property.ecoRatingId?.airQualityScore ?? null;
  };

  const ecoBadgeClass = (score) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    if (score > 0) return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <PropertyFilterBar
        filters={filters}
        updateFilter={updateFilter}
        typeOptions={TYPE_OPTIONS}
        activeFilters={activeFilters}
        removeFilterChip={removeFilterChip}
        resetFilters={resetFilters}
      />

      <main className="w-full px-4 md:px-8 xl:px-12 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{totalVisible} Apartments found</h1>
          <select
            value={filters.sortBy}
            onChange={updateFilter("sortBy")}
            className="bg-transparent border-none text-sm font-medium text-slate-600 focus:ring-0 cursor-pointer"
          >
            <option value="createdAt">Newest Listings</option>
            <option value="price">Lowest Price</option>
            <option value="title">Name A-Z</option>
          </select>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
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
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Could not fetch apartments.</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchProperties}
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {!isLoading && !error && filteredProperties.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-800">No apartments matched your filters.</p>
            <p className="mt-2 text-sm text-slate-500">Try broadening your search or clear all filters.</p>
            <button
              onClick={resetFilters}
              type="button"
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Reset Filters
            </button>
          </div>
        )}

        {!isLoading && !error && filteredProperties.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {pagedProperties.map((property) => {
                const primaryImage = property.images?.[0] || FALLBACK_IMAGE;
                const location = toLocationLabel(property);
                const ecoScore = toEcoScore(property);                  const airQuality = toAirQuality(property);                const bedrooms = property.bedrooms ?? property.beds ?? 1;
                const bathrooms = property.bathrooms ?? property.baths ?? 1;

                return (
                  <Link
                    to={`/properties/${property._id}`}
                    key={property._id}
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
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white transition-colors z-10"
                          onClick={(e) => { e.preventDefault(); /* Prevent Link navigation */ }}
                        >
                        <Heart className="w-5 h-5" />
                      </button>

                        <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
                          <div className={`inline-flex items-center border rounded-full px-2.5 py-1 text-sm ${ecoBadgeClass(ecoScore)}`}>
                            <Leaf className="w-4 h-4 mr-1.5" />
                            <span className="font-bold">{ecoScore}</span>
                          </div>
                          {airQuality !== null && (
                            <div className="inline-flex items-center border rounded-full px-2.5 py-1 text-sm bg-sky-50 text-sky-700 border-sky-200" title="Air Quality Score">
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
                            <span>{Number(property.area).toLocaleString('en-LK')} sq.ft</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline">
                        <span className="text-xl font-bold text-slate-900">Rs {Number(property.price || 0).toLocaleString('en-LK')}</span>
                        <span className="text-slate-500 text-xs ml-1">/month</span>
                      </div>
                    </div>
                  </article>
                </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                        onClick={() => setCurrentPage(pageNumber)}
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
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="h-10 px-4 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
