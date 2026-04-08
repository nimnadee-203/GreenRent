import React from "react";
import { Link } from "react-router-dom";

export default function BookingDetailsForm({
  onSubmit,
  stayType,
  setStayType,
  months,
  setMonths,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  notes,
  setNotes,
  dailyPrice,
  monthlyPrice,
  nights,
  shortStayTotal,
  longStayTotal,
  formatLkr,
  error,
  successMessage,
  submitting,
  bookingId,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <h2 className="text-2xl font-bold">Booking Details</h2>
      <p className="text-sm text-slate-500">Please enter your contact info and travel dates.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Stay Type</span>
          <select
            value={stayType}
            onChange={(event) => setStayType(event.target.value)}
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
              onChange={(event) => setMonths(Number(event.target.value) || 1)}
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
            onChange={(event) => setFullName(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Check-in</span>
          <input
            type="date"
            value={checkInDate}
            onChange={(event) => setCheckInDate(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Check-out</span>
          <input
            type="date"
            value={checkOutDate}
            onChange={(event) => setCheckOutDate(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Additional notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
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

        <Link to={`/booking/${bookingId}`} className="text-sm text-slate-500 hover:text-slate-700">Back to options</Link>
      </div>
    </form>
  );
}
