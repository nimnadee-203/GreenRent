import React from "react";
import { CheckCircle2 } from "lucide-react";
import { formatLkr } from "../../utils/bookingPricing";

export default function BookingOptionCard({
  option,
  selectedOption,
  onReserve,
  propertyStayType,
  longRentFromDates,
  shortStayWithGuestTotal,
}) {
  return (
    <div
      className={`bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition ${
        selectedOption?.id === option.id ? "border-[#0071c2] ring-1 ring-[#0071c2]" : "border-slate-300"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
        <div className="md:col-span-2">
          <div className="space-y-1.5 text-[13px]">
            <p className="text-[#008234] font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {option.cancellation}</p>
            <br />
            <p className="text-[#008234] font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {option.prepayment}</p>
          </div>
        </div>

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
                  {propertyStayType === "long"
                    ? `Total (long): ${longRentFromDates != null ? formatLkr(longRentFromDates) : option.pricePerMonth}`
                    : `Total (short): ${formatLkr(shortStayWithGuestTotal)}`}
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

        <div className="md:col-span-2 flex flex-col items-end justify-start border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <button
            onClick={onReserve}
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
  );
}
