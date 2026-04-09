import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { jsPDF } from "jspdf";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import PaymentSuccessView from "../../components/booking/PaymentSuccessView";
import PaymentFormCard from "../../components/booking/PaymentFormCard";
import PaymentSummaryCard from "../../components/booking/PaymentSummaryCard";
import BookingCancelModals from "../../components/booking/BookingCancelModals";
import {
  getDailyRate,
  getMonthlyRate,
  calculateNightsCeil,
  calculateMonthsFromDates,
  formatLkr,
} from "../../utils/bookingPricing";
import {
  getRemainingBookingMs,
  formatBookingRemaining,
  clearBookingTimer,
} from "./bookingTimer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PaymentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const routeBookingData = location.state?.bookingData;
  const routeSelectedOption = location.state?.selectedOption;
  const routeProperty = location.state?.property;
  const routeUserDetails = location.state?.userDetails;

  const [resolvedBookingData, setResolvedBookingData] = useState(routeBookingData || null);
  const [resolvedSelectedOption, setResolvedSelectedOption] = useState(routeSelectedOption || null);
  const [resolvedProperty, setResolvedProperty] = useState(routeProperty || null);
  const [pageLoading, setPageLoading] = useState(!routeBookingData || !routeProperty);

  const bookingData = resolvedBookingData;
  const selectedOption = resolvedSelectedOption;
  const property = resolvedProperty;
  const userDetails = routeUserDetails;
  const propertyId = property?._id || bookingData?.apartmentId?._id || bookingData?.apartmentId;

  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cardBrand, setCardBrand] = useState("visa");
  const [cardType, setCardType] = useState("credit");
  const [cardHolder, setCardHolder] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("15:00");
  const [timerExpired, setTimerExpired] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [bookingCancelled, setBookingCancelled] = useState(false);
  const [cancelledBookingId, setCancelledBookingId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const resolveBookingContext = async () => {
      try {
        setPageLoading(true);

        let booking = routeBookingData;
        if (!booking) {
          const bookingResponse = await axios.get(`${API_BASE_URL}/api/bookings/${id}`, {
            withCredentials: true,
          });
          booking = bookingResponse.data?.booking || bookingResponse.data;
        }

        if (!booking) {
          throw new Error("Booking not found for payment session.");
        }

        const apartmentRef = booking?.apartmentId?._id || booking?.apartmentId;
        let propertyData = routeProperty;
        if (!propertyData && apartmentRef) {
          const propertyResponse = await axios.get(`${API_BASE_URL}/api/properties/${apartmentRef}`);
          propertyData = propertyResponse.data;
        }

        let secret = "";
        try {
          if (booking?._id) {
            const { data } = await axios.post(
              `${API_BASE_URL}/api/payments/create-payment-intent`,
              { bookingId: booking._id },
              { withCredentials: true }
            );
            secret = data.clientSecret;
          }
        } catch (err) {
          console.error("Failed to init payment intent", err);
        }

        if (isMounted) {
          setResolvedBookingData(booking);
          setResolvedProperty(propertyData || null);
          if (!routeSelectedOption) {
            setResolvedSelectedOption({
              type: booking?.stayType === "long" ? "Long stay" : "Short stay",
            });
          }
          setClientSecret(secret);
          setPaymentError("");
        }
      } catch (error) {
        if (isMounted) {
          setResolvedBookingData(null);
          setResolvedProperty(null);
          setPaymentError(error?.response?.data?.message || error.message || "Unable to load this booking payment session.");
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    resolveBookingContext();

    return () => {
      isMounted = false;
    };
  }, [id, routeBookingData, routeProperty, routeSelectedOption]);

  const formatInvoiceDate = (value) => {
    if (!value) return "-";
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }
    return parsedDate.toLocaleDateString("en-LK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const downloadReceipt = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    const invoiceDate = new Date().toLocaleDateString("en-LK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const customerName = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") || "Guest";
    const nightsCount = stayType === "short" ? nights : monthsForLong;
    const rateLabel = stayType === "short" ? `${formatLkr(dailyRate)} / night` : `${formatLkr(monthlyRate)} / month`;
    const bookingTypeLabel = selectedOption?.type || bookingData?.stayType || "Booking";
    const stayLabel = stayType === "long" ? "Long stay (monthly)" : "Short stay (nightly)";
    const paymentMethodLabel = `${cardBrand?.toUpperCase() || "CARD"} ${cardType ? `(${cardType})` : ""}`.trim();
    const maskedCard = cardNumber ? `**** **** **** ${cardNumber.replace(/\s/g, "").slice(-4)}` : "Not provided";
    const bookingRef = bookingData?._id || "-";
    const lines = [
      ["Booking ID", bookingRef],
      ["Status", "Paid / Confirmed"],
      ["Property", property?.title || "-"],
      ["Booking type", bookingTypeLabel],
      ["Stay type", stayLabel],
      ["Guest name", customerName],
      ["Guests", `${bookingData?.numberOfGuests || 0}`],
      ["Check-in", formatInvoiceDate(bookingData?.checkInDate)],
      ["Check-out", formatInvoiceDate(bookingData?.checkOutDate)],
      ["Payment method", paymentMethodLabel],
      ["Card number", maskedCard],
      ["Card holder", cardHolder || customerName],
      ["Rate", rateLabel],
      [stayType === "short" ? "Nights" : "Months", `${nightsCount}`],
      ["Total paid", formatLkr(bookingData?.totalPrice)],
    ];

    doc.setFillColor(4, 120, 87);
    doc.rect(0, 0, pageWidth, 34, "F");
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 34, pageWidth, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("GreenRent", margin, 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Receipt / Invoice", margin, 22);
    doc.text(`Issued on ${invoiceDate}`, pageWidth - margin, 22, { align: "right" });

    doc.setTextColor(15, 23, 42);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, 44, contentWidth, 30, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Payment confirmed", margin + 6, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Your booking for ${property?.title || "your property"} has been confirmed and paid in full.`, margin + 6, 63, { maxWidth: contentWidth - 12 });

    let y = 84;
    const labelX = margin + 6;
    const valueX = pageWidth / 2 + 6;
    const rowHeight = 10;
    const rowGap = 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Booking details", margin, y);
    y += 6;

    lines.forEach(([label, value], index) => {
      const isLeftColumn = index % 2 === 0;
      const rowY = y + Math.floor(index / 2) * 18;
      const columnX = isLeftColumn ? labelX : valueX;
      const boxWidth = (contentWidth - 6) / 2;
      const boxX = isLeftColumn ? margin : pageWidth / 2;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(boxX, rowY, boxWidth, 16, 3, 3, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label, columnX, rowY + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(doc.splitTextToSize(String(value ?? "-"), boxWidth - 12), columnX, rowY + 11);
    });

    y += Math.ceil(lines.length / 2) * 18 + 8;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentWidth, 34, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(22, 101, 52);
    doc.text("Payment summary", margin + 6, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Rate: ${rateLabel}`, margin + 6, y + 16);
    doc.text(`${stayType === "short" ? "Nights" : "Months"}: ${nightsCount}`, margin + 6, y + 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total paid: ${formatLkr(bookingData?.totalPrice)}`, pageWidth - margin - 6, y + 22, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for choosing GreenRent. Keep this receipt for your records.", pageWidth / 2, pageHeight - 18, { align: "center" });

    doc.save(`GreenRent-Receipt-${bookingRef}.pdf`);
  };

  useEffect(() => {
    if (!bookingData || !property) {
      return;
    }

    // Stop timer once the booking has been finalized.
    if (paymentSuccess || bookingCancelled || timerExpired) {
      clearBookingTimer(bookingData._id);
      return;
    }

    const tick = () => {
      if (!bookingData?._id) return;
      if (processing || cancellingBooking || paymentSuccess || bookingCancelled) {
        return;
      }
      const timerMs = getRemainingBookingMs(bookingData._id);
      const dueAtMs = bookingData?.paymentDueAt ? new Date(bookingData.paymentDueAt).getTime() - Date.now() : 0;
      const remainingMs = timerMs > 0 ? timerMs : Math.max(0, dueAtMs);
      if (remainingMs <= 0) {
        setTimerExpired(true);
        setTimeRemaining("00:00");
        clearBookingTimer(bookingData._id);
        // Auto-mark as expired once payment window is over.
        axios
          .put(
            `${API_BASE_URL}/api/bookings/${bookingData._id}/expire`,
            {},
            { withCredentials: true }
          )
          .catch((err) => console.error("Auto-expire failed", err));
        return;
      }
      setTimeRemaining(formatBookingRemaining(remainingMs));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [
    bookingData,
    selectedOption,
    property,
    processing,
    paymentSuccess,
    timerExpired,
    cancellingBooking,
    bookingCancelled,
  ]);

  const handleCancelBooking = () => {
    if (processing || timerExpired || bookingCancelled || cancellingBooking) {
      return;
    }
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancelBooking = async () => {
    if (!bookingData?._id) {
      return;
    }

    setPaymentError("");
    setCancellingBooking(true);

    try {
      await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingData._id}/cancel`,
        { cancellationReason: "Cancelled by user before payment" },
        { withCredentials: true }
      );

      clearBookingTimer(bookingData._id);
      setTimeRemaining("00:00");
      setTimerExpired(true);
      setBookingCancelled(true);
      setCancelledBookingId(bookingData._id);
      setShowCancelConfirmModal(false);
      setShowCancelSuccessModal(true);

      setTimeout(() => {
        navigate('/dashboard', {
          state: {
            bookingCancelled: true,
            bookingId: bookingData._id,
          }
        });
      }, 1800);
    } catch (error) {
      setPaymentError(error?.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBooking(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (!stripe || !elements || !clientSecret) {
      setPaymentError("Stripe is not fully loaded. Please wait or check your connection.");
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === "succeeded") {
        if (!bookingData?._id) {
          throw new Error("Missing booking id for payment update.");
        }

        await axios.put(
          `${API_BASE_URL}/api/bookings/${bookingData._id}/payment`,
          { paymentStatus: "paid" },
          { withCredentials: true }
        );

        clearBookingTimer(bookingData._id);
        setPaymentSuccess(true);
      } else {
        throw new Error("Payment did not succeed. Status: " + paymentIntent.status);
      }
    } catch (error) {
      setPaymentError(error?.response?.data?.message || error.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading payment session...</p>
        </div>
      </div>
    );
  }

  if (!bookingData || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Invalid payment session</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const stayType = bookingData.stayType;
  const nights = calculateNightsCeil(bookingData.checkInDate, bookingData.checkOutDate);
  const monthsFromDates = calculateMonthsFromDates(
    bookingData.checkInDate,
    bookingData.checkOutDate
  );

  const paymentOptions = [
    { id: 'visa', label: 'Visa', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
    { id: 'mastercard', label: 'Mastercard', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
    { id: 'amex', label: 'Amex', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg' },
    { id: 'paypal', label: 'PayPal', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
  ];
  const monthsForLong =
    stayType === "long" && bookingData.months != null && Number(bookingData.months) > 0
      ? Number(bookingData.months)
      : stayType === "long"
        ? monthsFromDates
        : null;
  const dailyRate = getDailyRate(property);
  const monthlyRate = getMonthlyRate(property);
  const actionsLocked = processing || timerExpired || bookingCancelled || cancellingBooking;

  if (paymentSuccess) {
    return (
      <PaymentSuccessView
        property={property}
        bookingData={bookingData}
        downloadReceipt={downloadReceipt}
        formatLkr={formatLkr}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {!timerExpired && (
          <Link to={`/booking/${propertyId}`} className="inline-flex items-center text-blue-600 hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to booking
          </Link>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-800">Payment Time Remaining</div>
              <div className="text-xs text-amber-700">Keep this page open so timer continues running</div>
            </div>
            <div className="text-2xl font-bold text-amber-800">{timeRemaining}</div>
          </div>
        </div>

        {timerExpired ? (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6">
            <div className="mb-4">
              <p className="text-red-900 font-bold text-lg mb-1">⏱️ Time has expired</p>
              <p className="text-red-700">Your booking payment window expired. Please start a new booking to continue.</p>
            </div>
            <Link 
              to={`/properties/${propertyId}`} 
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              <RotateCcw className="w-5 h-5" />
              Start Again
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PaymentFormCard
            handlePayment={handlePayment}
            paymentOptions={paymentOptions}
            actionsLocked={actionsLocked}
            cardBrand={cardBrand}
            setCardBrand={setCardBrand}
            cardType={cardType}
            setCardType={setCardType}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            expiryDate={expiryDate}
            setExpiryDate={setExpiryDate}
            cvv={cvv}
            setCvv={setCvv}
            processing={processing}
            cancellingBooking={cancellingBooking}
            bookingData={bookingData}
            paymentError={paymentError}
            onBackEdit={() => navigate(`/booking/${propertyId}`, {
              state: {
                checkInDate: bookingData.checkInDate,
                checkOutDate: bookingData.checkOutDate,
                stayType: bookingData.stayType,
                selectedMonths: bookingData.months,
                numberOfGuests: bookingData.numberOfGuests,
                editMode: true,
                bookingData,
                userDetails,
              },
            })}
            onCancelBooking={handleCancelBooking}
          />

<<<<<<< HEAD
          <PaymentSummaryCard
            property={property}
            selectedOption={selectedOption}
            stayType={stayType}
            bookingData={bookingData}
            dailyRate={dailyRate}
            monthlyRate={monthlyRate}
            nights={nights}
            monthsForLong={monthsForLong}
          />
=======
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Pay with</h3>
                <div className="flex items-center flex-wrap gap-2 mb-4">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={actionsLocked}
                      onClick={() => setCardBrand(option.id)}
                      className={`h-10 px-3 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        cardBrand === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <img src={option.icon} alt={option.label} className="h-5" />
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <select
                    value={cardType}
                    disabled={actionsLocked}
                    onChange={(e) => setCardType(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-4 py-3 pr-10 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="credit">Credit card</option>
                    <option value="debit">Debit card</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    disabled={actionsLocked}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    disabled={actionsLocked}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Card information</label>
                <div className="w-full px-3 py-3 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#1e293b',
                          '::placeholder': { color: '#94a3b8' },
                          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        },
                        invalid: { color: '#ef4444' }
                      },
                      disabled: actionsLocked
                    }}
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={actionsLocked}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing || cancellingBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {cancellingBooking ? "Cancelling Booking..." : "Processing Payment..."}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Pay Now - Rs {bookingData?.totalPrice?.toLocaleString('en-LK')}
                  </>
                )}
              </button>

              {paymentError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {paymentError}
                </p>
              )}
            </form>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/booking/${propertyId}`, {
                    state: {
                      checkInDate: bookingData.checkInDate,
                      checkOutDate: bookingData.checkOutDate,
                      stayType: bookingData.stayType,
                      selectedMonths: bookingData.months,
                      numberOfGuests: bookingData.numberOfGuests,
                      editMode: true,
                      bookingData: bookingData,
                      userDetails: userDetails
                    }
                  })}
                  disabled={actionsLocked}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back / Edit Details
                  </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={actionsLocked}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Payment summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Property</span>
                  <span className="font-medium text-right max-w-[60%]">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Option</span>
                  <span className="font-medium">{selectedOption?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Stay type</span>
                  <span className="font-medium">
                    {stayType === "long" ? "Long stay (monthly)" : "Short stay (nightly)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Guests</span>
                  <span className="font-medium">{bookingData?.numberOfGuests} guest{bookingData?.numberOfGuests !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Check-in</span>
                  <span className="font-medium">{bookingData?.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Check-out</span>
                  <span className="font-medium">{bookingData?.checkOutDate}</span>
                </div>
                <hr className="my-3" />
                {stayType === "short" ? (
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Rate</span>
                      <span>{formatLkr(dailyRate)} / night</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Nights</span>
                      <span>{nights}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs pt-1">
                      <span>Calculation</span>
                      <span>
                        {formatLkr(dailyRate)} × {nights}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-slate-900 pt-1 border-t border-slate-200">
                      <span>Rent total</span>
                      <span>{formatLkr(bookingData.totalPrice)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Rate</span>
                      <span>{formatLkr(monthlyRate)} / month</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Months</span>
                      <span>{monthsForLong}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs pt-1">
                      <span>Calculation</span>
                      <span>
                        {formatLkr(monthlyRate)} × {monthsForLong}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-slate-900 pt-1 border-t border-slate-200">
                      <span>Rent total</span>
                      <span>{formatLkr(bookingData.totalPrice)}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total due</span>
                  <span className="text-blue-600">{formatLkr(bookingData?.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-emerald-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-800 mb-1">Secure Payment</h4>
                  <p className="text-sm text-emerald-700">
                    Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
>>>>>>> feature/user-management
        </div>
      </main>

      <BookingCancelModals
        showCancelConfirmModal={showCancelConfirmModal}
        showCancelSuccessModal={showCancelSuccessModal}
        cancellingBooking={cancellingBooking}
        bookingData={bookingData}
        cancelledBookingId={cancelledBookingId}
        onCloseConfirm={() => setShowCancelConfirmModal(false)}
        onConfirmCancel={handleConfirmCancelBooking}
      />

      <Footer />
    </div>
  );
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const PaymentPageWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPage />
    </Elements>
  );
};

export default PaymentPageWrapper;