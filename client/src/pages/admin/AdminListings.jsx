import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Bell, ShieldCheck, MapPin, CalendarDays, EyeOff, Eye } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const isPubliclyVisibleByEcoRules = (property) => {
  if (property?.visibilityStatus === "hidden") return false;
  if (property?.visibilityStatus === "visible") return true;

  if (property?.ecoRatingId) return true;

  const now = Date.now();
  const createdAt = property?.createdAt ? new Date(property.createdAt).getTime() : 0;
  const clearedAt = property?.ecoRatingClearedAt ? new Date(property.ecoRatingClearedAt).getTime() : null;

  if (!createdAt) return false;

  // Matches backend rules for public visibility.
  if (!clearedAt) {
    const fortyEightHours = 48 * 60 * 60 * 1000;
    return now - createdAt <= fortyEightHours;
  }

  const oneHour = 60 * 60 * 1000;
  return now - clearedAt <= oneHour;
};

export default function AdminListings() {
  const { backendUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingVisibilityIds, setSavingVisibilityIds] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchAllListings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/properties`, {
        params: {
          includeHidden: "true",
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        withCredentials: true,
      });
      setListings(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch listings.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/renter-reviews/admin/list`, {
        withCredentials: true,
      });
      setAdminReviews(Array.isArray(response.data?.reviews) ? response.data.reviews : []);
    } catch (err) {
      setAdminReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (backendUser?.role === "admin") {
      fetchAllListings();
      fetchAdminReviews();
    } else {
      setLoading(false);
    }
  }, [backendUser?.role]);


  const updateVisibilityStatus = async (propertyId, visibilityStatus) => {
    if (savingVisibilityIds.includes(propertyId)) return;
    setSavingVisibilityIds((prev) => [...prev, propertyId]);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/properties/${propertyId}`,
        { visibilityStatus },
        { withCredentials: true }
      );

      const updated = response.data;
      setListings((prev) => prev.map((item) => (item._id === propertyId ? { ...item, ...updated } : item)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update visibility status.");
    } finally {
      setSavingVisibilityIds((prev) => prev.filter((id) => id !== propertyId));
    }
  };

  const counts = useMemo(() => {
    const visible = listings.filter(isPubliclyVisibleByEcoRules).length;
    const hidden = listings.length - visible;
    return { total: listings.length, visible, hidden };
  }, [listings]);

  const surfaceCardClass = "rounded-3xl border border-white/60 bg-white/75 backdrop-blur-md shadow-[0_16px_45px_-24px_rgba(15,23,42,0.45)]";
  const secondaryButtonClass = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 font-semibold hover:bg-white hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300";

  if (backendUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_48%,_#f1f5f9_100%)]">
        <Navbar />
        <main className="w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h1 className="text-xl font-bold">Admin Access Required</h1>
            <p className="mt-2 text-sm">Only admins can view the complete listings database.</p>
            <Link to="/my-listings" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold border border-red-200 hover:bg-red-100">
              <ArrowLeft className="w-4 h-4" /> Back to Overview & Listings
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_48%,_#f1f5f9_100%)]">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-white/85 via-emerald-50/65 to-cyan-50/60 backdrop-blur-sm shadow-[0_24px_60px_-28px_rgba(16,185,129,0.4)] mb-8">
          <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-emerald-300/45 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 w-52 h-52 rounded-full bg-cyan-300/35 blur-3xl" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-emerald-700 font-semibold mb-1">Admin Space</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600" /> Admin Listings View
              </h1>
              <p className="text-slate-600 mt-2">Complete property database, including records hidden from public listing pages.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/my-listings" className={secondaryButtonClass}>
                <ArrowLeft className="w-4 h-4" /> Back to Overview & Listings
              </Link>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="Publicly Visible" value={counts.visible} />
          <StatCard label="Hidden by Eco Rules" value={counts.hidden} />
        </div>

        <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/70 p-5 mb-6 shadow-[0_12px_40px_-24px_rgba(245,158,11,0.45)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <Bell className="w-5 h-5" /> Review Notifications
            </h2>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-amber-200 text-amber-900">
              {adminReviews.length} total
            </span>
          </div>

          {reviewsLoading ? (
            <p className="text-sm text-amber-900/80">Loading review notifications...</p>
          ) : adminReviews.length === 0 ? (
            <p className="text-sm text-amber-900/80">No new review notifications right now.</p>
          ) : (
            <p className="text-sm text-amber-900/80">You have {adminReviews.length} total reviews. Use Review Management to hide or delete any review.</p>
          )}

          <div className="mt-4">
            <Link
              to="/admin/reviews"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white/90 px-3.5 py-2 text-sm font-semibold text-amber-800 hover:bg-white transition-all duration-300"
            >
              Open Review Management
            </Link>
          </div>
        </div>

        {loading && (
          <div className={`${surfaceCardClass} p-6 text-slate-500`}>Loading listings...</div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-red-700 shadow-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className={`${surfaceCardClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-slate-100/80 border-b border-slate-200">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Availability</th>
                    <th className="px-4 py-3 font-semibold">Visibility Status</th>
                    <th className="px-4 py-3 font-semibold">Eco Visibility</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((property) => {
                    const isVisible = isPubliclyVisibleByEcoRules(property);
                    return (
                      <tr key={property._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{property.title || "Untitled"}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {property.location?.address || "No address"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{property.ownerId || "Unknown"}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                            {property.availabilityStatus || "available"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={property.visibilityStatus || "auto"}
                            onChange={(e) => updateVisibilityStatus(property._id, e.target.value)}
                            disabled={savingVisibilityIds.includes(property._id)}
                            className="rounded-lg border border-slate-300 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
                          >
                            <option value="auto">auto</option>
                            <option value="visible">visible</option>
                            <option value="hidden">hidden</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {isVisible ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Eye className="w-3.5 h-3.5" /> Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                              <EyeOff className="w-3.5 h-3.5" /> Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                            {property.createdAt ? new Date(property.createdAt).toLocaleString() : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/properties/${property._id}`}
                            className="inline-flex rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-300"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/75 backdrop-blur-md p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.5)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}
