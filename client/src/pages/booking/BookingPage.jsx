import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import BookingSummarySidebar from "../../components/booking/BookingSummarySidebar";
import BookingPropertyOverviewCard from "../../components/booking/BookingPropertyOverviewCard";
import BookingOptionCard from "../../components/booking/BookingOptionCard";
import BookingDetailsModal from "../../components/booking/BookingDetailsModal";
import { useAuth } from "../../context/AuthContext";
import {
  getDailyRate,
  getMonthlyRate,
  calculateNightsCeil,
  calculateMonthsFromDates,
  formatLkr,
} from "../../utils/bookingPricing";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, backendUser } = useAuth();
  const isAuthenticated = Boolean(currentUser || backendUser);
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
          <BookingSummarySidebar
            propertyId={id}
            property={property}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            propertyStayType={propertyStayType}
            monthsFromDates={monthsFromDates}
            nights={nights}
            includedShortStayGuests={includedShortStayGuests}
            shortStayGuests={shortStayGuests}
            setShortStayGuests={setShortStayGuests}
            shortExtraGuests={shortExtraGuests}
            shortExtraGuestTotal={shortExtraGuestTotal}
            dailyRate={dailyRate}
            monthlyRate={monthlyRate}
            longRentFromDates={longRentFromDates}
            shortStayWithGuestTotal={shortStayWithGuestTotal}
            formatDate={formatDate}
          />

          {/* Main Content Right: Options */}
          <div className="w-full lg:w-[68%] space-y-6">
            
            <BookingPropertyOverviewCard property={property} />

            {/* Header info */}
            <div className="mb-4">
              <h1 className="text-[24px] font-bold text-slate-900">Accommodation</h1>
            </div>

            <div className="space-y-6">
              {options.map((option, idx) => (
                <BookingOptionCard
                  key={idx}
                  option={option}
                  selectedOption={selectedOption}
                  propertyStayType={propertyStayType}
                  longRentFromDates={longRentFromDates}
                  shortStayWithGuestTotal={shortStayWithGuestTotal}
                  onReserve={() => {
                    setSelectedOption(option);
                    setShowDetailModal(true);
                  }}
                />
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
          propertyId={id}
          selectedOption={selectedOption}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          backendUser={backendUser}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
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

export default BookingPage;