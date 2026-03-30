import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Heart
} from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [ecoRating, setEcoRating] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [showStayTypeModal, setShowStayTypeModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [stayType, setStayType] = useState(""); // "long" or "short"
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [toYear, setToYear] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
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
    if (!property || property.availabilityStatus !== 'available') {
      alert('This property is not currently available for booking.');
      return;
    }

    let finalCheckInDate = checkInDate;
    let finalCheckOutDate = checkOutDate;
    let computedMonths = 0;

    if (stayType === "short") {
      if (checkInDate && checkInDate < today) {
        alert('Check-in date must be today or a future date.');
        return;
      }
      if (!checkInDate || !checkOutDate || new Date(checkOutDate) <= new Date(checkInDate)) {
        alert('Please select valid check-in and check-out dates.');
        return;
      }
      if (isAtLeastThreeMonths(checkInDate, checkOutDate)) {
        alert('Short stay must be less than 3 months. Please choose Long Stay for 3 months or more.');
        return;
      }
    } else if (stayType === "long") {
      if (!fromMonth || !fromYear || !toMonth || !toYear) {
        alert('Please select valid month and year range for long stay.');
        return;
      }

      if (!isLongStayStartFromCurrentOrFuture(fromMonth, fromYear)) {
        alert('Long stay start month must be current month or a future month.');
        return;
      }

      if (!isLongStayRangeChronological(fromMonth, fromYear, toMonth, toYear)) {
        alert('End month must be after start month.');
        return;
      }
      
      const fromMonthIndex = monthNames.indexOf(fromMonth);
      const toMonthIndex = monthNames.indexOf(toMonth);
      
      const pad = (n) => n.toString().padStart(2, '0');
      finalCheckInDate = `${fromYear}-${pad(fromMonthIndex + 1)}-01`;
      const lastDay = new Date(parseInt(toYear), toMonthIndex + 1, 0).getDate();
      finalCheckOutDate = `${toYear}-${pad(toMonthIndex + 1)}-${pad(lastDay)}`;
      
      computedMonths = getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear);
      
      if (computedMonths <= 0) {
        alert('End month must be after start month.');
        return;
      }
      if (computedMonths < 3) {
        alert('Long stay must be at least 3 months.');
        return;
      }
    }

    setShowAvailabilityModal(false);
    navigate(`/booking/${id}`, {
      state: { 
        checkInDate: finalCheckInDate, 
        checkOutDate: finalCheckOutDate,
        stayType: stayType || property.stayType,
        selectedMonths: computedMonths
      }
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

        // Fetch user reviews
        try {
          const revRes = await axios.get(`${API_BASE_URL}/api/renter-reviews/listing/${id}`);
          setReviewsData({
            reviews: revRes.data.reviews || [],
            summary: revRes.data.summary || null
          });
        } catch (revErr) {
          console.error("Reviews not found or error:", revErr);
        }
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
    const loadMapCoordinates = async () => {
      if (!property) return;

      const lat = property.location?.coordinates?.lat;
      const lng = property.location?.coordinates?.lng;

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setMapCoords({ lat, lng });
        setMapError("");
        return;
      }

      const address = property.location?.address;
      if (!address) {
        setMapCoords(null);
        setMapError("No location address available for this listing.");
        return;
      }

      setMapLoading(true);
      setMapError("");

      try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: {
            q: address,
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
          setMapError("Could not locate this address on OpenStreetMap.");
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

  const toEmbedMapUrl = (lat, lng) => {
    const delta = 0.01;
    const left = lng - delta;
    const right = lng + delta;
    const top = lat + delta;
    const bottom = lat - delta;
    const bbox = encodeURIComponent(`${left},${bottom},${right},${top}`);
    const marker = encodeURIComponent(`${lat},${lng}`);

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  };

  const today = new Date().toISOString().split("T")[0];
  const propertyStayType = property?.stayType || "long";
  const availableStayTypes = propertyStayType === "both" ? ["short", "long"] : [propertyStayType];

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

  const handleSelectStayType = (type) => {
    if (!availableStayTypes.includes(type)) return;
    setStayType(type);
    setShowStayTypeModal(false);
    setShowDatePickerModal(true);
  };

  const handleContinueToAvailability = () => {
    if (stayType === "short") {
      if (!checkInDate || !checkOutDate) return;
      if (checkInDate < today) return;
      if (new Date(checkOutDate) <= new Date(checkInDate)) return;
      if (isAtLeastThreeMonths(checkInDate, checkOutDate)) return;
    } else if (stayType === "long") {
      if (!fromMonth || !fromYear || !toMonth || !toYear) return;
      if (!isLongStayStartFromCurrentOrFuture(fromMonth, fromYear)) return;
      if (!isLongStayRangeChronological(fromMonth, fromYear, toMonth, toYear)) return;
      if (getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear) < 3) return;
    }

    setShowDatePickerModal(false);
    setShowAvailabilityModal(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
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

  const images = property.images && property.images.length > 0 
      ? property.images 
      : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"];

  const primaryImage = images[currentImageIndex];
  const hasMonthlyPrice = property.monthlyPrice !== null && property.monthlyPrice !== undefined;
  const hasDailyPrice = property.dailyPrice !== null && property.dailyPrice !== undefined;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="w-full mx-auto px-4 md:px-8 xl:px-12 py-8">
        <Link to="/properties" className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to apartments
        </Link>
        
        {/* Hero Image Section */}
        <div 
          className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img src={primaryImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
          
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-md text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-md text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider z-10 pointer-events-none">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end gap-4">
            <div className="text-white">
              <span className="inline-block px-3 py-1 bg-emerald-500/90 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                {property.propertyType || "Apartment"}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white shadow-sm">{property.title}</h1>
              <div className="flex items-center text-slate-200">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span className="text-sm md:text-base">{property.location?.address || "Address not provided"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg text-slate-900 text-center min-w-[140px]">
                {propertyStayType === "both" ? (
                  <>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Long Stay (Monthly)</p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-600 mb-2">
                      Rs {Number(hasMonthlyPrice ? property.monthlyPrice : property.price).toLocaleString("en-LK")}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Short Stay (Daily)</p>
                    <p className="text-lg md:text-xl font-bold text-emerald-700">
                      Rs {Number(hasDailyPrice ? property.dailyPrice : property.price).toLocaleString("en-LK")}
                    </p>
                  </>
                ) : propertyStayType === "short" ? (
                  <>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Daily Rent</p>
                    <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                      Rs {Number(hasDailyPrice ? property.dailyPrice : property.price).toLocaleString("en-LK")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Rent</p>
                    <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                      Rs {Number(hasMonthlyPrice ? property.monthlyPrice : property.price).toLocaleString("en-LK")}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={handleCheckAvailabilityClick}
                className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg text-slate-900 font-semibold hover:bg-white transition-all flex items-center justify-center gap-2 min-w-[140px] whitespace-nowrap"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Check Availability
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`backdrop-blur-md rounded-xl px-4 py-3 shadow-lg font-semibold transition-all flex items-center justify-center gap-2 min-w-[140px] whitespace-nowrap ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    : "bg-white/90 text-slate-900 hover:bg-white"
                } ${wishlistLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
                {wishlistLoading ? "Saving..." : isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
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
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                Location Map
              </h2>
              <p className="text-sm text-slate-500 mb-4">{property.location?.address || "Address not provided"}</p>

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
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
                    </div>                      {typeof ecoRating.airQualityScore === 'number' && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-50 bg-emerald-800/40 p-2 rounded-lg backdrop-blur-sm w-fit border border-emerald-500/30">
                           <span className="font-semibold">Air Quality (AQI):</span>
                           <span className="bg-emerald-500 px-2 py-0.5 rounded text-white font-bold">{ecoRating.airQualityScore} / 10</span>
                           {ecoRating.externalSignals?.airQuality?.source && (
                              <span className="text-[10px] opacity-70 ml-1">via {ecoRating.externalSignals.airQuality.source}</span>
                           )}
                        </div>
                      )}                    <div className="my-6 grid grid-cols-2 gap-4">
                      {ecoRating.criteria && Object.entries(ecoRating.criteria).slice(0, 4).map(([k, v]) => (
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
                
                {reviewsData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-slate-800">
                          {reviewsData.summary ? Number(reviewsData.summary.averageTotalScore).toFixed(1) : "-"}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Avg Score</p>
                      </div>
                      <div className="h-10 w-px bg-slate-200"></div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-800">{reviewsData.reviews.length}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Reviews</p>
                      </div>
                      <div className="h-10 w-px bg-slate-200"></div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-emerald-600">
                          {reviewsData.summary ? Math.round(reviewsData.summary.recommendationRate) : 0}%
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Recommend</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic pb-2">No renter reviews yet. Be the first to verify this property!</p>
                )}

                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Review Apartment
                </button>
             </div>

          </div>
        </div>

        {/* Reviews List Section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 lg:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Renter Reviews & Confirmations</h2>
              <p className="text-slate-500 text-sm mt-1">Actual feedback from previous and current tenants</p>
            </div>
          </div>

          {reviewsData.reviews.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-xl">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Star className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">This property hasn't received any renter reviews or eco-rating confirmations yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">      
              {reviewsData.reviews.map((review) => (
                <div key={review._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white transition-colors duration-200 shadow-sm hover:shadow-md h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {review.renterName?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{review.renterName || "Anonymous"}</p>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5">
                          <CalendarDays className="w-3 h-3 mr-1" /> {review.livingDuration}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-800 text-xs">{review.totalScore}/10</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 italic mb-4 flex-grow">"{review.review}"</p>

                  {review.verification && Object.keys(review.verification).length > 0 && (
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 mb-2.5 uppercase tracking-wider">Tenant Verified Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(review.verification).slice(0, 4).map(([key, val]) => {
                          if (val === null) return null;
                          return (
                            <span key={key} className={`inline-flex items-center px-2 py-1 rounded text-[10px] sm:text-xs font-medium border ${val ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                              {val ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          );
                        })}
                        {Object.keys(review.verification).length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            +{Object.keys(review.verification).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
      {showReviewModal && (
        <ReviewModal 
          propertyId={id} 
          ecoRatingId={ecoRating?._id}
          onClose={() => setShowReviewModal(false)} 
          onSuccess={() => {
            setShowReviewModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* Stay Type Selection Modal */}
      {showStayTypeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Select Your Stay Type</h2>
              <button
                onClick={() => setShowStayTypeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-slate-600 text-sm mb-6">How long are you planning to stay?</p>
              
              {availableStayTypes.includes("short") && (
                <button
                  onClick={() => handleSelectStayType("short")}
                  className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                >
                  <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">Short Stay</p>
                  <p className="text-sm text-slate-600 mt-2">Less than 3 months</p>
                </button>
              )}

              {availableStayTypes.includes("long") && (
                <button
                  onClick={() => handleSelectStayType("long")}
                  className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                >
                  <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">Long Stay</p>
                  <p className="text-sm text-slate-600 mt-2">3 months or more</p>
                </button>
              )}

              <button
                onClick={() => setShowStayTypeModal(false)}
                className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition mt-6"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {stayType === "short" ? "Select Dates" : "Select Months"}
              </h2>
              <button
                onClick={closeDatePickerModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              {/* SHORT STAY - Date Picker */}
              {stayType === "short" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Check-in Date</label>
                    <input
                      type="date"
                      min={today}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      min={checkInDate || today}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate) && (
                    <p className="text-sm text-red-600">Check-out date must be after check-in date.</p>
                  )}
                  {checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate) && isAtLeastThreeMonths(checkInDate, checkOutDate) && (
                    <p className="text-sm text-red-600">Short stay cannot be 3 months or more. Please choose Long Stay.</p>
                  )}
                </>
              )}

              {/* LONG STAY - Month Picker */}
              {stayType === "long" && (
                <>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">From Month</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Month</label>
                        <select
                          value={fromMonth}
                          onChange={(e) => setFromMonth(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {monthNames.map((month, monthIndex) => (
                            <option
                              key={month}
                              value={month}
                              disabled={fromYear === String(currentYear) && monthIndex < currentMonthIndex}
                            >
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Year</label>
                        <select
                          value={fromYear}
                          onChange={(e) => setFromYear(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">To Month</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Month</label>
                        <select
                          value={toMonth}
                          onChange={(e) => setToMonth(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {monthNames.map((month, monthIndex) => (
                            <option
                              key={month}
                              value={month}
                              disabled={
                                (toYear === String(currentYear) && monthIndex < currentMonthIndex) ||
                                (fromMonth && fromYear && toYear === fromYear && monthIndex < monthNames.indexOf(fromMonth))
                              }
                            >
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Year</label>
                        <select
                          value={toYear}
                          onChange={(e) => setToYear(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {fromMonth && fromYear && !isLongStayStartFromCurrentOrFuture(fromMonth, fromYear) && (
                    <p className="text-sm text-red-600">Start month must be current month or later.</p>
                  )}
                  {fromMonth && fromYear && toMonth && toYear && !isLongStayRangeChronological(fromMonth, fromYear, toMonth, toYear) && (
                    <p className="text-sm text-red-600">End month must be after start month.</p>
                  )}
                  {fromMonth && fromYear && toMonth && toYear && getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear) > 0 && getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear) < 3 && (
                    <p className="text-sm text-red-600">Long stay must be at least 3 months.</p>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDatePickerModal}
                  className="w-1/2 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinueToAvailability}
                  disabled={stayType === "short" 
                    ? !checkInDate || !checkOutDate || checkInDate < today || new Date(checkOutDate) <= new Date(checkInDate) || isAtLeastThreeMonths(checkInDate, checkOutDate)
                    : !fromMonth || !fromYear || !toMonth || !toYear || !isLongStayStartFromCurrentOrFuture(fromMonth, fromYear) || !isLongStayRangeChronological(fromMonth, fromYear, toMonth, toYear) || getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear) < 3
                  }
                  className="w-1/2 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Availability Status</h2>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  property.availabilityStatus === 'available' ? 'bg-emerald-50' : 
                  property.availabilityStatus === 'rented' ? 'bg-amber-50' : 
                  'bg-red-50'
                }`}>
                  {property.availabilityStatus === 'available' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  {property.availabilityStatus === 'rented' && <AlertCircle className="w-6 h-6 text-amber-600" />}
                  {property.availabilityStatus === 'archived' && <XCircle className="w-6 h-6 text-red-600" />}
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Current Status</p>
                  <p className={`text-xl font-bold mt-1 ${
                    property.availabilityStatus === 'available' ? 'text-emerald-700' : 
                    property.availabilityStatus === 'rented' ? 'text-amber-700' : 
                    'text-red-700'
                  }`}>
                    {property.availabilityStatus === 'available' && 'Available for Rent'}
                    {property.availabilityStatus === 'rented' && 'Currently Rented'}
                    {property.availabilityStatus === 'archived' && 'Archived'}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                <p>
                  {property.availabilityStatus === 'available' && 'This property is currently available for rent. Contact the landlord to inquire or schedule a viewing.'}
                  {property.availabilityStatus === 'rented' && 'This property has been rented out. Check back later for updates or explore other properties.'}
                  {property.availabilityStatus === 'archived' && 'This property is no longer available for rent and has been archived.'}
                </p>
              </div>
              <button
                onClick={handleBookNow}
                className="w-full bg-white text-emerald-700 border border-emerald-600 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition"
              >
                Book Now
              </button>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
        <h3 className="text-lg font-bold text-slate-900 mb-1">Verify Landlord Claims</h3>
        <p className="text-sm text-slate-500 mb-4">Did the apartment actually have these features? Click True, False, or leave blank if unsure.</p>
        
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