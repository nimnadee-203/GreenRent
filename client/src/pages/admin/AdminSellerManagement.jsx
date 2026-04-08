import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ShieldCheck, UserCheck } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminSellerManagement() {
  const { backendUser } = useAuth();
  const [sellerRequests, setSellerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingSellerIds, setApprovingSellerIds] = useState([]);
  const surfaceCardClass = "rounded-3xl border border-white/60 bg-white/75 backdrop-blur-md shadow-[0_16px_45px_-24px_rgba(15,23,42,0.45)]";
  const secondaryButtonClass = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 font-semibold hover:bg-white hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300";

  const fetchSellerRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/admin/seller-requests`, {
        withCredentials: true,
      });
      setSellerRequests(Array.isArray(response.data?.requests) ? response.data.requests : []);
    } catch (err) {
      setSellerRequests([]);
      setError(err?.response?.data?.message || "Failed to fetch seller requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backendUser?.role === "admin") {
      fetchSellerRequests();
    } else {
      setLoading(false);
    }
  }, [backendUser?.role]);

  const approveSellerRequest = async (userId) => {
    if (!userId || approvingSellerIds.includes(userId)) return;
    setApprovingSellerIds((prev) => [...prev, userId]);

    try {
      await axios.patch(`${API_BASE_URL}/api/auth/approve-seller/${userId}`, {}, { withCredentials: true });
      await fetchSellerRequests();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve seller request.");
    } finally {
      setApprovingSellerIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  if (backendUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_48%,_#f1f5f9_100%)]">
        <Navbar />
        <main className="w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h1 className="text-xl font-bold">Admin Access Required</h1>
            <p className="mt-2 text-sm">Only admins can manage seller requests.</p>
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
                <ShieldCheck className="w-8 h-8 text-emerald-600" /> Seller Management
              </h1>
              <p className="text-slate-600 mt-2">Review pending seller applications and approve users into the seller role.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/my-listings" className={secondaryButtonClass}>
                <ArrowLeft className="w-4 h-4" /> Back to Overview & Listings
              </Link>
            </div>
          </div>
        </section>

        <div className={`${surfaceCardClass} p-5 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5" /> Pending Seller Requests
              </h2>
              <p className="text-sm text-emerald-800/80 mt-1">
                Approve these requests to unlock seller access for the user.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-emerald-200 text-emerald-900 w-fit">
              {sellerRequests.length} pending
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-emerald-900/80">Loading seller requests...</p>
          ) : error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : sellerRequests.length === 0 ? (
            <p className="text-sm text-emerald-900/80">No pending seller requests right now.</p>
          ) : (
            <div className="space-y-3">
              {sellerRequests.map((request) => {
                const app = request?.sellerApplication || {};
                const approving = approvingSellerIds.includes(request._id);
                return (
                  <div key={request._id} className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-[0_10px_30px_-20px_rgba(16,185,129,0.35)]">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-1.5">
                        <p className="font-semibold text-slate-900">{request?.name || app.sellerName || "Unknown user"}</p>
                        <p className="text-sm text-slate-600">{request?.email || "-"}</p>
                        <p className="text-sm text-slate-700">
                          Seller Name: <span className="font-medium">{app.sellerName || "-"}</span>
                        </p>
                        <p className="text-sm text-slate-700">
                          Business Name: <span className="font-medium">{app.businessName || "-"}</span>
                        </p>
                        <p className="text-sm text-slate-700">
                          Contact Number: <span className="font-medium">{app.contactNumber || "-"}</span>
                        </p>
                        <p className="text-sm text-slate-700">
                          Selling Plan:{" "}
                          <span className="font-medium">
                            {app.sellingPlan === "business_property"
                              ? "Business Property"
                              : app.sellingPlan === "personal_property"
                                ? "Personal Property"
                                : "-"}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Requested: {request?.updatedAt ? new Date(request.updatedAt).toLocaleString() : "-"}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap lg:justify-end">
                        <button
                          type="button"
                          onClick={() => approveSellerRequest(request._id)}
                          disabled={approving}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 disabled:opacity-60"
                        >
                          <UserCheck className="w-4 h-4" />
                          {approving ? "Approving..." : "Approve Seller"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
