import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Home/Navbar';
import { useAuth } from '../../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { 
  CalendarDays, 
  Clock3, 
  CreditCard, 
  Eye, 
  Home, 
  MapPin, 
  MessageSquarePlus, 
  Pencil, 
  Search, 
  Star, 
  Trash2, 
  XCircle,
  User,
  Mail,
  Shield,
  Zap,
  Droplets,
  Wind,
  Recycle,
  BatteryCharging,
  Sun,
  ArrowUpRight,
  Settings,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  ChevronRight,
  Bus,
  Heart
} from 'lucide-react';
import axios from 'axios';
import SellerApplicationModal from '../../components/seller/SellerApplicationModal';

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
const CANCELLATION_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

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

function PreferenceItem({ icon: Icon, label, value }) {
  return (
    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 group/item hover:bg-emerald-100/50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <p className="font-bold text-slate-900 truncate capitalize">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, backendUser, fetchBackendUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [sellerListings, setSellerListings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');
  const [sellerError, setSellerError] = useState('');
  const [sellerUpgradeError, setSellerUpgradeError] = useState('');
  const [sellerUpgradeSuccess, setSellerUpgradeSuccess] = useState('');
  const [isSellerFormOpen, setIsSellerFormOpen] = useState(false);
  const [sellerTimeFilter, setSellerTimeFilter] = useState('all');
  const [sellerLastUpdated, setSellerLastUpdated] = useState(null);
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
  const [recommendations, setRecommendations] = useState([]);
  const [topMatch, setTopMatch] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [, setClockNow] = useState(Date.now());

  // Derive userPrefs directly from backendUser for instant synchronization
  const userPrefs = backendUser?.preferences;
  const isPreferenceSet = backendUser?.isPreferenceSet;

  const userRole = backendUser?.role;
  const isAdmin = userRole === 'admin';
  const isSeller = userRole === 'seller';
  const isUserDashboard = !isAdmin && !isSeller;
  const hasPendingSellerRequest = Boolean(backendUser?.sellerRequest);
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

  const toViewCount = (property) => {
    const count = property?.viewCount ?? property?.views ?? property?.totalViews ?? 0;
    const normalized = Number(count);
    if (Number.isNaN(normalized)) return 0;
    return Math.max(0, Math.round(normalized));
  };

  const filteredSellerListings = useMemo(() => {
    if (sellerTimeFilter === 'all') return sellerListings;

    const daysMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const days = daysMap[sellerTimeFilter];
    if (!days) return sellerListings;

    const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
    return sellerListings.filter((listing) => {
      const created = new Date(listing?.createdAt || 0).getTime();
      return !Number.isNaN(created) && created >= threshold;
    });
  }, [sellerListings, sellerTimeFilter]);

  const sellerAnalytics = useMemo(() => {
    const totalListings = filteredSellerListings.length;
    const activeListings = filteredSellerListings.filter(
      (listing) => listing?.availabilityStatus === 'available' && listing?.visibilityStatus !== 'hidden'
    ).length;

    const totalEco = filteredSellerListings.reduce((sum, listing) => sum + toEcoScore(listing), 0);
    const averageEcoScore = totalListings ? (totalEco / totalListings).toFixed(1) : '0.0';

    const mostViewedProperty = filteredSellerListings.reduce((top, listing) => {
      if (!top) return listing;
      return toViewCount(listing) > toViewCount(top) ? listing : top;
    }, null);

    return {
      totalListings,
      activeListings,
      averageEcoScore,
      mostViewedProperty,
      mostViewedCount: mostViewedProperty ? toViewCount(mostViewedProperty) : 0,
    };
  }, [filteredSellerListings]);

  const sellerChartData = useMemo(() => {
    const availability = {
      available: 0,
      rented: 0,
      archived: 0,
    };

    const ecoBands = {
      excellent: 0,
      good: 0,
      needsWork: 0,
    };

    filteredSellerListings.forEach((listing) => {
      const status = listing?.availabilityStatus;
      if (status === 'available' || status === 'rented' || status === 'archived') {
        availability[status] += 1;
      }

      const ecoScore = toEcoScore(listing);
      if (ecoScore >= 80) ecoBands.excellent += 1;
      else if (ecoScore >= 50) ecoBands.good += 1;
      else ecoBands.needsWork += 1;
    });

    const topViewed = [...filteredSellerListings]
      .sort((a, b) => toViewCount(b) - toViewCount(a))
      .slice(0, 5);

    const maxViews = topViewed.reduce((max, listing) => Math.max(max, toViewCount(listing)), 0);

    return {
      availability,
      ecoBands,
      topViewed,
      maxViews,
      total: filteredSellerListings.length,
    };
  }, [filteredSellerListings]);

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
      
      // Fetch Bookings
      const response = await axios.get(`${API_BASE_URL}/api/bookings/my`, { withCredentials: true });
      setBookings(Array.isArray(response.data?.bookings) ? response.data.bookings : []);
      
      // Fetch Recommendations Summary
      setRecommendationsLoading(true);
      const recRes = await axios.get(`${API_BASE_URL}/api/recommendations`, { withCredentials: true });
      
      if (recRes.data?.success) {
        setRecommendations(recRes.data.recommendations || []);
        if (recRes.data.recommendations?.length > 0) {
          setTopMatch(recRes.data.recommendations[0]);
        }
      }
      
      await fetchMyReviews();
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setBookingsError(error?.response?.data?.message || 'Failed to load your dashboard data.');
      setBookings([]);
    } finally {
      setBookingsLoading(false);
      setRecommendationsLoading(false);
    }
  };

  const fetchSellerAnalytics = useCallback(async ({ silent = false } = {}) => {
    if (!backendUser || !isSeller) {
      setSellerListings([]);
      return;
    }

    try {
      if (!silent) setSellerLoading(true);
      setSellerError('');
      const ownerId = backendUser?.id || backendUser?._id;

      if (!ownerId) {
        setSellerError('Could not determine seller account id.');
        setSellerListings([]);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/properties`, {
        params: { ownerId, sortBy: 'createdAt', sortOrder: 'desc' },
        withCredentials: true,
      });

      setSellerListings(Array.isArray(response.data) ? response.data : []);
      setSellerLastUpdated(new Date());
    } catch (error) {
      setSellerError(error?.response?.data?.message || 'Failed to load seller analytics.');
      setSellerListings([]);
    } finally {
      if (!silent) setSellerLoading(false);
    }
  }, [backendUser, isSeller]);

  useEffect(() => {
    fetchDashboardData();
  }, [backendUser?._id, backendUser?.id, isUserDashboard]);

  useEffect(() => {
    const hasActivePaymentWindow = bookings.some((booking) => getPaymentRemainingMs(booking) > 0);
    if (!hasActivePaymentWindow) return undefined;

    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [bookings]);

  useEffect(() => {
    if (!isSeller) return;
    fetchSellerAnalytics();
  }, [isSeller, fetchSellerAnalytics]);

  useEffect(() => {
    if (!isSeller) return undefined;

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      fetchSellerAnalytics({ silent: true });
    }, 15000);

    return () => clearInterval(intervalId);
  }, [isSeller, fetchSellerAnalytics]);

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

  const handleSellerApplicationSubmitted = async () => {
    setSellerUpgradeError('');
    await fetchBackendUser();
    setSellerUpgradeSuccess('Seller application submitted successfully. We will review your request soon.');
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

  if (!isUserDashboard && !isSeller) {
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

  if (isSeller) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_45%,_#f8fafc_100%)]">
        <Navbar />

        <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-10">
          <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm mb-8">
            <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-emerald-200/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-8 w-52 h-52 rounded-full bg-teal-200/40 blur-3xl" />
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-wider text-emerald-700 font-semibold">Seller Space</p>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-1">Listing Analytics</h1>
                <p className="text-slate-600 mt-2">Track listing performance, eco quality, and visibility from one place.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to="/add-apartment" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
                  <Home size={16} />
                  Add Property
                </Link>
                <Link to="/my-listings" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">
                  <Search size={16} />
                  My Listings
                </Link>
              </div>
            </div>
          </section>

          {sellerError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{sellerError}</div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Total Listings</p>
              <p className="text-3xl font-black text-slate-900 mt-3">{sellerLoading ? '...' : sellerAnalytics.totalListings}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Active Listings</p>
              <p className="text-3xl font-black text-slate-900 mt-3">{sellerLoading ? '...' : sellerAnalytics.activeListings}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Avg Eco Score</p>
              <p className="text-3xl font-black text-slate-900 mt-3">{sellerLoading ? '...' : sellerAnalytics.averageEcoScore}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Most Viewed Property</p>
              <p className="text-lg font-black text-slate-900 mt-3 line-clamp-1">{sellerLoading ? 'Loading...' : sellerAnalytics.mostViewedProperty?.title || 'No listings yet'}</p>
              {!sellerLoading && (
                <p className="mt-2 text-sm text-slate-600 inline-flex items-center gap-1.5">
                  <Eye size={14} className="text-slate-500" />
                  {sellerAnalytics.mostViewedCount} views
                </p>
              )}
            </div>
          </section>

          <section className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm w-fit">
              {[
                { key: 'all', label: 'All Time' },
                { key: '7d', label: '7D' },
                { key: '30d', label: '30D' },
                { key: '90d', label: '90D' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSellerTimeFilter(option.key)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                    sellerTimeFilter === option.key
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500">
                Live refresh every 15s
                {sellerLastUpdated ? ` | Last update: ${sellerLastUpdated.toLocaleTimeString()}` : ''}
              </p>
              <button
                type="button"
                onClick={() => fetchSellerAnalytics()}
                disabled={sellerLoading}
                className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sellerLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Listing Distribution</h2>
              <p className="text-sm text-slate-500 mt-1">Availability and eco quality mix</p>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-1.5">
                    <span>Available</span>
                    <span>{sellerChartData.availability.available}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${sellerChartData.total ? (sellerChartData.availability.available / sellerChartData.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-1.5">
                    <span>Rented</span>
                    <span>{sellerChartData.availability.rented}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${sellerChartData.total ? (sellerChartData.availability.rented / sellerChartData.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-1.5">
                    <span>Archived</span>
                    <span>{sellerChartData.availability.archived}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-slate-400"
                      style={{ width: `${sellerChartData.total ? (sellerChartData.availability.archived / sellerChartData.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-5">
                <div
                  className="w-24 h-24 rounded-full"
                  style={{
                    background: `conic-gradient(#10b981 0 ${(sellerChartData.total ? (sellerChartData.ecoBands.excellent / sellerChartData.total) * 100 : 0).toFixed(2)}%, #f59e0b ${(sellerChartData.total ? (sellerChartData.ecoBands.excellent / sellerChartData.total) * 100 : 0).toFixed(2)}% ${(
                      (sellerChartData.total
                        ? ((sellerChartData.ecoBands.excellent + sellerChartData.ecoBands.good) / sellerChartData.total) * 100
                        : 0)
                    ).toFixed(2)}%, #ef4444 ${(
                      (sellerChartData.total
                        ? ((sellerChartData.ecoBands.excellent + sellerChartData.ecoBands.good) / sellerChartData.total) * 100
                        : 0)
                    ).toFixed(2)}% 100%)`,
                  }}
                />
                <div className="text-sm text-slate-600 space-y-1.5">
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />Excellent (80+): {sellerChartData.ecoBands.excellent}</p>
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" />Good (50-79): {sellerChartData.ecoBands.good}</p>
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />Needs work (&lt;50): {sellerChartData.ecoBands.needsWork}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Top Viewed Listings</h2>
              <p className="text-sm text-slate-500 mt-1">Quick ranking by property views</p>

              <div className="mt-5 space-y-4">
                {sellerChartData.topViewed.length === 0 ? (
                  <p className="text-sm text-slate-500">No listings available yet.</p>
                ) : (
                  sellerChartData.topViewed.map((listing) => {
                    const views = toViewCount(listing);
                    const width = sellerChartData.maxViews > 0 ? (views / sellerChartData.maxViews) * 100 : 0;
                    return (
                      <div key={listing._id}>
                        <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                          <p className="font-semibold text-slate-700 truncate">{listing.title || 'Untitled listing'}</p>
                          <span className="text-slate-500 whitespace-nowrap">{views} views</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_45%,_#f8fafc_100%)]">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-10">
        {/* Profile & Recommendation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* 1 & 2: User Profile & Preferences */}
          <section className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden relative group transition-all hover:shadow-xl hover:shadow-emerald-500/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-10">
                  <div className="relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} 
                      alt="Avatar" 
                      className="w-28 h-28 rounded-3xl bg-emerald-50 border-2 border-emerald-200 p-1 shadow-lg shadow-emerald-500/10"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl border-4 border-white shadow-lg">
                      <Shield size={16} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <h1 className="text-3xl font-black text-slate-900 tracking-tight">{userName}</h1>
                       <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                         {userRole?.toUpperCase() || 'USER'}
                       </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-slate-500 font-medium capitalize">
                        <Mail size={16} className="text-emerald-500" />
                        {backendUser?.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${hasPendingSellerRequest ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                           {isSeller ? 'Approved Seller' : hasPendingSellerRequest ? 'Seller Status: Pending' : 'Standard User Account'}
                        </div>
                        {(!isSeller && !hasPendingSellerRequest) && (
                          <button 
                            onClick={() => { setSellerUpgradeError(''); setSellerUpgradeSuccess(''); setIsSellerFormOpen(true); }}
                            className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <ArrowUpRight size={14} /> Request Seller Account
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to="/preference-setup" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                       <Settings size={18} /> {isPreferenceSet ? 'Edit Preferences' : 'Set Preferences'}
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                      <Heart size={18} className="text-rose-500" /> Wishlist
                    </Link>
                  </div>
                </div>

                {/* User Preferences Grid */}
                <div className="border-t border-emerald-50 pt-8 mt-4">
                  <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <Sparkles size={16} className="text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-widest">{!isPreferenceSet ? 'Using System Defaults' : 'My Living Preferences'}</span>
                  </div>
                  
                  {isPreferenceSet ? (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <PreferenceItem icon={CreditCard} label="Max Budget" value={`${(userPrefs?.budgetMax || 0).toLocaleString()} LKR`} />
                        <PreferenceItem icon={Home} label="Property" value={userPrefs?.propertyType || 'Any'} />
                        <PreferenceItem icon={TrendingUp} label="Eco priority" value={userPrefs?.ecoPriority || 'Medium'} />
                        <PreferenceItem icon={Bus} label="Transport" value={userPrefs?.transportPreference || 'Any'} />
                      </div>

                      {userPrefs?.greenAmenities?.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {userPrefs.greenAmenities.map((amenity, i) => (
                            <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 rounded-lg">
                              + {amenity.split(/(?=[A-Z])/).join(' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-200 text-center">
                      <p className="text-sm text-slate-500 mb-4 font-medium italic">"Currently using system defaults. Upgrade your profile for better matching."</p>
                      <Link to="/preference-setup" className="text-emerald-700 font-bold text-sm hover:underline flex items-center justify-center gap-2">
                        <Sparkles size={14} className="text-emerald-500" /> Let's Personalize Your Profile
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3: Top Recommendation Summary */}
          <section className="lg:col-span-4 h-full">
            <div className="h-full bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                   <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={12} /> Your Top Match
                   </div>
                   <Link to="/recommendations" className="text-white/50 hover:text-white transition-colors">
                     <ChevronRight size={24} />
                   </Link>
                </div>

                {recommendationsLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-white/10 rounded-lg w-3/4" />
                    <div className="h-32 bg-white/10 rounded-2xl" />
                  </div>
                ) : topMatch ? (
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-3xl font-black mb-1 line-clamp-1">{topMatch.title}</h2>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 mb-6">
                      <MapPin size={14} /> {topMatch.location?.city}
                    </span>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-white/40">Smart Score</span>
                        <div className="text-2xl font-black text-emerald-400">{topMatch.smartScore}<span className="text-xs text-white/20 ml-1">/100</span></div>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${topMatch.smartScore}%` }} />
                      </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex gap-3 items-start mb-8">
                       <Sparkles size={18} className="text-emerald-400 shrink-0 mt-1" />
                       <DashboardTopMatchInsight propertyId={topMatch._id} initialInsight={topMatch.aiInsight} />
                    </div>

                    <Link to="/recommendations" className="mt-auto w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-center transition-all flex items-center justify-center gap-2">
                       View All Recommendations <ArrowUpRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <LayoutGrid size={28} className="text-emerald-400" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">
                       {isPreferenceSet ? "Refining Your Matches" : "Find Your Perfect Fit"}
                    </h3>
                    
                    <p className="text-white/60 mb-8 max-w-[240px] mx-auto text-sm leading-relaxed">
                      {isPreferenceSet 
                        ? "We found potential matches! Click below to see all properties matching your criteria." 
                        : "Personalize your eco-profile to find your perfect green-home match."}
                    </p>
                    
                    <div className="w-full space-y-3">
                      <Link to="/recommendations" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-center transition-all shadow-lg shadow-emerald-600/20">
                         View Matching Properties
                      </Link>
                      
                      <Link to="/preference-setup" className="block w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-black text-center transition-all">
                         {isPreferenceSet ? "Update My Preferences" : "Start Preference Setup"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {sellerUpgradeError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{sellerUpgradeError}</div>
        )}
        {sellerUpgradeSuccess && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{sellerUpgradeSuccess}</div>
        )}
        {hasPendingSellerRequest && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your seller application is pending review. You will be able to add listings after approval.
          </div>
        )}

        {/* Existing Quick Stats */}
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
                const bookingCreatedAtMs = booking?.createdAt ? new Date(booking.createdAt).getTime() : NaN;
                const isWithinCancellationWindow = Number.isFinite(bookingCreatedAtMs)
                  ? Date.now() - bookingCreatedAtMs <= CANCELLATION_WINDOW_MS
                  : false;
                const canCancel = (booking?.status === 'pending' || booking?.status === 'confirmed') && isWithinCancellationWindow;
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
                    {!isWithinCancellationWindow && ['pending', 'confirmed'].includes(booking?.status) && (
                      <p className="text-xs text-amber-700 mt-3">Cancellation window expired (more than 3 days since booking placement).</p>
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

      <SellerApplicationModal
        isOpen={isSellerFormOpen}
        onClose={() => setIsSellerFormOpen(false)}
        onSubmitted={handleSellerApplicationSubmitted}
      />
    </div>
  );
}

function DashboardTopMatchInsight({ propertyId, initialInsight }) {
  const [insight, setInsight] = useState(initialInsight);
  const [loading, setLoading] = useState(!initialInsight);

  useEffect(() => {
    if (!initialInsight && propertyId) {
      const fetchInsight = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/recommendations/ai-insight/${propertyId}`, { withCredentials: true });
          if (res.data?.success) setInsight(res.data.insight);
        } catch (err) {
          console.error("AI Insight failed:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchInsight();
    }
  }, [propertyId, initialInsight]);

  if (loading) return <p className="text-sm text-emerald-50/60 leading-relaxed animate-pulse">Our AI is generating a personalized match report for you...</p>;
  
  return <p className="text-sm text-emerald-50/90 leading-relaxed italic">"{insight || 'This property perfectly aligns with your eco-living goals and budget.'}"</p>;
}
