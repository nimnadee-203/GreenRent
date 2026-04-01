import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, ExternalLink, MessageSquareWarning, Trash2 } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminReviews() {
  const { backendUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingIds, setActionLoadingIds] = useState([]);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/renter-reviews/admin/list`, {
        params: statusFilter === "all" ? {} : { status: statusFilter },
        withCredentials: true,
      });
      setReviews(Array.isArray(response.data?.reviews) ? response.data.reviews : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backendUser?.role === "admin") {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [backendUser?.role, statusFilter]);

  const setActionLoading = (reviewId, isLoading) => {
    setActionLoadingIds((prev) =>
      isLoading ? [...prev, reviewId] : prev.filter((id) => id !== reviewId)
    );
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      setActionLoading(reviewId, true);
      await axios.patch(
        `${API_BASE_URL}/api/renter-reviews/${reviewId}/status`,
        { status },
        { withCredentials: true }
      );
      await fetchReviews();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update review status.");
    } finally {
      setActionLoading(reviewId, false);
    }
  };

  const deleteReview = async (reviewId) => {
    const confirmed = window.confirm("Delete this review permanently?");
    if (!confirmed) return;

    try {
      setActionLoading(reviewId, true);
      await axios.delete(`${API_BASE_URL}/api/renter-reviews/${reviewId}`, {
        withCredentials: true,
      });
      await fetchReviews();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete review.");
    } finally {
      setActionLoading(reviewId, false);
    }
  };

  if (backendUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="text-xl font-bold">Admin Access Required</h1>
            <p className="mt-2 text-sm">Only admins can manage renter reviews.</p>
            <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold border border-red-200 hover:bg-red-100">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm mb-8">
          <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 w-52 h-52 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-emerald-700 font-semibold mb-1">Admin Space</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                Review Management
              </h1>
              <p className="text-slate-600 mt-2">Hide, unhide, view, or delete user reviews from one place.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/admin/listings" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
                Listings View
              </Link>
              <Link to="/chat" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">
                Chat
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="mb-6 flex items-center justify-end">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <option value="all">All</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Loading reviews...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No reviews found for this filter.</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const loadingAction = actionLoadingIds.includes(review._id);
              return (
                <div key={review._id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquareWarning className="w-4 h-4 text-amber-600" />
                        {review.renterName || "Anonymous"} • Score {review.totalScore}/10
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Listing: {review.listingId} • {new Date(review.createdAt).toLocaleString()} • Status: <span className="font-semibold uppercase">{review.status === "rejected" ? "hidden" : review.status}</span>
                      </p>
                      {review.review && (
                        <p className="text-sm text-slate-700 mt-2 line-clamp-2">{review.review}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link
                        to={`/properties/${review.listingId}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>

                      <button
                        type="button"
                        disabled={loadingAction}
                        onClick={() => updateReviewStatus(review._id, review.status === "approved" ? "hidden" : "approved")}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                      >
                        {review.status === "approved" ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Unhide
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={loadingAction}
                        onClick={() => deleteReview(review._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
