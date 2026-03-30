import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import {
  getDailyRate,
  getMonthlyRate,
  calculateNightsCeil,
  calculateMonthsFromDates,
  formatLkr,
} from "../../utils/bookingPricing";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PaymentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;
  const selectedOption = location.state?.selectedOption;
  const property = location.state?.property;

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!bookingData || !selectedOption || !property) {
      navigate(`/properties/${id}`);
    }
  }, [bookingData, selectedOption, property, navigate, id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentError("");
    setProcessing(true);

    try {
      // Simulate gateway processing delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (!bookingData?._id) {
        throw new Error("Missing booking id for payment update.");
      }

      await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingData._id}/payment`,
        { paymentStatus: "paid" },
        { withCredentials: true }
      );

      setPaymentSuccess(true);
      setProcessing(false);

      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            paymentSuccess: true,
            bookingData: {
              ...bookingData,
              paymentStatus: "paid",
              status: "confirmed",
            },
            selectedOption,
            property
          }
        });
      }, 1800);
    } catch (error) {
      setProcessing(false);
      setPaymentError(error?.response?.data?.message || error.message || "Payment update failed. Please try again.");
    }
  };

  if (!bookingData || !selectedOption || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Invalid payment session</p>
          <Link to={`/properties/${id}`} className="text-blue-600 hover:underline">
            Return to property
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
  const monthsForLong =
    stayType === "long" && bookingData.months != null && Number(bookingData.months) > 0
      ? Number(bookingData.months)
      : stayType === "long"
        ? monthsFromDates
        : null;
  const dailyRate = getDailyRate(property);
  const monthlyRate = getMonthlyRate(property);

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-2xl mx-auto p-8 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-600 mb-6">
              Your booking for {property.title} has been confirmed.
            </p>
            <p className="text-sm text-slate-500">
              Redirecting to your dashboard...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <Link to={`/booking/${id}`} className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to booking
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <CreditCard className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-bold text-slate-900">Payment Details</h2>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/'))}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    maxLength="4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPage;