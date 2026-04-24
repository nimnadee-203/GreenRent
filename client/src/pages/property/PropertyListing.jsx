import React, { useEffect, useMemo, useState } from "react";
// Forced HMR update 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import PropertyCompareBar from "../../components/Property/PropertyCompareBar";
import PropertyListingGrid from "../../components/Property/PropertyListingGrid";
import HomeRecommendations from "../../components/Home/HomeRecommendations";
import PropertyFilterBar from "../../components/Property/PropertyFilterBar";
import { useAuth } from "../../context/AuthContext";

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
  const { backendUser } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [properties, setProperties] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistingIds, setWishlistingIds] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("comparePropertyIds") || "[]");
      if (Array.isArray(saved)) {
        setCompareIds(saved.filter((id) => typeof id === "string").slice(0, 3));
      }
    } catch {
      setCompareIds([]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("comparePropertyIds", JSON.stringify(compareIds));
  }, [compareIds]);

  const requestParams = useMemo(() => {
    const serverSortBy =
      filters.sortBy === "ecoScore" || filters.sortBy === "newestEco"
        ? "createdAt"
        : filters.sortBy;

    const serverSortOrder =
      serverSortBy === "price" || serverSortBy === "title" ? "asc" : "desc";

    const params = {
      sortBy: serverSortBy,
      sortOrder: serverSortOrder,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.propertyType) params.propertyType = filters.propertyType;
    if (filters.availabilityStatus) params.availabilityStatus = filters.availabilityStatus;
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
    if (backendUser?.role === "admin") params.includeHidden = "true";

    return params;
  }, [
    filters.search,
    filters.propertyType,
    filters.availabilityStatus,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.sortOrder,
    backendUser?.role,
  ]);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/properties`, {
        params: requestParams,
        withCredentials: true,
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
    fetchProperties();
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

  const handleAddToWishlist = async (event, propertyId) => {
    event.preventDefault();
    event.stopPropagation();

    if (wishlistingIds.includes(propertyId)) return;

    try {
      setWishlistingIds((prev) => [...prev, propertyId]);
      await axios.post(`${API_BASE_URL}/api/user/wishlist/${propertyId}`, {}, { withCredentials: true });
      navigate("/wishlist");
    } catch (err) {
      const message = err?.response?.data?.message || "Please login to add items to wishlist.";
      alert(message);
    } finally {
      setWishlistingIds((prev) => prev.filter((id) => id !== propertyId));
    }
  };

  const toggleCompareSelection = (event, propertyId) => {
    event.preventDefault();
    event.stopPropagation();

    setCompareIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }

      if (prev.length >= 3) {
        alert("You can compare up to 3 properties at a time.");
        return prev;
      }

      return [...prev, propertyId];
    });
  };

  const clearCompareSelection = () => {
    setCompareIds([]);
  };

  const goToComparePage = () => {
    if (compareIds.length < 2) {
      alert("Select at least 2 properties to compare.");
      return;
    }

    navigate(`/properties/compare?ids=${compareIds.join(",")}`);
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

  const toLocationLabel = (property) => {
    if (typeof property.location === "string") return property.location;
    if (!property.location) return "Location unavailable";

    const parts = [property.location.displayAddress, property.location.city, property.location.state, property.location.country].filter(Boolean);
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

  const getPrimaryPriceInfo = (property) => {
    const stayType = property.stayType || "long";
    const monthlyPrice =
      typeof property.monthlyPrice === "number"
        ? property.monthlyPrice
        : stayType !== "short" && typeof property.price === "number"
          ? property.price
          : null;
    const dailyPrice =
      typeof property.dailyPrice === "number"
        ? property.dailyPrice
        : stayType === "short" && typeof property.price === "number"
          ? property.price
          : null;

    if (stayType === "short") {
      const value = dailyPrice ?? monthlyPrice ?? property.price ?? 0;
      return { value, unit: "/night" };
    }

    if (stayType === "both") {
      // Prefer showing the short-stay (daily) rate if available
      if (dailyPrice != null) {
        return { value: dailyPrice, unit: "/night" };
      }
      const value = monthlyPrice ?? property.price ?? 0;
      return { value, unit: "/month" };
    }

    // Default: long stay
    const value = monthlyPrice ?? property.price ?? 0;
    return { value, unit: "/month" };
  };

  const toCreatedAtTimestamp = (property) => {
    const value = new Date(property?.createdAt || 0).getTime();
    return Number.isNaN(value) ? 0 : value;
  };

  const filteredProperties = useMemo(() => {
    const next = [...properties];

    if (filters.sortBy === "ecoScore") {
      next.sort((a, b) => {
        const ecoDiff = toEcoScore(b) - toEcoScore(a);
        if (ecoDiff !== 0) return ecoDiff;
        return toCreatedAtTimestamp(b) - toCreatedAtTimestamp(a);
      });
      return next;
    }

    if (filters.sortBy === "newestEco") {
      next.sort((a, b) => {
        const createdDiff = toCreatedAtTimestamp(b) - toCreatedAtTimestamp(a);
        if (createdDiff !== 0) return createdDiff;
        return toEcoScore(b) - toEcoScore(a);
      });
      return next;
    }

    return next;
  }, [properties, filters.sortBy]);

  const totalVisible = filteredProperties.length;

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));

  const pagedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {compareIds.length > 0 && (
        <section className="sticky top-16 z-30 border-y border-emerald-200 bg-emerald-50/95 backdrop-blur-sm">
          <div className="w-full px-4 md:px-8 xl:px-12 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm font-semibold text-emerald-800">
              {compareIds.length} / 3 selected for comparison
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompareSelection}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 text-sm font-semibold hover:bg-emerald-100"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={goToComparePage}
                disabled={compareIds.length < 2}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Compare Now
              </button>
            </div>
          </div>
        </section>
      )}

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
            <option value="ecoScore">Sort by Eco Score</option>
            <option value="newestEco">Sort by Newest + Eco</option>
          </select>
        </div>

        <PropertyListingGrid
          isLoading={isLoading}
          error={error}
          filteredProperties={filteredProperties}
          pagedProperties={pagedProperties}
          totalPages={totalPages}
          currentPage={currentPage}
          onRetry={fetchProperties}
          onResetFilters={resetFilters}
          onPageChange={setCurrentPage}
          ecoBadgeClass={ecoBadgeClass}
          onToggleCompareSelection={toggleCompareSelection}
          onAddToWishlist={handleAddToWishlist}
          compareIds={compareIds}
          wishlistingIds={wishlistingIds}
          toLocationLabel={toLocationLabel}
          toEcoScore={toEcoScore}
          toAirQuality={toAirQuality}
          getPrimaryPriceInfo={getPrimaryPriceInfo}
        />
      </main>

      <Footer />
    </div>
  );
}
