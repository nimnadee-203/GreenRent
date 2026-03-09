import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Filter, MapPin, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DEFAULT_FILTERS = {
  search: "",
  propertyType: "",
  availabilityStatus: "available",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const TYPE_OPTIONS = ["apartment", "house", "studio", "townhouse", "other"];

const AVAILABILITY_OPTIONS = ["available", "rented", "archived"];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80";

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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
  const [showFilters, setShowFilters] = useState(false);

  const totalVisible = properties.length;

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
  }, [filters]);

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
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 md:px-8">
        <section className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-700 to-cyan-600 p-6 text-white shadow-xl md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">GreenRent Marketplace</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">Property Listings</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50 md:text-base">
                Browse eco-aware homes, compare prices, and shortlist places that match your lifestyle.
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-100">Currently Showing</p>
              <p className="text-2xl font-semibold">{totalVisible} listings</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="hidden rounded-3xl bg-white p-5 shadow-md lg:block">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Filter size={18} /> Filters
              </h2>
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
                type="button"
              >
                Reset
              </button>
            </div>

            <FilterFields filters={filters} updateFilter={updateFilter} />
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setShowFilters((previous) => !previous)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow"
              >
                <SlidersHorizontal size={16} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {showFilters && (
              <div className="mb-4 rounded-2xl bg-white p-4 shadow-md lg:hidden">
                <FilterFields filters={filters} updateFilter={updateFilter} compact />
                <button
                  onClick={resetFilters}
                  className="mt-4 w-full rounded-xl border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700"
                  type="button"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl bg-white p-3 shadow-sm">
                    <div className="h-48 rounded-xl bg-slate-200" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    <div className="mt-4 h-8 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                <p className="font-semibold">Could not fetch properties.</p>
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

            {!isLoading && !error && properties.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">No properties matched your filters.</p>
                <p className="mt-2 text-sm text-slate-500">Try broadening search terms or resetting price range.</p>
                <button
                  onClick={resetFilters}
                  type="button"
                  className="mt-4 rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {!isLoading && !error && properties.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => {
                  const primaryImage = property.images?.[0] || FALLBACK_IMAGE;

                  return (
                    <article
                      key={property._id}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <img
                        src={primaryImage}
                        alt={property.title}
                        className="h-52 w-full object-cover"
                        loading="lazy"
                      />

                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{property.title}</h3>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            {capitalize(property.propertyType)}
                          </span>
                        </div>

                        <p className="line-clamp-2 text-sm text-slate-600">{property.description}</p>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={16} />
                          <span className="line-clamp-1">{property.location?.address || "Address unavailable"}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-xs text-slate-500">Starting from</p>
                            <p className="text-lg font-bold text-slate-900">{formatPrice(property.price)} / month</p>
                          </div>
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                            {capitalize(property.availabilityStatus)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterFields({ filters, updateFilter, compact = false }) {
  const inputClassName =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="space-y-4">
      <label className="block">
        <p className="mb-1 text-sm font-medium text-slate-700">Search</p>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={updateFilter("search")}
            type="text"
            placeholder="Location, title, keywords"
            className={`${inputClassName} pl-9`}
          />
        </div>
      </label>

      <label className="block">
        <p className="mb-1 text-sm font-medium text-slate-700">Property Type</p>
        <select value={filters.propertyType} onChange={updateFilter("propertyType")} className={inputClassName}>
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {capitalize(type)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <p className="mb-1 text-sm font-medium text-slate-700">Availability</p>
        <select
          value={filters.availabilityStatus}
          onChange={updateFilter("availabilityStatus")}
          className={inputClassName}
        >
          {AVAILABILITY_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <p className="mb-1 text-sm font-medium text-slate-700">Min Price</p>
          <input
            value={filters.minPrice}
            onChange={updateFilter("minPrice")}
            type="number"
            min="0"
            placeholder="0"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <p className="mb-1 text-sm font-medium text-slate-700">Max Price</p>
          <input
            value={filters.maxPrice}
            onChange={updateFilter("maxPrice")}
            type="number"
            min="0"
            placeholder="50000"
            className={inputClassName}
          />
        </label>
      </div>

      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
        <label className="block">
          <p className="mb-1 text-sm font-medium text-slate-700">Sort By</p>
          <select value={filters.sortBy} onChange={updateFilter("sortBy")} className={inputClassName}>
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="title">Name</option>
          </select>
        </label>

        <label className="block">
          <p className="mb-1 text-sm font-medium text-slate-700">Order</p>
          <select value={filters.sortOrder} onChange={updateFilter("sortOrder")} className={inputClassName}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>
    </div>
  );
}
