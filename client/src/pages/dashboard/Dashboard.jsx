import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Home/Navbar';
import { useAuth } from '../../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { CalendarDays, Clock3, CreditCard, Home, MapPin, MessageSquarePlus, Pencil, Search, Star, Trash2, XCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const REVIEW_DEFAULTS = {
  energyEfficiency: 5,
  waterEfficiency: 5,
  wasteManagement: 5,
  transitAccess: 5,
  greenAmenities: 5,
};

const livingDurationOptions = ['< 3 months', '3-6 months', '6-12 months', '1-2 years', '> 2 years'];

const statusBadgeClass = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-rose-100 text-rose-700',
};

const PAYMENT_TIMEOUT_MS = 15 * 60 * 1000;

const getPaymentRemainingMs = (booking) => {
  if (booking?.status !== 'pending' || booking?.paymentStatus === 'paid') return 0;
  const dueAt = booking?.paymentDueAt
    ? new Date(booking.paymentDueAt).getTime()
    : booking?.createdAt
      ? new Date(booking.createdAt).getTime() + 15 * 60 * 1000
      : null;
  if (!dueAt || Number.isNaN(dueAt)) return 0;
  return Math.max(0, dueAt - Date.now());
};

const getPaymentProgress = (booking) => {
  if (booking?.status !== 'pending' || booking?.paymentStatus === 'paid') return 0;
  const totalWindow = booking?.paymentDueAt || booking?.createdAt ? PAYMENT_TIMEOUT_MS : 0;
  if (!totalWindow) return 0;
  const remainingMs = getPaymentRemainingMs(booking);
  return Math.max(0, Math.min(100, (remainingMs / totalWindow) * 100));
};

const formatRemaining = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function Dashboard() {
  const { currentUser, backendUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [reviewedListingIds, setReviewedListingIds] = useState(new Set());
  const [myReviewsByListing, setMyReviewsByListing] = useState({});
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEcoRatingId, setSelectedEcoRatingId] = useState('');
  const [editingReviewId, setEditingReviewId] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingTarget, setCancelBookingTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelError, setCancelError] = useState('');
  const [criteria, setCriteria] = useState({ ...REVIEW_DEFAULTS });
  const [reviewText, setReviewText] = useState('');
  const [livingDuration, setLivingDuration] = useState('< 3 months');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [, setClockNow] = useState(Date.now());

  const userRole = backendUser?.role;
  const isAdmin = userRole === 'admin';
  const isSeller = userRole === 'seller';
  const isUserDashboard = !isAdmin && !isSeller;
  const userName =
    backendUser?.name ||
    backendUser?.fullName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Guest';

  const bookingCounts = useMemo(() => {
    const counts = { all: bookings.length, confirmed: 0, pending: 0, cancelled: 0, completed: 0 };
    bookings.forEach((booking) => {
      if (counts[booking?.status] !== undefined) counts[booking.status] += 1;
    });
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter((booking) => booking?.status === bookingFilter);
  }, [bookings, bookingFilter]);

  const dashboardStats = useMemo(() => {
    const today = new Date();
    const upcoming = bookings.filter((booking) => booking?.status === 'confirmed' && new Date(booking.checkInDate) >= today).length;
    const completed = bookings.filter((booking) => booking?.status === 'completed').length;
    const paid = bookings.filter((booking) => booking?.paymentStatus === 'paid').length;
    return [
      { label: 'Total Bookings', value: bookingCounts.all, icon: CalendarDays },
      { label: 'Upcoming Stays', value: upcoming, icon: Clock3 },
      { label: 'Completed Stays', value: completed, icon: Home },
      { label: 'Paid Reservations', value: paid, icon: CreditCard },
    ];
  }, [bookings, bookingCounts.all]);

  const fetchMyReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/renter-reviews/my/reviews`, {
        withCredentials: true,
      });
      const reviews = response.data?.reviews || [];
      const ids = new Set(reviews.map((review) => review?.listingId).filter(Boolean));
      const mappedReviews = reviews.reduce((acc, review) => {
        if (review?.listingId) {
          acc[review.listingId] = review;
        }
        return acc;
      }, {});
      setReviewedListingIds(ids);
      setMyReviewsByListing(mappedReviews);
    } catch (error) {
      setReviewedListingIds(new Set());
      setMyReviewsByListing({});
    }
  };

  const fetchDashboardData = async () => {
    if (!backendUser || !isUserDashboard) {
      setBookings([]);
      return;
    }

    try {
      setBookingsLoading(true);
      setBookingsError('');
      const response = await axios.get(`${API_BASE_URL}/api/bookings/my`, { withCredentials: true });
      setBookings(Array.isArray(response.data?.bookings) ? response.data.bookings : []);
      await fetchMyReviews();
    } catch (error) {
      setBookingsError(error?.response?.data?.message || 'Failed to load your dashboard data.');
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [backendUser?._id, backendUser?.id, isUserDashboard]);

  useEffect(() => {
    const hasActivePaymentWindow = bookings.some((booking) => getPaymentRemainingMs(booking) > 0);
    if (!hasActivePaymentWindow) return undefined;

    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [bookings]);

  const setBookingActionLoading = (bookingId, isLoading) => {
    setActionLoadingById((prev) => ({ ...prev, [bookingId]: isLoading }));
  };

  const openCancelModal = (booking) => {
    setCancelBookingTarget(booking);
    setCancelReason('');
    setCancelStep(1);
    setCancelError('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelBookingTarget(null);
    setCancelReason('');
    setCancelStep(1);
    setCancelError('');
  };

  const handleCancelBooking = async () => {
    const bookingId = cancelBookingTarget?._id;
    if (!bookingId) return;

    try {
      setBookingActionLoading(bookingId, true);
      setCancelError('');
      await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        { cancellationReason: cancelReason },
        { withCredentials: true }
      );
      await fetchDashboardData();
      closeCancelModal();
    } catch (error) {
      setCancelError(error?.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setBookingActionLoading(bookingId, false);
    }
  };

  const handleRequestRefund = async (booking) => {
    const confirmed = window.confirm('Submit a refund request for this booking?');
    if (!confirmed) return;

    const reason = window.prompt('Optional: refund reason', '') || '';

    try {
      setBookingActionLoading(booking._id, true);
      setReviewError('');
      await axios.put(
        `${API_BASE_URL}/api/bookings/${booking._id}/refund-request`,
        { refundReason: reason },
        { withCredentials: true }
      );
      await fetchDashboardData();
    } catch (error) {
      setReviewError(error?.response?.data?.message || 'Failed to request refund.');
    } finally {
      setBookingActionLoading(booking._id, false);
    }
  };

  const openReviewModal = async (booking, existingReview = null) => {
    try {
      setReviewError('');
      setReviewLoading(true);
      const listingId = booking?.apartmentId?._id;
      if (!listingId) {
        setReviewError('This booking does not have a valid listing.');
        return;
      }

      let ecoRatingId = existingReview?.ecoRatingId;
      if (!ecoRatingId) {
        const ecoRes = await axios.get(`${API_BASE_URL}/api/eco-ratings?listingId=${listingId}`);
        const ecoRating = Array.isArray(ecoRes.data) ? ecoRes.data[0] : null;
        ecoRatingId = ecoRating?._id;
      }
      if (!ecoRatingId) {
        setReviewError('This property does not have an eco-rating yet, so review is not available.');
        return;
      }

      setSelectedBooking(booking);
      setSelectedEcoRatingId(ecoRatingId);
      setEditingReviewId(existingReview?._id || '');
      setCriteria(existingReview?.criteria ? { ...REVIEW_DEFAULTS, ...existingReview.criteria } : { ...REVIEW_DEFAULTS });
      setReviewText(existingReview?.review || '');
      setLivingDuration(existingReview?.livingDuration || '< 3 months');
      setWouldRecommend(typeof existingReview?.wouldRecommend === 'boolean' ? existingReview.wouldRecommend : true);
      setReviewModalOpen(true);
    } catch (error) {
      setReviewError(error?.response?.data?.message || 'Failed to open review form.');
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedBooking(null);
    setSelectedEcoRatingId('');
    setEditingReviewId('');
    setReviewError('');
  };

  const deleteReview = async (booking) => {
    const listingId = booking?.apartmentId?._id;
    const review = listingId ? myReviewsByListing[listingId] : null;
    if (!review?._id) return;

    const confirmed = window.confirm('Delete your review for this apartment?');
    if (!confirmed) return;

    try {
      setBookingActionLoading(booking._id, true);
      setReviewError('');
      await axios.delete(`${API_BASE_URL}/api/renter-reviews/${review._id}`, {
        withCredentials: true,
      });
      await fetchMyReviews();
    } catch (error) {
      setReviewError(error?.response?.data?.message || 'Failed to delete review.');
    } finally {
      setBookingActionLoading(booking._id, false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!selectedBooking?.apartmentId?._id || !selectedEcoRatingId) {
      setReviewError('Review data is incomplete.');
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError('');
      const payload = {
        listingId: selectedBooking.apartmentId._id,
        ecoRatingId: selectedEcoRatingId,
        criteria,
        review: reviewText,
        livingDuration,
        wouldRecommend,
      };

      if (editingReviewId) {
        await axios.put(`${API_BASE_URL}/api/renter-reviews/${editingReviewId}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/renter-reviews`, payload, {
          withCredentials: true,
        });
      }

      await fetchMyReviews();
      closeReviewModal();
    } catch (error) {
      setReviewError(error?.response?.data?.message || error?.response?.data?.errors?.[0] || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const canReviewBooking = (booking) => {
    const listingId = booking?.apartmentId?._id;
    const status = booking?.status;
    const eligibleStatus = status === 'confirmed' || status === 'completed';
    return Boolean(eligibleStatus && listingId && !reviewedListingIds.has(listingId));
  };

  const canManageReview = (booking) => {
    const listingId = booking?.apartmentId?._id;
    const status = booking?.status;
    const eligibleStatus = status === 'confirmed' || status === 'completed';
    return Boolean(eligibleStatus && listingId && myReviewsByListing[listingId]?._id);
  };

  // Redirect admins and sellers to their dedicated workspaces
  if (isAdmin) {
    return <Navigate to="/admin/listings" replace />;
  }

  if (isSeller) {
    return <Navigate to="/my-listings" replace />;
  }

  if (!isUserDashboard) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">This dashboard is renter-only</h1>
            <p className="text-slate-600 mb-6">Use your dedicated workspace for property management tasks.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/my-listings" className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">My Listings</Link>
              <Link to="/admin/listings" className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50">Admin Listings</Link>
              <Link to="/properties" className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800">Browse Properties</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_45%,_#f8fafc_100%)]">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm mb-8">
          <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 w-52 h-52 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-emerald-700 font-semibold">Renter Space</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-1">Welcome, {userName}</h1>
              <p className="text-slate-600 mt-2">Track bookings, revisit your stays, and submit reviews only for properties you have booked.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/properties" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
                <Search size={16} />
                Find Properties
              </Link>
              <Link to="/wishlist" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">
                <Star size={16} />
                Wishlist
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-3">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="text-xl font-bold text-slate-900">My Booking History</h2>
            <div className="flex flex-wrap gap-2">
              {['all', 'confirmed', 'completed', 'pending', 'cancelled'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBookingFilter(key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                    bookingFilter === key
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} ({bookingCounts[key] || 0})
                </button>
              ))}
            </div>
          </div>

          {reviewError && !reviewModalOpen && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{reviewError}</div>
          )}

          {bookingsLoading ? (
            <p className="text-slate-500 text-sm">Loading your bookings...</p>
          ) : bookingsError ? (
            <p className="text-red-600 text-sm">{bookingsError}</p>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-slate-600">No bookings found for this filter.</p>
              <Link to="/properties" className="inline-flex mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Explore Listings</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const listingId = booking?.apartmentId?._id;
                const reviewed = listingId && reviewedListingIds.has(listingId);
                const existingReview = listingId ? myReviewsByListing[listingId] : null;
                const bookingActionLoading = Boolean(actionLoadingById[booking._id]);
                const canCancel = booking?.status === 'pending' || booking?.status === 'confirmed';
                const canContinuePayment = booking?.status === 'pending' && booking?.paymentStatus !== 'paid';
                const paymentRemainingMs = getPaymentRemainingMs(booking);
                const paymentProgress = getPaymentProgress(booking);
                const canRequestRefund = booking?.status === 'cancelled' && booking?.paymentStatus === 'paid' && !['requested', 'approved', 'refunded'].includes(booking?.refundStatus || 'none');
                const canManageExistingReview = canManageReview(booking);
                return (
                  <article key={booking._id} className="rounded-2xl border border-slate-200 p-4 md:p-5 bg-slate-50/60">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900">{booking.apartmentId?.title || 'Property Booking'}</h3>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadgeClass[booking.status] || 'bg-slate-100 text-slate-700'}`}>
                            {booking.status || 'pending'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <MapPin size={15} className="text-slate-500" />
                          {booking.apartmentId?.location?.address || 'Address unavailable'}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <CalendarDays size={15} className="text-slate-500" />
                          {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()} ({booking.stayType === 'long' ? 'Long Stay' : 'Short Stay'})
                        </p>
                        <p className="text-sm text-slate-600">Total: Rs {Number(booking.totalPrice || 0).toLocaleString('en-LK')}</p>
                        <p className="text-sm text-slate-600">Payment: <span className="font-semibold">{booking.paymentStatus || 'unpaid'}</span></p>
                        {booking.refundStatus && booking.refundStatus !== 'none' && (
                          <p className="text-xs text-indigo-700">Refund status: {booking.refundStatus}</p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap lg:justify-end">
                        {canContinuePayment ? (
                          <Link to={`/payment/${booking._id}`} className="px-3.5 py-2 rounded-xl border border-blue-300 text-blue-700 text-sm font-semibold hover:bg-blue-50">
                            View Booking
                          </Link>
                        ) : listingId ? (
                          <Link to={`/properties/${listingId}`} className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-white">
                            View Property
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => openReviewModal(booking)}
                          disabled={!canReviewBooking(booking) || reviewLoading || bookingActionLoading}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MessageSquarePlus size={15} />
                          {reviewed ? 'Reviewed' : 'Rate & Review'}
                        </button>

                        {existingReview && (
                          <button
                            type="button"
                            onClick={() => openReviewModal(booking, existingReview)}
                            disabled={!canManageExistingReview || reviewLoading || bookingActionLoading}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Pencil size={15} />
                            Update Review
                          </button>
                        )}

                        {existingReview && (
                          <button
                            type="button"
                            onClick={() => deleteReview(booking)}
                            disabled={!canManageExistingReview || bookingActionLoading}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={15} />
                            Delete Review
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openCancelModal(booking)}
                          disabled={!canCancel || bookingActionLoading}
                          className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bookingActionLoading ? 'Please wait...' : 'Cancel Booking'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRequestRefund(booking)}
                          disabled={!canRequestRefund || bookingActionLoading}
                          className="px-3.5 py-2 rounded-xl border border-indigo-200 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Request Refund
                        </button>
                      </div>
                    </div>

                    {!canReviewBooking(booking) && !reviewed && (
                      <p className="text-xs text-slate-500 mt-3">Reviews are available only for confirmed or completed bookings.</p>
                    )}
                    {existingReview && !canManageExistingReview && (
                      <p className="text-xs text-slate-500 mt-3">You can update/delete this review only while this apartment is in your current or previously completed stays.</p>
                    )}
                    {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                      <div className={`mt-3 rounded-2xl border px-4 py-3 shadow-sm ${paymentRemainingMs > 0 ? 'border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50' : 'border-rose-200 bg-gradient-to-r from-rose-50 via-white to-pink-50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${paymentRemainingMs > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            <Clock3 size={17} />
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-bold ${paymentRemainingMs > 0 ? 'text-amber-900' : 'text-rose-900'}`}>
                              {paymentRemainingMs > 0 ? `Payment expires in ${formatRemaining(paymentRemainingMs)}` : 'Payment window expired'}
                            </div>
                            <p className={`text-xs mt-1 ${paymentRemainingMs > 0 ? 'text-amber-800' : 'text-rose-700'}`}>
                              {paymentRemainingMs > 0
                                ? 'Complete the payment to keep this booking active and continue to the property page.'
                                : 'This booking will stay expired unless a new booking session is created.'}
                            </p>
                            {paymentRemainingMs > 0 && (
                              <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-1000"
                                  style={{ width: `${Math.max(8, paymentProgress)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showCancelModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Cancel Booking</h3>
              <button
                type="button"
                onClick={closeCancelModal}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                disabled={Boolean(cancelBookingTarget?._id && actionLoadingById[cancelBookingTarget._id])}
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {cancelStep === 1 ? (
                <>
                  <p className="text-sm text-slate-700">Do you want to cancel this booking?</p>
                  <p className="text-xs text-slate-500">If you choose Yes, you can add an optional reason in the next step.</p>

                  {cancelError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{cancelError}</div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeCancelModal}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                      disabled={Boolean(cancelBookingTarget?._id && actionLoadingById[cancelBookingTarget._id])}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelStep(2)}
                      className="w-1/2 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
                      disabled={Boolean(cancelBookingTarget?._id && actionLoadingById[cancelBookingTarget._id])}
                    >
                      Yes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-700">You are about to cancel this booking.</p>
                  <p className="text-xs text-slate-500">This action will mark the booking as cancelled.</p>

                  {cancelError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{cancelError}</div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Reason (optional)</label>
                    <textarea
                      rows={4}
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      placeholder="Tell us why you are cancelling"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setCancelStep(1)}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                      disabled={Boolean(cancelBookingTarget?._id && actionLoadingById[cancelBookingTarget._id])}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelBooking}
                      disabled={Boolean(cancelBookingTarget?._id && actionLoadingById[cancelBookingTarget._id])}
                      className="w-1/2 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                      {Boolean(cancelBookingTarget?._id && actionLoadingById[cancelBookingTarget._id]) ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {reviewModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">{editingReviewId ? 'Update Your Review' : 'Rate Your Stay'}</h3>
              <button type="button" onClick={closeReviewModal} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={submitReview} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {Object.entries(criteria).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <span className="text-sm font-bold text-emerald-700">{value}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={value}
                    onChange={(event) => setCriteria((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Living Duration</label>
                <select value={livingDuration} onChange={(event) => setLivingDuration(event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5">
                  {livingDurationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Review</label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Share your real experience as a renter"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={wouldRecommend} onChange={(event) => setWouldRecommend(event.target.checked)} />
                I would recommend this property
              </label>

              {reviewError && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{reviewError}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeReviewModal} className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={reviewLoading} className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">
                  {reviewLoading ? 'Saving...' : editingReviewId ? 'Save Changes' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
