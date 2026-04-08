import React from "react";

export default function BookingDetailsHeaderCard({ property, selectedOption, stayType, dailyPrice, monthlyPrice, nights, shortStayTotal, months, longStayTotal, formatLkr }) {
  return (
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
  );
}
