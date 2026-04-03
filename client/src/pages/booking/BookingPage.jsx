import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { ChevronDown, X, CheckCircle2, AlertCircle, MapPin, Bed, Bath, Maximize } from "lucide-react";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import { useAuth } from "../../context/AuthContext";
import {
  getDailyRate,
  getMonthlyRate,
  calculateNightsCeil,
  calculateMonthsFromDates,
  formatLkr,
} from "../../utils/bookingPricing";
import { startBookingTimer, clearBookingTimer, getRemainingBookingMs } from "./bookingTimer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, backendUser } = useAuth();
  const [checkInDate, setCheckInDate] = useState(location.state?.checkInDate || "");
  const [checkOutDate, setCheckOutDate] = useState(location.state?.checkOutDate || "");
  const [stayType, setStayType] = useState(location.state?.stayType || null);
  const [selectedMonths, setSelectedMonths] = useState(location.state?.selectedMonths || null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [shortStayGuests, setShortStayGuests] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [existingBookingData, setExistingBookingData] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Handle edit mode from payment page
    if (location.state?.editMode && location.state?.bookingData) {
      setEditMode(true);
      setExistingBookingData(location.state.bookingData);
      setUserDetails(location.state.userDetails);
      setCheckInDate(location.state.bookingData.checkInDate || "");
      setCheckOutDate(location.state.bookingData.checkOutDate || "");
      setStayType(location.state.bookingData.stayType || null);
      setSelectedMonths(location.state.bookingData.months || null);
      setShortStayGuests(location.state.bookingData.numberOfGuests || 1);
    } else {
      if (location.state?.checkInDate) setCheckInDate(location.state.checkInDate);
      if (location.state?.checkOutDate) setCheckOutDate(location.state.checkOutDate);
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
        setProperty(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);



  const generateOptions = (nights = 7) => {
    if (!property) return [];
    const effectiveNights = nights >= 1 ? nights : 7;
    const dailyRate = getDailyRate(property);
    const monthlyRate = getMonthlyRate(property);
    const totalShort = dailyRate * effectiveNights;
    const pst = property.stayType || "long";

    return [
      {
        id: 1,
        type: property.propertyType || "Apartment",
        guests: "1+",
        price: formatLkr(dailyRate),
        pricePerNight: formatLkr(dailyRate),
        pricePerMonth: formatLkr(monthlyRate),
        pricePerWeek: formatLkr(dailyRate * 7),
        priceForNights: formatLkr(totalShort),
        propertyStayType: pst,
        dailyRate,
        monthlyRate,
        details: `${property.bedrooms || 1} Bedroom${(property.bedrooms || 1) !== 1 ? 's' : ''} · ${property.bathrooms || 1} Bathroom${(property.bathrooms || 1) !== 1 ? 's' : ''} · ${property.area || 'N/A'} sqft`,
        cancellation: "Free cancellation before 30 days",
        prepayment: "Full or partial payment must be made at the time of booking",
        amenities: property.ecoFeatures 
          ? Object.entries(property.ecoFeatures)
              .filter(([key, value]) => value === true || value === "Yes" || value === "true")
              .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
              .slice(0, 6)
          : ["Modern amenities", "Comfortable stay", "Eco-friendly"],
        title: property.title || "Apartment",
        location: property.location?.address || "Location not provided",
      }
    ];
  };

  const nights = calculateNightsCeil(checkInDate, checkOutDate);
  const propertyStayType = stayType || property?.stayType || "long";
  const monthsFromDates = selectedMonths || (
    checkInDate && checkOutDate ? calculateMonthsFromDates(checkInDate, checkOutDate) : 0
  );
  const dailyRate = property ? getDailyRate(property) : 0;
  const monthlyRate = property ? getMonthlyRate(property) : 0;
  const shortRentLine =
    (propertyStayType === "short" || propertyStayType === "both") && nights > 0
      ? dailyRate * nights
      : null;
  const longRentFromDates =
    (propertyStayType === "long" || propertyStayType === "both") &&
    monthsFromDates > 0 &&
    checkInDate &&
    checkOutDate
      ? monthlyRate * monthsFromDates
      : null;
  const options = generateOptions(nights);

  const includedShortStayGuests = property?.maxGuests ?? property?.guests ?? 3;

  useEffect(() => {
    if (property && (propertyStayType === "short" || propertyStayType === "both")) {
      setShortStayGuests(includedShortStayGuests);
    }
  }, [property, propertyStayType, includedShortStayGuests]);

  const shortExtraGuests = Math.max(0, shortStayGuests - includedShortStayGuests);
  const shortExtraGuestChargePerNight = shortExtraGuests * 1000;
  const shortExtraGuestTotal = (propertyStayType === "short" || propertyStayType === "both") ? shortExtraGuestChargePerNight * nights : 0;
  const shortStayWithGuestTotal = (propertyStayType === "short" || propertyStayType === "both") ? (dailyRate * nights) + shortExtraGuestTotal : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Error</h1>
            <p className="text-slate-600 mb-6">{error || "Property not found."}</p>
            <Link
              to="/properties"
              className="inline-flex items-center px-5 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Back to Properties
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="w-full px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Sidebar Left: Property, Booking Details & Price Summary */}
          <div className="w-full lg:w-[32%] flex flex-col gap-4 sticky top-6">
            
            {/* Card 1: Your Booking Details */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-4">Your booking details</h2>
                
                <div className="flex items-start">
                  <div className="w-1/2 pr-3 border-r border-slate-200">
                    <p className="text-[14px] font-medium text-slate-800">Check-in</p>
                    <p className="font-bold text-[16px] text-slate-900 mt-1">{formatDate(checkInDate)}</p>
                    <p className="text-[13px] text-slate-500 mt-1 font-medium">From 14:00</p>
                  </div>
                  <div className="w-1/2 pl-4">
                    <p className="text-[14px] font-medium text-slate-800">Check-out</p>
                    <p className="font-bold text-[16px] text-slate-900 mt-1">{formatDate(checkOutDate)}</p>
                    <p className="text-[13px] text-slate-500 mt-1 font-medium">Until 12:00</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 text-[14px] text-[#008234] font-bold">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    Enjoy a midday check-out
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d4111e] font-bold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    Check-in is on time
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-200 bg-white">
                <p className="text-[14px] font-medium text-slate-800">You selected</p>
                <p className="font-bold text-slate-900 text-[16px] mt-1">
                  {propertyStayType === "long" 
                    ? `${monthsFromDates} month${monthsFromDates !== 1 ? 's' : ''}` 
                    : `${nights} night${nights !== 1 ? 's' : ''}`
                  }
                </p>
                <p className="text-[14px] text-slate-600 mt-2">1 x {property.title || "Apartment"}</p>
                <Link to={`/properties/${id}`} className="text-[#0071c2] hover:underline text-[14px] font-bold mt-4 inline-block">
                  Change your selection
                </Link>
              </div>
            </div>

            {/* Card 2: Your Price Summary */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-4">Your price summary</h2>
                
                <div className="flex justify-between items-center">
                  <p className="text-slate-800 text-[15px]">{propertyStayType === "long" ? "Rate per month" : "Rate per night"}</p>
                  <p className="text-slate-800 text-[15px]">
                    {propertyStayType === "long" ? formatLkr(monthlyRate) : formatLkr(dailyRate)}
                  </p>
                </div>

                {(propertyStayType === "short" || propertyStayType === "both") && (
                  <div className="mt-4 bg-white border border-slate-200 rounded-lg p-3">
                    <label className="text-sm font-semibold text-slate-800">Number of guests (short stay)</label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={includedShortStayGuests}
                        max={15}
                        value={shortStayGuests}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setShortStayGuests(Math.max(includedShortStayGuests, Math.min(15, isNaN(value) ? includedShortStayGuests : value)));
                        }}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      />
                      <span className="text-xs text-slate-500">
                        First {includedShortStayGuests} guests included; each extra guest +Rs 1000/night.
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Extra guests: {shortExtraGuests} (additional fee: {formatLkr(shortExtraGuestTotal)})
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-[#EAF7EF] p-5 flex flex-col">
                <div className="flex justify-between items-end">
                  <h3 className="text-[32px] font-bold text-slate-900 leading-none">Price</h3>
                  <div className="text-right">
                    <p className="text-[32px] font-bold text-slate-900 leading-none">
                      {propertyStayType === "long" ? formatLkr(longRentFromDates) : formatLkr(shortStayWithGuestTotal)}
                    </p>
                  </div>
                </div>
                <p className="text-[13px] text-slate-500 text-right mt-2">Includes taxes and charges</p>
                <p className="text-[14px] font-bold text-slate-700 text-right mt-1">
                  In property currency: {propertyStayType === "long" ? formatLkr(longRentFromDates).replace('Rs', 'LKR') : formatLkr(shortStayWithGuestTotal).replace('Rs', 'LKR')}
                </p>
              </div>
            </div>
            
          </div>

          {/* Main Content Right: Options */}
          <div className="w-full lg:w-[68%] space-y-6">
            
            {/* Detailed Property Card */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col sm:flex-row">
               <div className="sm:w-1/3 h-48 sm:h-auto bg-slate-100 relative">
                  <img 
                    src={property.images && property.images.length > 0 ? property.images[0] : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600"} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur font-bold text-[#0071c2] text-[11px] px-2 py-1 rounded uppercase tracking-wider">
                    {property.propertyType || "Apartment"}
                  </div>
               </div>
               <div className="sm:w-2/3 p-5 sm:p-6 flex flex-col">
                  <h2 className="text-[22px] font-bold text-slate-900 leading-tight mb-2">{property.title}</h2>
                  <p className="text-[14px] text-slate-600 flex items-start gap-1.5 mb-4">
                     <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                     {property.location?.address || "Location not provided"}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-700 font-bold mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-[#008234]" /> {property.bedrooms || 1} Bedrooms</div>
                    <div className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-[#008234]" /> {property.bathrooms || 1} Bathrooms</div>
                    <div className="flex items-center gap-1.5"><Maximize className="w-4 h-4 text-[#008234]" /> {property.area || 'N/A'} sqft</div>
                  </div>
                  
                  <p className="text-[13px] text-slate-600 line-clamp-2 mt-auto">
                    {property.description || "A beautiful, eco-friendly property perfectly equipped for your stay."}
                  </p>
               </div>
            </div>

            {/* Header info */}
            <div className="mb-4">
              <h1 className="text-[24px] font-bold text-slate-900">Accommodation</h1>
            </div>

            <div className="space-y-6">
              {options.map((option, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition ${
                    selectedOption?.id === option.id ? 'border-[#0071c2] ring-1 ring-[#0071c2]' : 'border-slate-300'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                    {/* Left: Accommodation rules Details */}
                    <div className="md:col-span-2">
                      <div className="space-y-1.5 text-[13px]">
                        <p className="text-[#008234] font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {option.cancellation}</p>
                        <br></br>
                        <p className="text-[#008234] font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {option.prepayment}</p>
                      </div>
                    </div>

                    {/* Middle: Price & Info */}
                    <div className="md:col-span-1 flex flex-col border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                      <div>
                        {option.propertyStayType === "long" ? (
                          <>
                            <p className="text-[11px] text-slate-500 font-bold mb-1">Price per month</p>
                            <p className="text-[20px] font-bold text-slate-900 mb-1">{option.pricePerMonth}</p>
                            <p className="text-[11px] text-slate-500">Includes taxes and charges</p>
                            {longRentFromDates != null && (
                              <p className="text-[12px] text-slate-700 mt-2 font-bold bg-amber-50 p-2 rounded border border-amber-100">
                                Total: {formatLkr(longRentFromDates)}
                              </p>
                            )}
                          </>
                        ) : option.propertyStayType === "both" ? (
                          <>
                            <p className="text-[11px] text-slate-500 uppercase font-bold mb-1">Short stay (per night)</p>
                            <p className="text-[20px] font-bold text-slate-900 mb-1">{option.pricePerNight}</p>
                            <p className="text-[11px] text-slate-500 uppercase font-bold mb-1 mt-3">Long stay (per month)</p>
                            <p className="text-[16px] font-bold text-slate-800">{option.pricePerMonth}</p>
                            <p className="text-[11px] text-slate-500">Includes taxes and charges</p>
                            <p className="text-[12px] text-slate-700 mt-2 font-bold bg-amber-50 p-2 rounded border border-amber-100">
                              Total (short): {option.priceForNights}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] text-slate-500 font-bold mb-1">Price per night</p>
                            <p className="text-[20px] font-bold text-slate-900 mb-1">{option.pricePerNight}</p>
                            <p className="text-[11px] text-slate-500">Includes taxes and charges</p>
                            <p className="text-[12px] text-slate-700 mt-2 font-bold bg-amber-50 p-2 rounded border border-amber-100">Total: {option.priceForNights}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Reserve Button */}
                    <div className="md:col-span-2 flex flex-col items-end justify-start border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                    
                      <button 
                        onClick={() => {
                          setSelectedOption(option);
                          setShowDetailModal(true);
                        }}
                        className="w-full px-4 py-2.5 bg-[#28A745] text-white font-bold rounded-md hover:bg-[#1E7E34] transition mb-2"
                      >
                        I'll reserve
                      </button>
                      <p className="text-[11px] text-slate-500 text-center md:text-right">
                        Confirmation is immediate
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link at bottom of UI */}
        <div className="max-w-6xl mx-auto pt-8 mt-4 border-t border-slate-200">
          <Link
            to={`/properties/${id}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 hover:text-slate-900 hover:shadow transition-all"
          >
            ← Back to Property Details
          </Link>
        </div>
      </main>
      
      {/* Details Modal */}
      {showDetailModal && selectedOption && (
        <BookingDetailsModal
          property={property}
          selectedOption={selectedOption}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          backendUser={backendUser}
          currentUser={currentUser}
          onClose={() => setShowDetailModal(false)}
          navigate={navigate}
          defaultStayType={propertyStayType}
          defaultMonths={monthsFromDates || 1}
          editMode={editMode}
          existingBookingData={existingBookingData}
          userDetails={userDetails}
        />
      )}

      <Footer />
    </div>
  );
};

const BookingDetailsModal = ({ property, selectedOption, checkInDate, checkOutDate, backendUser, currentUser, onClose, navigate, defaultStayType, defaultMonths, editMode = false, existingBookingData = null, userDetails = null }) => {
  const [fullName, setFullName] = useState(userDetails?.fullName || backendUser?.name || currentUser?.displayName || "");
  const [email, setEmail] = useState(userDetails?.email || backendUser?.email || currentUser?.email || "");
  const [phone, setPhone] = useState(userDetails?.phone || "");
  const [notes, setNotes] = useState(userDetails?.notes || "");
  const [stayType, setStayType] = useState(() =>
    editMode && existingBookingData ? existingBookingData.stayType : (defaultStayType === "both" ? "long" : (defaultStayType || "short"))
  );
  const [months, setMonths] = useState(editMode && existingBookingData ? existingBookingData.months : defaultMonths);
  const includedGuests = property?.maxGuests ?? property?.guests ?? 3;
  const [guests, setGuests] = useState(editMode && existingBookingData ? existingBookingData.numberOfGuests : includedGuests);
  const [longStayTotal, setLongStayTotal] = useState(0);
  const [error, setError] = useState("");

  const nights = calculateNightsCeil(checkInDate, checkOutDate);
  const dailyRate = getDailyRate(property);
  const monthlyRate = getMonthlyRate(property);

  const extraGuestChargePerNight = guests > includedGuests ? (guests - includedGuests) * 1000 : 0;
  const extraGuestTotal = stayType === "short" ? extraGuestChargePerNight * nights : 0;
  const shortStayTotal = stayType === "short" ? (dailyRate * nights) + extraGuestTotal : 0;

  useEffect(() => {
    const name = backendUser?.name || currentUser?.displayName;
    const mail = backendUser?.email || currentUser?.email;
    if (!userDetails && name) setFullName(name);
    if (!userDetails && mail) setEmail(mail);
  }, [backendUser, currentUser, userDetails]);

  useEffect(() => {
    if (stayType === "short") {
      setGuests(includedGuests);
    }
  }, [stayType, includedGuests]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Autofill user data when available (only if no userDetails provided)
  useEffect(() => {
    if (!userDetails && backendUser) {
      setFullName(backendUser.name || "");
      setEmail(backendUser.email || "");
    }
  }, [backendUser, userDetails]);

  useEffect(() => {
    if (stayType === "long") {
      setLongStayTotal(monthlyRate * months);
    } else {
      setLongStayTotal(0);
    }
  }, [stayType, months, monthlyRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedPhone = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError("Phone number must be exactly 10 digits and contain numbers only.");
      return;
    }

    if (stayType === "short") {
      if (!guests || guests < 1) {
        setError("Please enter a valid number of guests for short stay.");
        return;
      }
      if (guests > 15) {
        setError("A maximum of 15 guests is allowed for short stay.");
        return;
      }
    }

    if (!checkInDate || !checkOutDate) {
      setError("Please set check-in and check-out dates before continuing.");
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const totalPrice = stayType === "long" ? longStayTotal : shortStayTotal;
      const payload = {
        apartmentId: property?._id,
        stayType,
        checkInDate,
        checkOutDate,
        numberOfGuests: stayType === "short" ? guests : 1,
        ...(stayType === "long" ? { months } : {}),
        totalPrice,
      };

      let response;
      if (editMode && existingBookingData) {
        // Update existing booking
        response = await axios.put(`${API_BASE_URL}/api/bookings/${existingBookingData._id}`, payload, { withCredentials: true });
        setSuccessMessage("Booking updated successfully. Redirecting to payment...");
      } else {
        // Create new booking
        response = await axios.post(`${API_BASE_URL}/api/bookings`, payload, { withCredentials: true });
        setSuccessMessage("Booking request saved successfully. Redirecting to payment...");
      }

      const savedBooking = response.data?.booking || response.data;
      const bookingPayload = savedBooking
        ? {
            _id: savedBooking._id || existingBookingData._id,
            apartmentId: savedBooking.apartmentId || payload.apartmentId,
            stayType: savedBooking.stayType || payload.stayType,
            checkInDate: savedBooking.checkInDate || payload.checkInDate,
            checkOutDate: savedBooking.checkOutDate || payload.checkOutDate,
            numberOfGuests: savedBooking.numberOfGuests || payload.numberOfGuests,
            months: savedBooking.months || payload.months,
            totalPrice: savedBooking.totalPrice || payload.totalPrice,
            paymentStatus: savedBooking.paymentStatus || 'pending',
            status: savedBooking.status || 'pending',
          }
        : payload;
      // Start timer when the user confirms (new flow). Old timer is cleared if there is one.
      if (bookingPayload?._id) {
        // Only start a new timer if there's no existing active timer
        if (getRemainingBookingMs(bookingPayload._id) <= 0) {
          clearBookingTimer(bookingPayload._id);
          startBookingTimer(bookingPayload._id, 15);
        }
      }

      setTimeout(() => {
        navigate(`/payment/${property?._id}`, {
          state: {
            bookingData: bookingPayload,
            selectedOption,
            property,
            userDetails: {
              fullName,
              email,
              phone,
              notes,
            },
          },
        });
      }, 1500);
    } catch (err) {
      const data = err.response?.data;
      const validationMsg = Array.isArray(data?.errors) && data.errors.length > 0
        ? String(data.errors[0])
        : null;

      const msg = validationMsg || data?.message || "Failed to save booking. Please try again.";

      if (err.response?.status === 401 || msg.toLowerCase().includes("no token")) {
        setError("You must be logged in to book. Redirecting to login...");
        setTimeout(() => {
          navigate('/login', { state: { from: `/booking/${property?._id}` } });
        }, 1000);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-2">{editMode ? "Edit Booking" : "Confirm Booking"}</h2>
        <p className="text-slate-500 mb-4">{property?.title || "Selected property"}</p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
          <p className="text-sm font-semibold">Selected option:</p>
          <p>
            {selectedOption?.type} · {selectedOption?.guests} ·{" "}
            {stayType === "short"
              ? `${formatLkr(dailyRate)} / night`
              : `${formatLkr(monthlyRate)} / month`}
          </p>
          <p className="text-xs text-slate-500 mt-1">{property?.location?.address || "No address"}</p>
          <p className="text-xs text-slate-500 mt-1">Check-in: {checkInDate || "-"}, Check-out: {checkOutDate || "-"}</p>
          {stayType === "short" ? (
            <>
              <p className="text-xs text-slate-500 mt-1">Guests: {guests} (First {includedGuests} included; extra {Math.max(0, guests - includedGuests)} × Rs 1000/night)</p>
              <p className="text-xs text-slate-500 mt-1">
                Base for {nights} night{nights > 1 ? "s" : ""}: {formatLkr(dailyRate * nights)} ({formatLkr(dailyRate)} × {nights})
              </p>
              {extraGuestTotal > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Extra guest charge: {formatLkr(extraGuestTotal)} ({Math.max(0, guests - 3)} × Rs 1000 × {nights})
                </p>
              )}
              <div className="mt-2 rounded-lg border border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-100 px-3 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Total Payable</p>
                <p className="mt-1 text-xl font-extrabold leading-none text-emerald-900">
                  {formatLkr(shortStayTotal)}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  for {nights} night{nights > 1 ? "s" : ""}
                </p>
              </div>
            </>
          ) : (
            <div className="mt-2 rounded-lg border border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-100 px-3 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Total Payable</p>
              <p className="mt-1 text-xl font-extrabold leading-none text-emerald-900">
                {formatLkr(longStayTotal)}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                for {months} month{months > 1 ? "s" : ""} ({formatLkr(monthlyRate)} × {months})
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {backendUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p>✨ Your name and email have been auto-filled from your profile. Please add your phone number to complete the booking.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span>Stay Type</span>
              <select
                value={stayType}
                onChange={(e) => setStayType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="short">Short stay</option>
                <option value="long">Long stay</option>
              </select>
            </label>
            {stayType === "long" && (
              <label className="block text-sm">
                <span>Months</span>
                <input
                  type="number"
                  min={1}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            )}
            {stayType === "short" && (
              <label className="block text-sm">
                <span>Number of Guests</span>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
                <small className="text-xs text-slate-500">First {includedGuests} guests included; extra guests charged Rs 1000 per night each.</small>
              </label>
            )}
            <label className="block text-sm">
              <span>Name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
                placeholder={backendUser ? "Auto-filled from your profile" : "Enter your full name"}
              />
            </label>
            <label className="block text-sm">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
                placeholder={backendUser ? "Auto-filled from your profile" : "Enter your email"}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  setPhone(onlyDigits.slice(0, 10));
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
                placeholder="Enter 10-digit phone number"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              rows={4}
            />
          </label>

          {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700">{error}</p>}
          {successMessage && <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-700">{successMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : (editMode ? "Update Booking" : "Confirm Booking")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;