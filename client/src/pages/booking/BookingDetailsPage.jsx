import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
              <p className="text-slate-600 mb-1">{property.location?.address}</p>
              <p className="text-sm text-slate-500">{property.bedrooms || 1} bedroom(s), {property.bathrooms || 1} bathroom(s)</p>
              {selectedOption && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <h2 className="text-slate-900 font-semibold mb-1">Selected Option</h2>
                  <p className="text-sm">
                    {selectedOption.type} · {selectedOption.guests} · {stayType === "short" ? formatLkr(dailyPrice) : formatLkr(monthlyPrice)} per {stayType === "short" ? "night" : "month"}
                  </p>
                  {stayType === "short" ? (
                    <p className="text-xs text-slate-500 mt-1">Total for {nights} night{nights > 1 ? "s" : ""}: {formatLkr(shortStayTotal)} ({formatLkr(dailyPrice)} × {nights})</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Total for {months} month{months > 1 ? "s" : ""}: {formatLkr(longStayTotal)} ({formatLkr(monthlyPrice)} × {months})</p>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={submitBooking} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <p className="text-sm text-slate-500">Please enter your contact info and travel dates.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Stay Type</span>
                  <select
                    value={stayType}
                    onChange={(e) => setStayType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  >
                    <option value="short">Short stay</option>
                    <option value="long">Long stay</option>
                  </select>
                </label>

                {stayType === "long" && (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Months</span>
                    <input
                      type="number"
                      min={1}
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value) || 1)}
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full Name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Phone</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Check-in</span>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Check-out</span>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Additional notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  rows={4}
                  placeholder="Special requests, arrival time, etc."
                />
              </label>

              {stayType === "long" ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  Total for {months} month{months > 1 ? "s" : ""}: {formatLkr(longStayTotal)} ({formatLkr(monthlyPrice)} × {months})
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  Total for {nights} night{nights > 1 ? "s" : ""}: {formatLkr(shortStayTotal)} ({formatLkr(dailyPrice)} × {nights})
                </div>
              )}
              {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              {successMessage && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>}

              <div className="flex gap-3 items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Confirm Booking"}
                </button>

                <Link to={`/booking/${id}`} className="text-sm text-slate-500 hover:text-slate-700">Back to options</Link>
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookingDetailsPage;
