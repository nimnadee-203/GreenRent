import React from "react";
import { Shield } from "lucide-react";
import { formatLkr } from "../../utils/bookingPricing";

export default function PaymentSummaryCard({
  property,
  selectedOption,
  stayType,
  bookingData,
  dailyRate,
  monthlyRate,
  nights,
  monthsForLong,
}) {
  return (
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
            <span className="font-medium">{bookingData?.numberOfGuests} guest{bookingData?.numberOfGuests !== 1 ? "s" : ""}</span>
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
                  {formatLkr(dailyRate)} x {nights}
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
                  {formatLkr(monthlyRate)} x {monthsForLong}
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
  );
}
