import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { formatLkr } from "../../utils/bookingPricing";

export default function BookingSummarySidebar({
  propertyId,
  property,
  checkInDate,
  checkOutDate,
  propertyStayType,
  monthsFromDates,
  nights,
  includedShortStayGuests,
  shortStayGuests,
  setShortStayGuests,
  shortExtraGuests,
  shortExtraGuestTotal,
  dailyRate,
  monthlyRate,
  longRentFromDates,
  shortStayWithGuestTotal,
  formatDate,
}) {
  return (
    <div className="w-full lg:w-[32%] flex flex-col gap-4 sticky top-6">
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
              ? `${monthsFromDates} month${monthsFromDates !== 1 ? "s" : ""}`
              : `${nights} night${nights !== 1 ? "s" : ""}`}
          </p>
          <p className="text-[14px] text-slate-600 mt-2">1 x {property.title || "Apartment"}</p>
          <Link to={`/properties/${propertyId}`} className="text-[#0071c2] hover:underline text-[14px] font-bold mt-4 inline-block">
            Change your selection
          </Link>
        </div>
      </div>

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
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setShortStayGuests(Math.max(includedShortStayGuests, Math.min(15, Number.isNaN(value) ? includedShortStayGuests : value)));
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
            In property currency: {propertyStayType === "long" ? formatLkr(longRentFromDates).replace("Rs", "LKR") : formatLkr(shortStayWithGuestTotal).replace("Rs", "LKR")}
          </p>
        </div>
      </div>
    </div>
  );
}
