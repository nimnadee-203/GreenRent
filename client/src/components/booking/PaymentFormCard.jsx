import React from "react";
import { ArrowLeft, CreditCard, Shield } from "lucide-react";
import { CardElement } from "@stripe/react-stripe-js";

export default function PaymentFormCard({
  handlePayment,
  paymentOptions,
  actionsLocked,
  cardBrand,
  setCardBrand,
  cardType,
  setCardType,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  processing,
  cancellingBooking,
  bookingData,
  paymentError,
  onBackEdit,
  onCancelBooking,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <CreditCard className="w-6 h-6 text-slate-600 mr-3" />
        <h2 className="text-xl font-bold text-slate-900">Payment Details</h2>
      </div>

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
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-400"
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
              onChange={(event) => setCardType(event.target.value)}
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
              onChange={(event) => setFirstName(event.target.value)}
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
              onChange={(event) => setLastName(event.target.value)}
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
                    fontSize: "16px",
                    color: "#1e293b",
                    "::placeholder": { color: "#94a3b8" },
                    fontFamily:
                      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  },
                  invalid: { color: "#ef4444" },
                },
                disabled: actionsLocked,
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
              Pay Now - Rs {bookingData?.totalPrice?.toLocaleString("en-LK")}
            </>
          )}
        </button>

        {paymentError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {paymentError}
          </p>
        )}
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBackEdit}
            disabled={actionsLocked}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back / Edit Details
          </button>
          <button
            onClick={onCancelBooking}
            disabled={actionsLocked}
            className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
