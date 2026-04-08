import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import PropertyCompareHeader from "../../components/Property/PropertyCompareHeader";
import PropertyCompareTable from "../../components/Property/PropertyCompareTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

const toLocationLabel = (property) => {
  if (typeof property?.location === "string") return property.location;
  if (!property?.location) return "Location unavailable";

  const parts = [property.location.displayAddress, property.location.city, property.location.state, property.location.country].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return property.location.address || "Location unavailable";
};

const getPrimaryPriceInfo = (property) => {
  const stayType = property?.stayType || "long";
  const monthlyPrice =
    typeof property?.monthlyPrice === "number"
      ? property.monthlyPrice
      : stayType !== "short" && typeof property?.price === "number"
      ? property.price
      : null;
  const dailyPrice =
    typeof property?.dailyPrice === "number"
      ? property.dailyPrice
      : stayType === "short" && typeof property?.price === "number"
      ? property.price
      : null;

  if (stayType === "short") {
    const value = dailyPrice ?? monthlyPrice ?? property?.price ?? 0;
    return { value, unit: "/night" };
  }

  if (stayType === "both") {
    if (dailyPrice != null) {
      return { value: dailyPrice, unit: "/night" };
    }
    const value = monthlyPrice ?? property?.price ?? 0;
    return { value, unit: "/month" };
  }

  const value = monthlyPrice ?? property?.price ?? 0;
  return { value, unit: "/month" };
};

export default function PropertyCompare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const compareIds = useMemo(() => {
    const raw = searchParams.get("ids") || "";
    const ids = raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    return [...new Set(ids)].slice(0, 3);
  }, [searchParams]);

  useEffect(() => {
    if (compareIds.length > 0) {
      sessionStorage.setItem("comparePropertyIds", JSON.stringify(compareIds));
    }
  }, [compareIds]);

  useEffect(() => {
    if (compareIds.length > 0) return;

    try {
      const saved = JSON.parse(sessionStorage.getItem("comparePropertyIds") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        setSearchParams({ ids: saved.slice(0, 3).join(",") });
      }
    } catch {
      // Ignore invalid session data and keep empty state.
    }
  }, [compareIds.length, setSearchParams]);

  useEffect(() => {
    const loadComparison = async () => {
      if (compareIds.length === 0) {
        setProperties([]);
        setLoading(false);
        setError("Pick properties from the listing page to compare.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          compareIds.map(async (id) => {
            try {
              const response = await axios.get(`${API_BASE_URL}/api/properties/${id}`, {
                withCredentials: true,
              });
              return response.data;
            } catch {
              return null;
            }
          })
        );

        const validProperties = results.filter(Boolean);
        setProperties(validProperties);

        if (validProperties.length === 0) {
          setError("Could not load selected properties.");
        }
      } catch {
        setError("Failed to load property comparison data.");
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [compareIds]);

  const removeCompareId = (id) => {
    const nextIds = compareIds.filter((item) => item !== id);
    if (nextIds.length > 0) {
      setSearchParams({ ids: nextIds.join(",") });
      sessionStorage.setItem("comparePropertyIds", JSON.stringify(nextIds));
    } else {
      setSearchParams({});
      sessionStorage.removeItem("comparePropertyIds");
    }
  };

  const clearAll = () => {
    setSearchParams({});
    sessionStorage.removeItem("comparePropertyIds");
    setProperties([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="w-full px-4 md:px-8 xl:px-12 py-8">
        <PropertyCompareHeader onClear={clearAll} />

        {loading && <p className="text-sm text-slate-500">Loading comparison data...</p>}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
        )}

        {!loading && !error && properties.length > 0 && (
          <PropertyCompareTable
            properties={properties}
            onRemoveCompareId={removeCompareId}
            toEcoScore={toEcoScore}
            toLocationLabel={toLocationLabel}
            getPrimaryPriceInfo={getPrimaryPriceInfo}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}