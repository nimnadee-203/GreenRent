import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Leaf,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wind,
  Zap,
  Droplets,
  Bus,
  Trash2,
  CalendarDays,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Share2,
  MessageCircle,
  SendHorizontal
} from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import NearbyPlaces from "../../components/Property/NearbyPlaces";
import PropertyDetailsHeader from "../../components/Property/PropertyDetailsHeader";
import PropertyReviewsSection from "../../components/Property/PropertyReviewsSection";
import PropertyReviewModal from "../../components/Property/PropertyReviewModal";
import BookingSidebar from "../../components/booking/BookingSidebar";
import BookingFlowModals from "../../components/booking/BookingFlowModals";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const IMAGE_AUTOPLAY_MS = 4000;

const PropertyDetails = () => {
  const { currentUser, backendUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = Boolean(currentUser || backendUser);
  
  // All state must be defined at the top of the component (React Rules of Hooks)
  const [property, setProperty] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [ecoRating, setEcoRating] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: null });
  const [canReviewApartment, setCanReviewApartment] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingByReview, setReplySubmittingByReview] = useState({});
  const [replyError, setReplyError] = useState("");
  const [reviewActionLoadingById, setReviewActionLoadingById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sellerInfoError, setSellerInfoError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [showStayTypeModal, setShowStayTypeModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showAuthChoiceModal, setShowAuthChoiceModal] = useState(false);
  const [stayType, setStayType] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [fromMonth, setFromMonth] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [toYear, setToYear] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [summaryGuests, setSummaryGuests] = useState(1);
  const [nearbyPlaces, setNearbyPlaces] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbySource, setNearbySource] = useState("unavailable");
  const mapSectionRef = useRef(null);
  const reviewsSectionRef = useRef(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    try {
      const storedValue = localStorage.getItem("propertyDetailsAutoplayEnabled");
      return storedValue === null ? true : storedValue === "true";
    } catch {
      return true;
    }
  });

  // gets all reviews for one property from the backend.
  const fetchReviews = async (listingId) => {
    try {
      const revRes = await axios.get(`${API_BASE_URL}/api/renter-reviews/listing/${listingId}`);
      setReviewsData({
        reviews: revRes.data.reviews || [],
        summary: revRes.data.summary || null,
      });
    } catch (revErr) {
      console.error("Reviews not found or error:", revErr);
      setReviewsData({ reviews: [], summary: null });
    }
  };

  // adds a reply to one review.
  const submitReply = async (reviewId) => {
    const text = (replyDrafts[reviewId] || "").trim();
    if (!text) return;

    try {
      setReplyError("");
      setReplySubmittingByReview((prev) => ({ ...prev, [reviewId]: true }));
      await axios.post(
        `${API_BASE_URL}/api/renter-reviews/${reviewId}/replies`,
        { text },
        { withCredentials: true }
      );
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      await fetchReviews(id);
    } catch (error) {
      setReplyError(error?.response?.data?.message || error?.response?.data?.errors?.[0] || "Failed to add reply.");
    } finally {
      setReplySubmittingByReview((prev) => ({ ...prev, [reviewId]: false }));
    }
  };
 // admin manage review in property page, including delete, hide and unhide review.
  const moderateReview = async (reviewId, action) => {
    try {
      setReviewActionLoadingById((prev) => ({ ...prev, [reviewId]: true }));
      if (action === "delete") {
        const confirmed = window.confirm("Delete this review permanently?");
        if (!confirmed) return;
        await axios.delete(`${API_BASE_URL}/api/renter-reviews/${reviewId}`, { withCredentials: true });
      } else if (action === "hide") {
        await axios.patch(
          `${API_BASE_URL}/api/renter-reviews/${reviewId}/status`,
          { status: "hidden" },
          { withCredentials: true }
        );
      } else if (action === "unhide") {
        await axios.patch(
          `${API_BASE_URL}/api/renter-reviews/${reviewId}/status`,
          { status: "approved" },
          { withCredentials: true }
        );
      }
      await fetchReviews(id);
    } catch (error) {
      setReplyError(error?.response?.data?.message || "Failed to moderate review.");
    } finally {
      setReviewActionLoadingById((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const yearOptions = Array.from({ length: 6 }, (_, index) => currentYear + index);

  const isAtLeastThreeMonths = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;

    const threshold = new Date(start);
    threshold.setMonth(threshold.getMonth() + 3);
    return end >= threshold;
  };

  const getLongStayMonthCount = (startMonth, startYear, endMonth, endYear) => {
    const fromMonthIndex = monthNames.indexOf(startMonth);
    const toMonthIndex = monthNames.indexOf(endMonth);
    if (fromMonthIndex < 0 || toMonthIndex < 0) return 0;

    const months = (parseInt(endYear, 10) - parseInt(startYear, 10)) * 12 + (toMonthIndex - fromMonthIndex) + 1;
    return Number.isFinite(months) ? months : 0;
  };

  const isLongStayStartFromCurrentOrFuture = (startMonth, startYear) => {
    const fromMonthIndex = monthNames.indexOf(startMonth);
    const fromYearNumber = parseInt(startYear, 10);
    if (fromMonthIndex < 0 || Number.isNaN(fromYearNumber)) return false;

    const startTotal = fromYearNumber * 12 + fromMonthIndex;
    const currentTotal = currentYear * 12 + currentMonthIndex;
    return startTotal >= currentTotal;
  };

  const isLongStayRangeChronological = (startMonth, startYear, endMonth, endYear) => {
    const fromMonthIndex = monthNames.indexOf(startMonth);
    const toMonthIndex = monthNames.indexOf(endMonth);
    const fromYearNumber = parseInt(startYear, 10);
    const toYearNumber = parseInt(endYear, 10);

    if (fromMonthIndex < 0 || toMonthIndex < 0 || Number.isNaN(fromYearNumber) || Number.isNaN(toYearNumber)) {
      return false;
    }

    const startTotal = fromYearNumber * 12 + fromMonthIndex;
    const endTotal = toYearNumber * 12 + toMonthIndex;
    return endTotal >= startTotal;
  };

  const handleBookNow = () => {
    const availability = selectedAvailability || availabilityResult;

    if (!isAuthenticated) {
      setShowAuthChoiceModal(true);
      return;
    }

    if (!property || property.availabilityStatus !== 'available') {
      alert('This property is not currently available for booking.');
      return;
    }

    if (!availability || !availability.available) {
      alert('Please confirm availability for your selected duration first.');
      return;
    }

    let finalCheckInDate = availability.checkInDate || checkInDate;
    let finalCheckOutDate = availability.checkOutDate || checkOutDate;
    let finalStayType = availability.stayType || stayType || property.stayType;
    let computedMonths = availability.months || 0;

    if (finalStayType === "short") {
      if (!finalCheckInDate || !finalCheckOutDate || new Date(finalCheckOutDate) <= new Date(finalCheckInDate)) {
        alert('Please select valid check-in and check-out dates.');
        return;
      }
      if (new Date(finalCheckInDate) < new Date(today)) {
        alert('Check-in date must be today or a future date.');
        return;
      }
      if (isAtLeastThreeMonths(finalCheckInDate, finalCheckOutDate)) {
        alert('Short stay must be less than 3 months.');
        return;
      }
    } else if (finalStayType === "long") {
      if (!finalCheckInDate || !finalCheckOutDate) {
        alert('Please select valid long-stay dates.');
        return;
      }
      const monthsCount = computedMonths || getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear);
      if (monthsCount < 3) {
        alert('Long stay must be at least 3 months.');
        return;
      }
      computedMonths = monthsCount;
    }

    setShowAvailabilityModal(false);
    navigate(`/booking/${id}`, {
      state: {
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        stayType: finalStayType,
        selectedMonths: computedMonths,
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch property
        const propRes = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
        setProperty(propRes.data);

        // Fetch eco ratings
        const ecoRes = await axios.get(`${API_BASE_URL}/api/eco-ratings?listingId=${id}`);
        if (ecoRes.data && ecoRes.data.length > 0) {
          setEcoRating(ecoRes.data[0]);
        }

        await fetchReviews(id);
      } catch (err) {
        console.error(err);
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      const ownerId = property?.ownerId;
      if (!ownerId) {
        setSellerInfo(null);
        setSellerInfoError("");
        return;
      }

      try {
        setSellerInfoError("");
        const response = await axios.get(`${API_BASE_URL}/api/user/public/${ownerId}`);
        setSellerInfo(response.data?.profile || null);
      } catch (sellerError) {
        setSellerInfo(null);
        setSellerInfoError(sellerError?.response?.data?.message || "Failed to load seller information.");
      }
    };

    fetchSellerInfo();
  }, [property?.ownerId]);

  // it checks review permission 
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!backendUser?.id && !backendUser?._id) {
        setCanReviewApartment(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/bookings/my`, { withCredentials: true });
        const bookings = Array.isArray(response.data?.bookings) ? response.data.bookings : [];
        const eligibleStatuses = new Set(["confirmed", "completed"]);

        const hasEligibleBooking = bookings.some((booking) => {
          const apartmentId = typeof booking?.apartmentId === "object"
            ? booking.apartmentId?._id
            : booking?.apartmentId;

          return String(apartmentId || "") === String(id) && eligibleStatuses.has(booking?.status);
        });

        setCanReviewApartment(hasEligibleBooking);
      } catch (bookingError) {
        setCanReviewApartment(false);
      }
    };

    checkReviewEligibility();
  }, [backendUser?._id, backendUser?.id, id]);

  useEffect(() => {
    const loadMapCoordinates = async () => {
      if (!property) return;

      const lat = property.location?.coordinates?.lat;
      const lng = property.location?.coordinates?.lng;

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setMapCoords({ lat, lng });
        setMapError("");
        return;
      }

      const locationQuery = toMapLocationQuery(property.location);
      if (!locationQuery) {
        setMapCoords(null);
                setMapError("No location information available for this listing.");
        return;
      }

      setMapLoading(true);
      setMapError("");

      try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: {
            q: locationQuery,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "GreenRent/1.0",
          },
        });

        const result = Array.isArray(response.data) ? response.data[0] : null;
        const geoLat = result ? parseFloat(result.lat) : NaN;
        const geoLng = result ? parseFloat(result.lon) : NaN;

        if (Number.isFinite(geoLat) && Number.isFinite(geoLng)) {
          setMapCoords({ lat: geoLat, lng: geoLng });
        } else {
          setMapCoords(null);
          setMapError("Could not locate this location on OpenStreetMap.");
        }
      } catch (geoErr) {
        setMapCoords(null);
        setMapError("Failed to load map location right now.");
      } finally {
        setMapLoading(false);
      }
    };

    loadMapCoordinates();
  }, [property]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/wishlist/check/${id}`, {
          withCredentials: true,
        });
        setIsWishlisted(Boolean(response.data?.isWishlisted));
      } catch (wishlistError) {
        // Unauthenticated users can still browse, so fail silently.
        setIsWishlisted(false);
      }
    };

    checkWishlistStatus();
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem("propertyDetailsAutoplayEnabled", String(autoplayEnabled));
    } catch {
      // Ignore storage errors and keep in-memory preference.
    }
  }, [autoplayEnabled]);

  const toEmbedMapUrl = (lat, lng) => {
    const delta = 0.003;
    const left = Math.max(-180, lng - delta);
    const right = Math.min(180, lng + delta);
    const top = Math.min(90, lat + delta);
    const bottom = Math.max(-90, lat - delta);
    const bbox = `${left},${bottom},${right},${top}`;
    const marker = `${lat},${lng}`;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  };

  const toLocationLabel = (location) => {
    if (!location) return "Address not provided";
    if (typeof location === "string") return location;

    const displayParts = [location.displayAddress, location.city, location.state, location.country].filter(Boolean);
    if (displayParts.length > 0) return displayParts.join(", ");

    return location.address || "Address not provided";
  };

  const toGeocodeQuery = (location) => {
    if (!location || typeof location === "string") return typeof location === "string" ? location : "";

    return [location.address, location.displayAddress, location.city, location.state, location.country]
      .filter(Boolean)
      .join(", ");
  };

  const toMapLocationQuery = (location) => {
    if (!location) return "";
    if (typeof location === "string") return location.trim();

    const broadParts = [location.city, location.state, location.country]
      .filter((part) => typeof part === "string" && part.trim())
      .map((part) => part.trim());

    if (broadParts.length > 0) return broadParts.join(", ");

    const fallbackRaw =
      (typeof location.address === "string" && location.address.trim()) ||
      (typeof location.displayAddress === "string" && location.displayAddress.trim()) ||
      "";

    if (!fallbackRaw) return "";

    const tokens = fallbackRaw.split(",").map((token) => token.trim()).filter(Boolean);
    if (tokens.length >= 3) {
      return tokens.slice(-3).join(", ");
    }

    return fallbackRaw;
  };

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!property?._id) {
        setNearbyPlaces(null);
        setNearbySource("unavailable");
        return;
      }

      setNearbyLoading(true);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/properties/${property._id}/nearby`);
        const places = response.data?.places;
        const hasLiveData = Object.values(places || {}).some((items) => Array.isArray(items) && items.length > 0);

        setNearbyPlaces(hasLiveData ? places : null);
        setNearbySource(response.data?.source === "live" && hasLiveData ? "live" : "unavailable");
      } catch (nearbyErr) {
        setNearbyPlaces(null);
        setNearbySource("unavailable");
      } finally {
        setNearbyLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [property]);

  const today = new Date().toISOString().split("T")[0];
  const propertyStayType = property?.stayType || "long";
  const includedGuests = property?.maxGuests ?? property?.guests ?? 3;
  const summaryPrefersShortStay = propertyStayType === "short" || propertyStayType === "both";
  const availableStayTypes = propertyStayType === "both" ? ["short", "long"] : [propertyStayType];
  const displayReviews = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];
  const averageScoreOutOfTen = reviewsData.summary ? Number(reviewsData.summary.averageTotalScore || 0) : 0;
  const averageScoreOutOfFive = averageScoreOutOfTen > 0 ? averageScoreOutOfTen / 2 : 0;
  const totalReviewCount = displayReviews.length;
  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => {
    const count = displayReviews.filter((review) => Math.max(1, Math.min(5, Math.round(Number(review?.totalScore || 0) / 2))) === star).length;
    const percent = totalReviewCount ? Math.round((count / totalReviewCount) * 100) : 0;
    return { star, count, percent };
  });

  const nearbyPlacesByCategory =
    nearbyPlaces || { busStops: [], groceries: [], hospitals: [], schools: [] };

  const nearbyPlaceSections = [
    { key: "busStops", title: "Bus Stops" },
    { key: "groceries", title: "Groceries" },
    { key: "hospitals", title: "Hospitals" },
    { key: "schools", title: "Schools" },
  ];

  useEffect(() => {
    if (!property || !location.state?.resumeAvailabilityFlow) return;

    const preserved = location.state?.preservedBookingFlow;

    if (preserved) {
      setStayType(preserved.stayType || "");
      setCheckInDate(preserved.checkInDate || "");
      setCheckOutDate(preserved.checkOutDate || "");
      setFromMonth(preserved.fromMonth || "");
      setFromYear(preserved.fromYear || "");
      setToMonth(preserved.toMonth || "");
      setToYear(preserved.toYear || "");
      // Force the user back through date confirmation after auth.
      setAvailabilityResult(null);
      setSelectedAvailability(null);
      setAvailabilityError("");
      setShowStayTypeModal(false);
      setShowAvailabilityModal(false);

      if (preserved.stayType) {
        setShowDatePickerModal(true);
      } else if (availableStayTypes.length === 1) {
        setStayType(availableStayTypes[0]);
        setShowDatePickerModal(true);
      } else {
        setShowDatePickerModal(false);
        setShowStayTypeModal(true);
      }

      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (availableStayTypes.length === 1) {
      setStayType(availableStayTypes[0]);
      setShowDatePickerModal(true);
    } else {
      setShowStayTypeModal(true);
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [property, location.state, location.pathname, availableStayTypes, navigate]);

  const handleCheckAvailabilityClick = (event) => {
    event.stopPropagation();
    if (availableStayTypes.length === 1) {
      handleSelectStayType(availableStayTypes[0]);
      return;
    }

    setShowStayTypeModal(true);
  };

  const handleWishlistToggle = async (event) => {
    event.stopPropagation();
    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        await axios.delete(`${API_BASE_URL}/api/user/wishlist/${id}`, {
          withCredentials: true,
        });
        setIsWishlisted(false);
      } else {
        await axios.post(`${API_BASE_URL}/api/user/wishlist/${id}`, {}, {
          withCredentials: true,
        });
        setIsWishlisted(true);
      }
    } catch (wishlistError) {
      const message = wishlistError?.response?.data?.message;
      alert(message || "Please login to use wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShareListing = async (event) => {
    event.stopPropagation();

    const shareUrl = window.location.href;
    const shareTitle = property?.title || "GreenRent Property";
    const shareText = `Check out this property on GreenRent: ${shareTitle}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback("Shared successfully.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback("Link copied to clipboard.");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setShareFeedback("Link copied to clipboard.");
      }
    } catch (shareError) {
      setShareFeedback("Unable to share right now.");
    }

    window.setTimeout(() => {
      setShareFeedback("");
    }, 2200);
  };

  const handleSelectStayType = (type) => {
    if (!availableStayTypes.includes(type)) return;
    setStayType(type);
    setShowStayTypeModal(false);
    setShowDatePickerModal(true);
  };

  const handleChooseAuthAction = (mode) => {
    const preservedBookingFlow = {
      stayType,
      checkInDate,
      checkOutDate,
      fromMonth,
      fromYear,
      toMonth,
      toYear,
      availabilityResult,
      selectedAvailability,
    };

    setShowAuthChoiceModal(false);
    setShowAvailabilityModal(false);
    navigate("/login", {
      state: {
        from: `/properties/${id}`,
        mode,
        message: "To continue booking this apartment, please login or sign up first.",
        postLoginState: {
          resumeAvailabilityFlow: true,
          preservedBookingFlow,
        },
      },
    });
  };

  const handleContinueToAvailability = async () => {
    setAvailabilityError("");
    setAvailabilityResult(null);

    let finalCheckInDate = "";
    let finalCheckOutDate = "";
    let computedMonths = 0;

    if (stayType === "short") {
      if (!checkInDate || !checkOutDate) {
        setAvailabilityError("Please select both check-in and check-out dates.");
        return;
      }
      if (checkInDate < today) {
        setAvailabilityError("Check-in date must be today or later.");
        return;
      }
      if (new Date(checkOutDate) <= new Date(checkInDate)) {
        setAvailabilityError("Check-out date must be after check-in date.");
        return;
      }
      if (isAtLeastThreeMonths(checkInDate, checkOutDate)) {
        setAvailabilityError("Short stay must be less than 3 months; please select long stay for longer periods.");
        return;
      }

      finalCheckInDate = checkInDate;
      finalCheckOutDate = checkOutDate;
    } else if (stayType === "long") {
      if (!fromMonth || !fromYear || !toMonth || !toYear) {
        setAvailabilityError("Please select a valid long-stay month range.");
        return;
      }
      if (!isLongStayStartFromCurrentOrFuture(fromMonth, fromYear)) {
        setAvailabilityError("Long stay must begin in the current or a future month.");
        return;
      }
      if (!isLongStayRangeChronological(fromMonth, fromYear, toMonth, toYear)) {
        setAvailabilityError("Long stay end must be after long stay start.");
        return;
      }

      const monthsCount = getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear);
      if (monthsCount < 3) {
        setAvailabilityError("Long stay must be at least 3 months.");
        return;
      }

      const fromMonthIndex = monthNames.indexOf(fromMonth);
      const toMonthIndex = monthNames.indexOf(toMonth);
      const pad = (n) => n.toString().padStart(2, "0");

      finalCheckInDate = `${fromYear}-${pad(fromMonthIndex + 1)}-01`;
      const lastDayOfToMonth = new Date(parseInt(toYear), toMonthIndex + 1, 0).getDate();
      finalCheckOutDate = `${toYear}-${pad(toMonthIndex + 1)}-${pad(lastDayOfToMonth)}`;
      computedMonths = monthsCount;
    }

    setShowDatePickerModal(false);
    setShowAvailabilityModal(true);

    try {
      setAvailabilityLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/bookings/check-availability`, {
        apartmentId: id,
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
      });

      const { available } = response.data;
      const result = {
        available,
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        stayType,
        months: computedMonths,
      };
      setAvailabilityResult(result);
      setSelectedAvailability(result);

      if (!available) {
        setAvailabilityError("The apartment is already booked in this period; please choose a different duration.");
      }
    } catch (err) {
      setAvailabilityError(err.response?.data?.message || "Failed to verify availability. Please retry.");
      setAvailabilityResult(null);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const closeDatePickerModal = () => {
    setShowDatePickerModal(false);
    setCheckInDate("");
    setCheckOutDate("");
    setFromMonth("");
    setFromYear("");
    setToMonth("");
    setToYear("");
    setStayType("");
  };

  const images = property?.images && property.images.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"];

  useEffect(() => {
    if (!property || !autoplayEnabled || images.length <= 1) return undefined;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, IMAGE_AUTOPLAY_MS);

    return () => clearInterval(intervalId);
  }, [property, autoplayEnabled, images.length]);

  useEffect(() => {
    if (currentImageIndex < images.length) return;
    setCurrentImageIndex(0);
  }, [currentImageIndex, images.length]);

  useEffect(() => {
    setSummaryGuests(summaryPrefersShortStay ? includedGuests : 1);
  }, [summaryPrefersShortStay, includedGuests, property?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="w-full mx-auto px-4 md:px-8 xl:px-12 py-8 animate-pulse">
          <div className="h-5 w-36 bg-slate-200 rounded-md mb-6" />

          <div className="w-full h-[400px] md:h-[500px] rounded-2xl bg-slate-200 mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-wrap gap-4">
                  <div className="h-16 flex-1 min-w-[160px] bg-slate-100 rounded-xl" />
                  <div className="h-16 flex-1 min-w-[160px] bg-slate-100 rounded-xl" />
                  <div className="h-16 flex-1 min-w-[160px] bg-slate-100 rounded-xl" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="h-6 w-48 bg-slate-200 rounded-md" />
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-11/12 bg-slate-100 rounded" />
                <div className="h-4 w-9/12 bg-slate-100 rounded" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="h-6 w-40 bg-slate-200 rounded-md" />
                <div className="h-[320px] bg-slate-100 rounded-xl" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl p-6 bg-slate-200 h-[300px]" />
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="h-6 w-40 bg-slate-200 rounded-md" />
                <div className="h-24 bg-slate-100 rounded-xl" />
                <div className="h-11 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 lg:p-10 shadow-sm space-y-4">
            <div className="h-7 w-64 bg-slate-200 rounded-md" />
            <div className="h-4 w-80 bg-slate-100 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
              <div className="h-56 bg-slate-100 rounded-xl" />
              <div className="h-56 bg-slate-100 rounded-xl" />
              <div className="h-56 bg-slate-100 rounded-xl hidden md:block" />
              <div className="h-56 bg-slate-100 rounded-xl hidden xl:block" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
        <p className="text-slate-600 mb-6">{error || "Property not found."}</p>
        <Link to="/properties" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          Back to Listings
        </Link>
      </div>
    );
  }

  const primaryImage = images[currentImageIndex];
  const hasMonthlyPrice = property.monthlyPrice !== null && property.monthlyPrice !== undefined;
  const hasDailyPrice = property.dailyPrice !== null && property.dailyPrice !== undefined;
  const summaryRate = Number(
    summaryPrefersShortStay
      ? (hasDailyPrice ? property.dailyPrice : property.price)
      : (hasMonthlyPrice ? property.monthlyPrice : property.price)
  );
  const summaryGuestCount = summaryPrefersShortStay ? Math.max(1, Number(summaryGuests) || 1) : 1;
  const summaryExtraGuestFee = 1000;
  const summaryExtraGuests = summaryPrefersShortStay ? Math.max(0, summaryGuestCount - includedGuests) : 0;
  const summaryAdditionalFee = summaryExtraGuests * summaryExtraGuestFee;
  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-LK")}`;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const scrollToSection = (sectionRef) => {
    sectionRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const detailsViewModel = {
    property,
    images,
    primaryImage,
    currentImageIndex,
    autoplayEnabled,
    setAutoplayEnabled,
    setIsLightboxOpen,
    handlePrevImage,
    handleNextImage,
    propertyStayType,
    toLocationLabel,
    handleCheckAvailabilityClick,
    scrollToSection,
    mapSectionRef,
    reviewsSectionRef,
    handleWishlistToggle,
    wishlistLoading,
    isWishlisted,
    handleShareListing,
    shareFeedback,
    summaryPrefersShortStay,
    hasMonthlyPrice,
    hasDailyPrice,
    formatCurrency,
    summaryRate,
    summaryGuestCount,
    setSummaryGuests,
    includedGuests,
    summaryExtraGuestFee,
    summaryExtraGuests,
    summaryAdditionalFee,
    today,
    monthNames,
    currentYear,
    currentMonthIndex,
    yearOptions,
    stayType,
    checkInDate,
    checkOutDate,
    fromMonth,
    fromYear,
    toMonth,
    toYear,
    setCheckInDate,
    setCheckOutDate,
    setFromMonth,
    setFromYear,
    setToMonth,
    setToYear,
    setStayType,
    setShowStayTypeModal,
    setShowDatePickerModal,
    setShowAvailabilityModal,
    setShowAuthChoiceModal,
    isAtLeastThreeMonths,
    isLongStayStartFromCurrentOrFuture,
    isLongStayRangeChronological,
    getLongStayMonthCount,
    availableStayTypes,
    handleSelectStayType,
    handleContinueToAvailability,
    handleBookNow,
    handleChooseAuthAction,
    closeDatePickerModal,
    availabilityLoading,
    availabilityResult,
    availabilityError,
    showStayTypeModal,
    showDatePickerModal,
    showAvailabilityModal,
    showAuthChoiceModal,
    displayReviews,
    averageScoreOutOfFive,
    reviewsData,
    ratingBuckets,
    canReviewApartment,
    setShowReviewModal,
    backendUser,
    reviewActionLoadingById,
    moderateReview,
    replyDrafts,
    setReplyDrafts,
    submitReply,
    replySubmittingByReview,
    replyError,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="w-full mx-auto px-4 md:px-8 xl:px-12 py-8">
        <Link to="/properties" className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to apartments
        </Link>
        
        <PropertyDetailsHeader vm={detailsViewModel} />

        <div className="mt-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg"><Bed className="w-5 h-5"/></div>
                <div><p className="text-xs text-slate-500 font-medium">Bedrooms</p><p className="font-semibold text-slate-900">{property.bedrooms ?? property.beds ?? 1}</p></div>
              </div>
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><Bath className="w-5 h-5"/></div>
                <div><p className="text-xs text-slate-500 font-medium">Bathrooms</p><p className="font-semibold text-slate-900">{property.bathrooms ?? property.baths ?? 1}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><Maximize className="w-5 h-5"/></div>
                <div><p className="text-xs text-slate-500 font-medium">Area</p><p className="font-semibold text-slate-900">{property.area ? Number(property.area).toLocaleString('en-LK') + ' sq.ft' : 'N/A'}</p></div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this Property</h2>
              <div className="mb-3 text-sm text-slate-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <p>
                  <span className="font-semibold text-slate-800">Short-stay max guests:</span>
                  {' '}{property.maxGuests ?? property.guests ?? "Not specified"}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  This applies only for short stay. Any guest count above this limit may incur an additional fee.
                </p>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            <div ref={mapSectionRef} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                Location Map
              </h2>
              <p className="text-sm text-slate-500 mb-4">{toMapLocationQuery(property.location) || "Location not provided"}</p>

              {mapLoading && (
                <div className="h-[320px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin" />
                    Loading map...
                  </div>
                </div>
              )}

              {!mapLoading && mapCoords && (
                <div>
                  <div className="h-[320px] rounded-xl overflow-hidden border border-slate-200">
                    <iframe
                      title="Property location map"
                      src={toEmbedMapUrl(mapCoords.lat, mapCoords.lng)}
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lng}#map=16/${mapCoords.lat}/${mapCoords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Open in OpenStreetMap
                  </a>
                </div>
              )}

              {!mapLoading && !mapCoords && (
                <div className="h-[320px] rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center px-4 text-center">
                  <p className="text-sm text-amber-800">{mapError || "Map is unavailable for this property location."}</p>
                </div>
              )}
            </div>

            <NearbyPlaces nearbyPlaces={nearbyPlacesByCategory} nearbyLoading={nearbyLoading} />

            {/* Eco Features directly on property model */}
            {property.ecoFeatures && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center"><Leaf className="w-5 h-5 mr-2 text-emerald-500" /> Declared Eco Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                  {Object.entries(property.ecoFeatures).map(([key, value]) => {
                    if (value === true || value === "Yes" || value === "true") {
                      return (
                        <div key={key} className="flex items-center text-sm font-medium text-slate-700">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            <PropertyReviewsSection vm={detailsViewModel} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BookingSidebar viewModel={detailsViewModel} />

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-lg text-slate-900">Seller Information</h3>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  {sellerInfo?.role === "admin" ? "Admin Listing" : "Verified Seller"}
                </span>
              </div>

              {sellerInfo ? (
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Seller Name</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {sellerInfo?.sellerApplication?.sellerName || sellerInfo?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                    <p className="mt-1 break-all">{sellerInfo?.email || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Contact Number</p>
                    <p className="mt-1">{sellerInfo?.sellerApplication?.contactNumber || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Business Name</p>
                    <p className="mt-1">{sellerInfo?.sellerApplication?.businessName || "Personal Property Seller"}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Selling Plan</p>
                    <p className="mt-1">
                      {sellerInfo?.sellerApplication?.sellingPlan === "business_property"
                        ? "Business Property"
                        : sellerInfo?.sellerApplication?.sellingPlan === "personal_property"
                          ? "Personal Property"
                          : "-"}
                    </p>
                  </div>
                </div>
              ) : sellerInfoError ? (
                <p className="text-sm text-red-600">{sellerInfoError}</p>
              ) : (
                <p className="text-sm text-slate-500">Loading seller information...</p>
              )}
            </div>
            
            {/* Official Eco Rating */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Leaf className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center flex-wrap gap-2 mb-2 justify-between">
                  <h3 className="font-bold text-xl">Landlord Eco Rating</h3>
                  {ecoRating && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30">
                      Verified
                    </span>
                  )}
                </div>
                
                {ecoRating ? (
                  <>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-5xl font-black">{ecoRating.totalScore}</span>
                      <span className="text-emerald-100 font-medium mb-1.5">/ 100</span>
                    </div>

                    {typeof ecoRating.airQualityScore === 'number' && (
                      <div className="mt-4 space-y-2 text-sm text-emerald-50 bg-emerald-800/40 p-3 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">Air Quality Score:</span>
                          <span className="bg-emerald-500 px-2 py-0.5 rounded text-white font-bold">{ecoRating.airQualityScore} / 10</span>

                          {typeof ecoRating.externalSignals?.airQuality?.europeanAqi === 'number' && (
                            <span className="bg-emerald-700/60 px-2 py-0.5 rounded text-white text-xs font-semibold">
                              EU AQI: {ecoRating.externalSignals.airQuality.europeanAqi}
                            </span>
                          )}

                          {ecoRating.externalSignals?.airQuality?.source && (
                            <span className="text-[10px] opacity-80 ml-1">via {ecoRating.externalSignals.airQuality.source}</span>
                          )}
                        </div>

                        {(typeof ecoRating.externalSignals?.airQuality?.pm2_5 === 'number' || typeof ecoRating.externalSignals?.airQuality?.pm10 === 'number') && (
                          <div className="flex items-center gap-3 flex-wrap text-xs text-emerald-100">
                            {typeof ecoRating.externalSignals?.airQuality?.pm2_5 === 'number' && (
                              <span>PM2.5: <strong>{ecoRating.externalSignals.airQuality.pm2_5}</strong></span>
                            )}
                            {typeof ecoRating.externalSignals?.airQuality?.pm10 === 'number' && (
                              <span>PM10: <strong>{ecoRating.externalSignals.airQuality.pm10}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="my-6 grid grid-cols-2 gap-4">
                      {ecoRating.criteria && Object.entries(ecoRating.criteria).map(([k, v]) => (
                        <div key={k} className="bg-white/10 rounded-lg p-2.5 backdrop-blur-sm">
                          <p className="text-[10px] text-emerald-100 uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="font-semibold text-sm truncate">
                            {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-emerald-100">
                    <p>No official Eco Rating provided by the landlord yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Renter Summary */}
             <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" />
                  Renter Feedback
                </h3>
                
                {displayReviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-3xl font-black text-slate-800 leading-none">{averageScoreOutOfFive ? averageScoreOutOfFive.toFixed(1) : '-'}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Average Rating (out of 5)</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">{displayReviews.length}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Reviews</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-emerald-600">
                              {reviewsData.summary ? Math.round(reviewsData.summary.recommendationRate) : 0}%
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Recommend</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {ratingBuckets.map((bucket) => (
                          <div key={bucket.star} className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600 w-12">{bucket.star} star</span>
                            <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${bucket.percent}%` }} />
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right">{bucket.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic pb-2">No renter reviews yet. Be the first to verify this property!</p>
                )}

                {canReviewApartment && (
                  <button 
                    onClick={() => setShowReviewModal(true)}
                    className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Review Apartment
                  </button>
                )}

             </div>

          </div>
        </div>

      </main>

      <Footer />

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-slate-900/95 backdrop-blur-sm animate-in fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition z-50"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-6xl max-h-full flex items-center justify-center pointer-events-none">
            <img 
              src={images[currentImageIndex]} 
              alt={property.title} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()} 
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(e); }}
                  className="absolute left-0 md:-left-12 lg:-left-16 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition pointer-events-auto"
                >
                  <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextImage(e); }}
                  className="absolute right-0 md:-right-12 lg:-right-16 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition pointer-events-auto"
                >
                  <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider pointer-events-none">
                {currentImageIndex + 1} / {images.length}
             </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && canReviewApartment && (
        <PropertyReviewModal
          propertyId={id}
          ecoRatingId={ecoRating?._id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            window.location.reload();
          }}
        />
      )}

      <BookingFlowModals viewModel={detailsViewModel} />
    </div>
  );
};
// Separate component for the review modal to keep things organized
const ReviewModal = ({ propertyId, ecoRatingId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [criteria, setCriteria] = useState({
    energyEfficiency: 5,
    waterEfficiency: 5,
    wasteManagement: 5,
    transitAccess: 5,
    greenAmenities: 5
  });
  
  const [verification, setVerification] = useState({
    solarPanels: null,
    ledLighting: null,
    efficientAc: null,
    waterSavingTaps: null,
    recyclingAvailable: null,
    goodVentilationSunlight: null
  });

  const [reviewText, setReviewText] = useState("");
  const [livingDuration, setLivingDuration] = useState("< 3 months");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ecoRatingId) {
      setError("Cannot review property without an existing landlord eco-rating.");
      return;
    }

    // Convert nulls to undefined so they are stripped or handled properly if skipped
    const cleanedVerification = {};
    for (const key in verification) {
      if (verification[key] !== null) cleanedVerification[key] = verification[key];
    }

    const payload = {
      listingId: propertyId,
      ecoRatingId: ecoRatingId,
      criteria,
      verification: cleanedVerification,
      review: reviewText,
      livingDuration,
      wouldRecommend
    };

    try {
      setLoading(true);
      setError("");
      
      // Axios request - we assume token is passed via cookies
      await axios.post(`${API_BASE_URL}/api/renter-reviews`, payload, {
        withCredentials: true
      });
      
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationClick = (key, val) => {
    setVerification(prev => ({
      ...prev,
      [key]: prev[key] === val ? null : val // toggle off if already selected
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in zoom-in duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Rate Eco Criteria</h3>
        <p className="text-sm text-slate-500 mb-4">Score the apartment from 0-10 on these sustainability aspects based on your living experience.</p>
        
        <div className="space-y-5">
          {Object.entries(criteria).map(([key, value]) => (
            <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold capitalize text-slate-700">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <span className="font-bold text-emerald-600">{value} / 10</span>
              </div>
              <input 
                type="range" 
                min="0" max="10" step="1"
                value={value}
                onChange={(e) => setCriteria({...criteria, [key]: Number(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          ))}
        </div>
      </div>
      <button 
        type="button"
        onClick={() => setStep(2)}
        className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition"
      >
        Next Step
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Tenant Verified Features</h3>
        <p className="text-sm text-slate-500 mb-4">Verify which landlord-listed eco features were actually available while you stayed. Choose Yes, No, or leave blank if unsure.</p>
        
        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 rounded-xl">
          {Object.entries(verification).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
              <span className="text-sm font-medium capitalize text-slate-700">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => handleVerificationClick(key, true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${value === true ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  Yes
                </button>
                <button 
                  type="button"
                  onClick={() => handleVerificationClick(key, false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${value === false ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button 
          type="button"
          onClick={() => setStep(1)}
          className="w-1/3 bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 transition"
        >
          Back
        </button>
        <button 
          type="button"
          onClick={() => setStep(3)}
          className="w-2/3 bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition"
        >
          Next Step
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Final Thoughts</h3>
        <p className="text-sm text-slate-500 mb-4">Share your overall experience to help future renters.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Living Duration</label>
            <select 
              value={livingDuration}
              onChange={(e) => setLivingDuration(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="< 3 months">Less than 3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value="6-12 months">6-12 months</option>
              <option value="1-2 years">1-2 years</option>
              <option value="> 2 years">More than 2 years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Written Review</label>
            <textarea 
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others what it was like living here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            ></textarea>
          </div>

          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
            <input 
              type="checkbox" 
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">I would recommend this apartment to others</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button 
          type="button"
          onClick={() => setStep(2)}
          className="w-1/3 bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 transition"
        >
          Back
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-2/3 bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-70 flex justify-center items-center"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Submit Review'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <XCircle className="w-5 h-5" />
        </button>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Add Review</h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-emerald-500 w-6' : 'bg-slate-200 w-3'}`} />
              ))}
            </div>
          </div>
          
          <form>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
