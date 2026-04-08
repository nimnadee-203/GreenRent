import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Bell, CalendarDays, ChevronDown, ChevronUp, Eye, Mail, ShieldCheck, Trash2, XCircle } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const toDisplayDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "2-digit" });
};

const toDisplayDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLkr = (value) => {
  const numeric = Number(value || 0);
  return `Rs ${numeric.toLocaleString("en-LK")}`;
};

const getRenterDetails = (booking) => {
  const user = booking?.userId;
  if (user && typeof user === "object") {
    return {
      id: user._id || "-",
      name: user.name || "Unknown user",
      email: user.email || "",
    };
  }

  return {
    id: typeof user === "string" ? user : "-",
    name: "Unknown user",
    email: "",
  };
};

const getPropertyDetails = (booking) => {
  const property = booking?.apartmentId;
  if (property && typeof property === "object") {
    return {
      id: property._id || "",
      title: property.title || "Unknown property",
      address: property?.location?.address || "",
    };
  }

  return {
    id: typeof property === "string" ? property : "",
    title: "Unknown property",
    address: "",
  };
};

const bookingBadgeClass = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  expired: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function AdminBookings() {
  const { backendUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [showAllRows, setShowAllRows] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const surfaceCardClass = "rounded-3xl border border-white/60 bg-white/75 backdrop-blur-md shadow-[0_16px_45px_-24px_rgba(15,23,42,0.45)]";
  const secondaryButtonClass = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 font-semibold hover:bg-white hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300";

  const isAdmin = backendUser?.role === "admin";

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings`, {
        withCredentials: true,
      });
      setBookings(Array.isArray(response.data?.bookings) ? response.data.bookings : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [isAdmin]);

  const filteredBookings = useMemo(() => {
    const normalizedUser = userFilter.trim().toLowerCase();
    const normalizedProperty = propertyFilter.trim().toLowerCase();

    return bookings.filter((booking) => {
      const renter = getRenterDetails(booking);
      const property = getPropertyDetails(booking);

      const checkIn = booking?.checkInDate ? new Date(booking.checkInDate) : null;
      const matchesFromDate = fromDate ? (checkIn ? checkIn >= new Date(`${fromDate}T00:00:00`) : false) : true;
      const matchesToDate = toDate ? (checkIn ? checkIn <= new Date(`${toDate}T23:59:59`) : false) : true;

      const matchesUser = normalizedUser
        ? [renter.name, renter.email, renter.id].filter(Boolean).join(" ").toLowerCase().includes(normalizedUser)
        : true;

      const matchesStatus = statusFilter === "all" ? true : booking?.status === statusFilter;

      const matchesProperty = normalizedProperty
        ? [property.title, property.address, property.id].filter(Boolean).join(" ").toLowerCase().includes(normalizedProperty)
        : true;

      return matchesFromDate && matchesToDate && matchesUser && matchesStatus && matchesProperty;
    });
  }, [bookings, fromDate, toDate, userFilter, statusFilter, propertyFilter]);

  const rowLimit = 20;
  const visibleBookings = useMemo(
    () => (showAllRows ? filteredBookings : filteredBookings.slice(0, rowLimit)),
    [filteredBookings, showAllRows]
  );

  const refundRequestNotifications = useMemo(() => {
    return bookings
      .filter((booking) => booking?.status === "cancelled" && booking?.paymentStatus === "paid" && booking?.refundStatus === "requested")
      .sort((a, b) => new Date(b?.refundRequestedAt || b?.updatedAt || 0) - new Date(a?.refundRequestedAt || a?.updatedAt || 0));
  }, [bookings]);

  useEffect(() => {
    setShowAllRows(false);
  }, [fromDate, toDate, userFilter, statusFilter, propertyFilter]);

  const setActionLoading = (bookingId, isLoading) => {
    setActionLoadingById((prev) => ({ ...prev, [bookingId]: isLoading }));
  };

  const handleCancelBooking = async (booking) => {
    if (!booking?._id) return;
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    try {
      setActionLoading(booking._id, true);
      await axios.put(
        `${API_BASE_URL}/api/bookings/${booking._id}/status`,
        { status: "cancelled" },
        { withCredentials: true }
      );
      await fetchBookings();
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActionLoading(booking._id, false);
    }
  };

  const handleDeleteBooking = async (booking) => {
    if (!booking?._id) return;
    const confirmed = window.confirm("Delete this booking permanently from database?");
    if (!confirmed) return;

    try {
      setActionLoading(booking._id, true);
      await axios.delete(`${API_BASE_URL}/api/bookings/${booking._id}`, {
        withCredentials: true,
      });
      setSelectedBooking((prev) => (prev?._id === booking._id ? null : prev));
      await fetchBookings();
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to delete booking.");
    } finally {
      setActionLoading(booking._id, false);
    }
  };

  const handleApproveRefund = async (booking) => {
    if (!booking?._id) return;
    try {
      setActionLoading(booking._id, true);
      await axios.put(
        `${API_BASE_URL}/api/bookings/${booking._id}/refund`,
        {},
        { withCredentials: true }
      );
      await fetchBookings();
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to approve refund request.");
    } finally {
      setActionLoading(booking._id, false);
    }
  };

  const handleRejectRefund = async (booking) => {
    if (!booking?._id) return;
    const reason = window.prompt("Optional rejection reason:", "") || "";
    try {
      setActionLoading(booking._id, true);
      await axios.put(
        `${API_BASE_URL}/api/bookings/${booking._id}/refund/reject`,
        { refundReason: reason },
        { withCredentials: true }
      );
      await fetchBookings();
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to reject refund request.");
    } finally {
      setActionLoading(booking._id, false);
    }
  };

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setUserFilter("");
    setStatusFilter("all");
    setPropertyFilter("");
    setShowAllRows(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_48%,_#f1f5f9_100%)]">
        <Navbar />
        <main className="w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h1 className="text-xl font-bold">Admin Access Required</h1>
            <p className="mt-2 text-sm">Only admins can access booking management.</p>
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
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-white/85 via-emerald-50/65 to-cyan-50/60 backdrop-blur-sm shadow-[0_24px_60px_-28px_rgba(16,185,129,0.4)] mb-6">
          <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-emerald-300/45 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 w-52 h-52 rounded-full bg-cyan-300/35 blur-3xl" />
          <div className="relative p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 font-bold mb-1">Admin Space</p>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-emerald-600" /> Booking Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Monitor bookings, process refunds, and manage renter communication.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setNotificationModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50/90 text-red-700 font-semibold hover:bg-red-100 transition-all duration-300"
              >
                <Bell className="w-4 h-4" />
                Notifications
                <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold px-2 py-0.5 min-w-[1.4rem]">
                  {refundRequestNotifications.length}
                </span>
              </button>
              <Link to="/my-listings" className={secondaryButtonClass}>
                <ArrowLeft className="w-4 h-4" /> Back to Overview & Listings
              </Link>
            </div>
          </div>
        </section>

        <section className={`${surfaceCardClass} p-4 md:p-5 mb-5`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-bold text-slate-800">Filters</p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <label className="text-sm text-slate-600">
              From date
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/90 px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm text-slate-600">
              To date
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/90 px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm text-slate-600">
              User filter
              <input
                type="text"
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                placeholder="Name, email, or user id"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/90 px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm text-slate-600">
              Status filter
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/90 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </label>

            <label className="text-sm text-slate-600">
              Property filter
              <input
                type="text"
                value={propertyFilter}
                onChange={(event) => setPropertyFilter(event.target.value)}
                placeholder="Title, address, or property id"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/90 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Bookings: <span className="font-bold text-slate-900">{filteredBookings.length}</span>
          </p>
        </div>

        {loading ? (
          <div className={`${surfaceCardClass} p-6 text-slate-600`}>Loading bookings...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-red-700 shadow-sm">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div className={`${surfaceCardClass} p-6 text-slate-600`}>No bookings found for selected filters.</div>
        ) : (
          <div className={`${surfaceCardClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">No.</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Booking ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Renter</th>
                    <th className="px-4 py-3 text-left font-semibold">Property / Apartment</th>
                    <th className="px-4 py-3 text-left font-semibold">Check-in / Check-out</th>
                    <th className="px-4 py-3 text-left font-semibold">Booking status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((booking, index) => {
                    const renter = getRenterDetails(booking);
                    const property = getPropertyDetails(booking);
                    const bookingActionLoading = Boolean(actionLoadingById[booking._id]);

                    return (
                      <tr key={booking._id} className="border-b border-slate-100 hover:bg-white/80 align-top">
                        <td className="px-4 py-3 text-slate-500 font-semibold">{index + 1}</td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {toDisplayDate(booking?.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 max-w-[220px] break-all">{booking._id}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{renter.name}</p>
                          <p className="text-xs text-slate-500">{renter.email || renter.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{property.title}</p>
                          <p className="text-xs text-slate-500">{property.address || property.id || "-"}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          <p className="inline-flex items-center gap-1 whitespace-nowrap">
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                            {toDisplayDate(booking?.checkInDate)} - {toDisplayDate(booking?.checkOutDate)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${bookingBadgeClass[booking?.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                            {booking?.status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(booking)}
                              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>

                            <button
                              type="button"
                              disabled={bookingActionLoading || booking?.status === "cancelled"}
                              onClick={() => handleCancelBooking(booking)}
                              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-100 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={bookingActionLoading}
                              onClick={() => handleDeleteBooking(booking)}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-100 disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length > rowLimit && (
                    <tr>
                      <td colSpan={8} className="px-4 py-3 border-t border-slate-100 bg-slate-50/80 text-center">
                        <button
                          type="button"
                          onClick={() => setShowAllRows((prev) => !prev)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {showAllRows ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {showAllRows ? "Show first 20" : `Show all (${filteredBookings.length})`}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedBooking && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Booking Full Details</h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-auto space-y-4 bg-slate-50">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Booking ID</p>
                <p className="text-sm font-semibold text-slate-900 break-all mt-1">{selectedBooking._id}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Renter Details</p>
                  <p className="text-sm font-semibold text-slate-900 mt-2">{getRenterDetails(selectedBooking).name}</p>
                  <p className="text-sm text-slate-600 mt-1">{getRenterDetails(selectedBooking).email || "Email not available"}</p>
                  <p className="text-xs text-slate-500 mt-1">User ID: {getRenterDetails(selectedBooking).id}</p>
                  {getRenterDetails(selectedBooking).email ? (
                    <a
                      href={`mailto:${getRenterDetails(selectedBooking).email}?subject=GreenRent Booking ${selectedBooking._id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 mt-3"
                    >
                      <Mail className="w-3.5 h-3.5" /> Contact renter
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 mt-3"
                    >
                      <Mail className="w-3.5 h-3.5" /> Contact renter
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Property / Apartment</p>
                  <p className="text-sm font-semibold text-slate-900 mt-2">{getPropertyDetails(selectedBooking).title}</p>
                  <p className="text-sm text-slate-600 mt-1">{getPropertyDetails(selectedBooking).address || "Address not available"}</p>
                  <p className="text-xs text-slate-500 mt-1">Property ID: {getPropertyDetails(selectedBooking).id || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Stay Period</p>
                  <p className="text-sm text-slate-700 mt-2">Check-in: <span className="font-semibold text-slate-900">{toDisplayDate(selectedBooking.checkInDate)}</span></p>
                  <p className="text-sm text-slate-700 mt-1">Check-out: <span className="font-semibold text-slate-900">{toDisplayDate(selectedBooking.checkOutDate)}</span></p>
                  <p className="text-sm text-slate-700 mt-1">Stay type: <span className="font-semibold text-slate-900 capitalize">{selectedBooking.stayType || "-"}</span></p>
                  <p className="text-sm text-slate-700 mt-1">Guests: <span className="font-semibold text-slate-900">{selectedBooking.numberOfGuests || 0}</span></p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Booking Summary</p>
                  <p className="text-sm text-slate-700 mt-2">Total price: <span className="font-semibold text-slate-900">{formatLkr(selectedBooking.totalPrice)}</span></p>
                  <p className="text-sm text-slate-700 mt-1">Booking status: <span className="font-semibold text-slate-900 capitalize">{selectedBooking.status || "-"}</span></p>
                  <p className="text-sm text-slate-700 mt-1">Refund status: <span className="font-semibold text-slate-900 capitalize">{selectedBooking.refundStatus || "none"}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
                  <p className="text-sm font-semibold text-slate-900 mt-2">{toDisplayDateTime(selectedBooking.createdAt)}</p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Last Updated</p>
                  <p className="text-sm font-semibold text-slate-900 mt-2">{toDisplayDateTime(selectedBooking.updatedAt)}</p>
                </div>
              </div>

              {(selectedBooking.cancellationReason || selectedBooking.refundReason) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  {selectedBooking.cancellationReason && (
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Cancellation reason:</span> {selectedBooking.cancellationReason}
                    </p>
                  )}
                  {selectedBooking.refundReason && (
                    <p className="text-sm text-amber-900 mt-2">
                      <span className="font-semibold">Refund reason:</span> {selectedBooking.refundReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {notificationModalOpen && (
        <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" /> Refund Notifications
              </h3>
              <button
                type="button"
                onClick={() => setNotificationModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-auto bg-slate-50 space-y-3">
              {refundRequestNotifications.length === 0 ? (
                <p className="text-sm text-slate-600">No pending refund notifications right now.</p>
              ) : (
                refundRequestNotifications.map((booking) => {
                  const renter = getRenterDetails(booking);
                  const property = getPropertyDetails(booking);
                  const loadingById = Boolean(actionLoadingById[booking._id]);

                  return (
                    <div key={booking._id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{property.title}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {renter.name} requested refund on {toDisplayDateTime(booking.refundRequestedAt || booking.updatedAt)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Booking ID: {booking._id}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveRefund(booking)}
                            disabled={loadingById}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRefund(booking)}
                            disabled={loadingById}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
