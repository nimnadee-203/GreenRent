import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";
import {
  getDailyRate,
  getMonthlyRate,
  calculateNightsCeil,
  formatLkr,
} from "../../utils/bookingPricing";
import { startBookingTimer, clearBookingTimer, getRemainingBookingMs } from "../../pages/booking/bookingTimer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function BookingDetailsModal({
  property,
  propertyId,
  selectedOption,
  checkInDate,
  checkOutDate,
  backendUser,
  currentUser,
  isAuthenticated,
  onClose,
  navigate,
  defaultStayType,
  defaultMonths,
  editMode = false,
  existingBookingData = null,
  userDetails = null,
}) {
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
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      const authMessage = "Please login or sign up to continue your booking.";
      setError(authMessage);
      navigate("/login", {
        state: {
          from: `/properties/${propertyId}`,
          mode: "login",
          message: authMessage,
          postLoginState: {
            resumeAvailabilityFlow: true,
          },
        },
      });
      return;
    }

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
        response = await axios.put(`${API_BASE_URL}/api/bookings/${existingBookingData._id}`, payload, { withCredentials: true });
        setSuccessMessage("Booking updated successfully. Redirecting to payment...");
      } else {
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
            paymentStatus: savedBooking.paymentStatus || "pending",
            status: savedBooking.status || "pending",
          }
        : payload;

      if (bookingPayload?._id) {
        if (getRemainingBookingMs(bookingPayload._id) <= 0) {
          clearBookingTimer(bookingPayload._id);
          startBookingTimer(bookingPayload._id, 15);
        }
      }

      setTimeout(() => {
        navigate(`/payment/${bookingPayload?._id}`, {
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
          navigate("/login", {
            state: {
              from: `/properties/${property?._id || propertyId}`,
              mode: "login",
              message: "Please login or sign up to continue your booking.",
              postLoginState: {
                resumeAvailabilityFlow: true,
              },
            },
          });
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
            {selectedOption?.type} · {selectedOption?.guests} · {" "}
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

        {!isAuthenticated && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p>Please login or sign up to continue this booking.</p>
              <Link
                to="/login"
                state={{
                  from: `/properties/${propertyId}`,
                  mode: "login",
                  message: "Please login or sign up to continue your booking.",
                  postLoginState: {
                    resumeAvailabilityFlow: true,
                  },
                }}
                className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700"
              >
                Login / Sign up
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {backendUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p>Your name and email have been auto-filled from your profile. Please add your phone number to complete the booking.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span>Stay Type</span>
              <select
                value={stayType}
                onChange={(event) => setStayType(event.target.value)}
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
                  onChange={(event) => setMonths(Number(event.target.value) || 1)}
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
                  onChange={(event) => setGuests(Math.max(1, Math.min(15, Number(event.target.value) || 1)))}
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
                onChange={(event) => setFullName(event.target.value)}
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
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => {
                  const onlyDigits = event.target.value.replace(/\D/g, "");
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
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              rows={4}
            />
          </label>

          {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700">{error}</p>}
          {successMessage && <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-700">{successMessage}</p>}

          <button
            type="submit"
            disabled={submitting || !isAuthenticated}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {!isAuthenticated
              ? "Login to Continue"
              : submitting
                ? "Saving..."
                : (editMode ? "Update Booking" : "Confirm Booking")}
          </button>
        </form>
      </div>
    </div>
  );
}
