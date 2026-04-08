import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FEATURED_LIMIT = 12;
const ROTATION_MS = 4500;

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
};

const getItemsPerView = (width) => {
  if (width >= 1280) return 3;
  if (width >= 640) return 2;
  return 1;
};

const groupProperties = (properties, size) => {
  if (!Array.isArray(properties) || properties.length === 0) return [];

  const safeSize = Math.max(1, size);
  const grouped = [];
  for (let index = 0; index < properties.length; index += safeSize) {
    grouped.push(properties.slice(index, index + safeSize));
  }
  return grouped;
};

const toLocationLabel = (property) => {
  if (typeof property?.location === "string") return property.location;
  if (!property?.location) return "Location unavailable";

  const parts = [
    property.location.displayAddress,
    property.location.city,
    property.location.state,
    property.location.country,
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(", ");
  return property.location.address || "Location unavailable";
};

const toEcoScore = (property) => {
  const score =
    property?.ecoScore ??
    property?.ecoRatingId?.totalScore ??
    property?.ecoRating?.overallScore ??
    property?.ecoRating?.score ??
    0;

  const normalized = Number(score);
  if (Number.isNaN(normalized)) return 0;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

export default function FeaturedApartmentStrip() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(() => {
    if (typeof window === "undefined") return 3;
    return getItemsPerView(window.innerWidth);
  });

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/properties`, {
          params: {
            limit: FEATURED_LIMIT,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        });

        setProperties(Array.isArray(response.data) ? response.data.slice(0, FEATURED_LIMIT) : []);
      } catch (fetchError) {
        console.error("Failed to load featured apartments:", fetchError);
        setError("We could not load featured apartments right now.");
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pages = useMemo(() => groupProperties(properties, itemsPerView), [properties, itemsPerView]);

  useEffect(() => {
    setCurrentPage((previousPage) => {
      if (pages.length === 0) return 0;
      return Math.min(previousPage, pages.length - 1);
    });
  }, [pages.length]);

  useEffect(() => {
    if (pages.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setCurrentPage((previousPage) => (previousPage + 1) % pages.length);
    }, ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, [pages.length]);

  const currentListings = pages[currentPage] || [];
  const totalPages = pages.length;

  const goToPage = (direction) => {
    if (totalPages <= 1) return;

    setCurrentPage((previousPage) => {
      if (direction === "prev") {
        return previousPage === 0 ? totalPages - 1 : previousPage - 1;
      }

      return (previousPage + 1) % totalPages;
    });
  };

  return (
    <section className="py-7 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} /> Featured apartments
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Looking for a new home? <span className="text-emerald-600">Find your perfect match.</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:border-emerald-300 hover:bg-emerald-50 transition-all"
            >
              Browse all apartments
              <ArrowRight size={15} className="text-emerald-500" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-end gap-2 px-4 sm:px-5 pt-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage("prev")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                aria-label="Show previous apartment set"
                disabled={totalPages <= 1}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => goToPage("next")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                aria-label="Show next apartment set"
                disabled={totalPages <= 1}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="p-3.5 sm:p-4.5">
            {isLoading && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: itemsPerView }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
                    <div className="aspect-[16/10] bg-slate-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 w-3/4 rounded bg-slate-200" />
                      <div className="h-4 w-1/2 rounded bg-slate-100" />
                      <div className="h-10 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
                <p className="font-semibold">Could not load featured apartments.</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            )}

            {!isLoading && !error && currentListings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
                <p className="font-semibold text-slate-800">No apartments are available yet.</p>
                <p className="mt-2 text-sm text-slate-500">Check back shortly or browse the full listings page.</p>
              </div>
            )}

            {!isLoading && !error && currentListings.length > 0 && (
              <div key={`${currentPage}-${itemsPerView}`} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {currentListings.map((property) => (
                  <FeaturedApartmentCard
                    key={property._id}
                    property={property}
                    location={toLocationLabel(property)}
                    ecoScore={toEcoScore(property)}
                  />
                ))}
              </div>
            )}

            {!isLoading && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentPage(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === currentPage ? "w-8 bg-emerald-500" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Show apartment set ${index + 1}`}
                    aria-pressed={index === currentPage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedApartmentCard({ property, location, ecoScore }) {
  const primaryImage =
    property.images?.[0] ||
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80";

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur-sm">
          <Star size={13} className="text-amber-500" />
          {ecoScore}/100 eco
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
            {property.title}
          </h3>
          <span className="whitespace-nowrap text-xs font-extrabold text-emerald-600">
            {formatPrice(property.price)}
          </span>
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={13} className="shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </p>

        <div className="mt-auto pt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
            {property.propertyType || "apartment"}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
            {property.bedrooms ?? "--"} beds
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
            {property.bathrooms ?? "--"} baths
          </span>
        </div>
      </div>
    </Link>
  );
}