import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import BookingDetailsHeaderCard from "../../components/booking/BookingDetailsHeaderCard";
import BookingDetailsForm from "../../components/booking/BookingDetailsForm";
import {
  getDailyRate,
  getMonthlyRate,
  calculateNightsCeil,
  formatLkr,
} from "../../utils/bookingPricing";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BookingDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedOption = location.state?.selectedOption || null;
  const defaultAdults = location.state?.adults || 2;
  const defaultChildren = location.state?.children || 0;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [stayType, setStayType] = useState(location.state?.stayType || "short");
  const [months, setMonths] = useState(location.state?.selectedMonths || 1);
  const [longStayTotal, setLongStayTotal] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
        setProperty(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching property", err);
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (location.state?.checkInDate) setCheckInDate(location.state.checkInDate);
    if (location.state?.checkOutDate) setCheckOutDate(location.state.checkOutDate);
  }, [location.state]);

  const nights = calculateNightsCeil(checkInDate, checkOutDate);

  const dailyPrice = property ? getDailyRate(property) : 0;
  const monthlyPrice = property ? getMonthlyRate(property) : 0;

  const shortStayTotal = stayType === "short" ? dailyPrice * nights : 0;

  useEffect(() => {
    if (stayType === "long") {
      setLongStayTotal(monthlyPrice * months);
    } else {
      setLongStayTotal(0);
    }
  }, [stayType, months, monthlyPrice]);

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      setError("Please select both check-in and check-out dates.");
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
        apartmentId: id,
        stayType,
        checkInDate,
        checkOutDate,
        numberOfGuests: Math.max(1, defaultAdults + defaultChildren),
        ...(stayType === "long" ? { months } : {}),
        totalPrice,
      };

      await axios.post(`${API_BASE_URL}/api/bookings`, payload, {
        withCredentials: true,
      });

      setSuccessMessage("Booking request created successfully.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err) {
      console.error("Error creating booking", err);
      setError(err.response?.data?.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <Link to={`/booking/${id}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to options
        </Link>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">Loading booking details…</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
        ) : (
          <div className="space-y-6">
            <BookingDetailsHeaderCard
              property={property}
              selectedOption={selectedOption}
              stayType={stayType}
              dailyPrice={dailyPrice}
              monthlyPrice={monthlyPrice}
              nights={nights}
              shortStayTotal={shortStayTotal}
              months={months}
              longStayTotal={longStayTotal}
              formatLkr={formatLkr}
            />

            <BookingDetailsForm
              onSubmit={submitBooking}
              stayType={stayType}
              setStayType={setStayType}
              months={months}
              setMonths={setMonths}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              checkInDate={checkInDate}
              setCheckInDate={setCheckInDate}
              checkOutDate={checkOutDate}
              setCheckOutDate={setCheckOutDate}
              notes={notes}
              setNotes={setNotes}
              dailyPrice={dailyPrice}
              monthlyPrice={monthlyPrice}
              nights={nights}
              shortStayTotal={shortStayTotal}
              longStayTotal={longStayTotal}
              formatLkr={formatLkr}
              error={error}
              successMessage={successMessage}
              submitting={submitting}
              bookingId={id}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookingDetailsPage;
