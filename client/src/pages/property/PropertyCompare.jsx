import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeftRight, Bed, Bath, Leaf, MapPin } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";

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
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Property Compare</p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Compare Up To 3 Listings</h1>
              <p className="text-slate-600 mt-1">Price, eco score, location, bedrooms, and bathrooms side by side.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/properties"
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Back to Listings
              </Link>
              <button
                type="button"
                onClick={clearAll}
                className="px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-100"
              >
                Clear All
              </button>
            </div>
          </div>
        </section>

        {loading && <p className="text-sm text-slate-500">Loading comparison data...</p>}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
        )}

        {!loading && !error && properties.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[780px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 w-44">Feature</th>
                    {properties.map((property) => (
                      <th key={property._id} className="text-left px-4 py-3 min-w-[220px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{property.title}</p>
                            <Link
                              to={`/properties/${property._id}`}
                              className="text-xs text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              <ArrowLeftRight size={12} /> View details
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCompareId(property._id)}
                            className="text-xs px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Price</td>
                    {properties.map((property) => {
                      const { value, unit } = getPrimaryPriceInfo(property);
                      return (
                        <td key={`${property._id}-price`} className="px-4 py-3 text-sm text-slate-900 font-semibold">
                          Rs {Number(value || 0).toLocaleString("en-LK")} {unit}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="border-b border-slate-100 bg-slate-50/40">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Eco Score</td>
                    {properties.map((property) => (
                      <td key={`${property._id}-eco`} className="px-4 py-3 text-sm text-slate-900 font-semibold inline-flex items-center gap-1.5">
                        <Leaf size={14} className="text-emerald-600" /> {toEcoScore(property)}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Location</td>
                    {properties.map((property) => (
                      <td key={`${property._id}-location`} className="px-4 py-3 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-500" /> {toLocationLabel(property)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-slate-100 bg-slate-50/40">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Bedrooms</td>
                    {properties.map((property) => (
                      <td key={`${property._id}-beds`} className="px-4 py-3 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Bed size={14} className="text-slate-500" /> {property.bedrooms ?? property.beds ?? "N/A"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Bathrooms</td>
                    {properties.map((property) => (
                      <td key={`${property._id}-baths`} className="px-4 py-3 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Bath size={14} className="text-slate-500" /> {property.bathrooms ?? property.baths ?? "N/A"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-slate-200 bg-slate-50/60">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Next Step</td>
                    {properties.map((property) => (
                      <td key={`${property._id}-action`} className="px-4 py-3">
                        <Link
                          to={`/properties/${property._id}`}
                          className="inline-flex items-center justify-center w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          View & Book
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}