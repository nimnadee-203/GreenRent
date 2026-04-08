import React from "react";
import { X } from "lucide-react";

export default function BookingFlowModals({ viewModel }) {
  const {
    showStayTypeModal,
    setShowStayTypeModal,
    showDatePickerModal,
    closeDatePickerModal,
    stayType,
    monthNames,
    today,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    isAtLeastThreeMonths,
    fromMonth,
    setFromMonth,
    fromYear,
    setFromYear,
    toMonth,
    setToMonth,
    toYear,
    setToYear,
    currentYear,
    currentMonthIndex,
    yearOptions,
    handleContinueToAvailability,
    isLongStayStartFromCurrentOrFuture,
    isLongStayRangeChronological,
    getLongStayMonthCount,
    availableStayTypes,
    handleSelectStayType,
    showAvailabilityModal,
    availabilityLoading,
    availabilityResult,
    availabilityError,
    handleBookNow,
    setShowAvailabilityModal,
    showAuthChoiceModal,
    setShowAuthChoiceModal,
    handleChooseAuthAction,
  } = viewModel;

  return (
    <>
      {showStayTypeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Select Your Stay Type</h2>
              <button
                onClick={() => setShowStayTypeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-slate-600 text-sm mb-6">How long are you planning to stay?</p>

              {availableStayTypes.includes("short") && (
                <button
                  onClick={() => handleSelectStayType("short")}
                  className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                >
                  <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">Short Stay</p>
                  <p className="text-sm text-slate-600 mt-2">Less than 3 months</p>
                </button>
              )}

              {availableStayTypes.includes("long") && (
                <button
                  onClick={() => handleSelectStayType("long")}
                  className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                >
                  <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">Long Stay</p>
                  <p className="text-sm text-slate-600 mt-2">3 months or more</p>
                </button>
              )}

              <button
                onClick={() => setShowStayTypeModal(false)}
                className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition mt-6"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDatePickerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {stayType === "short" ? "Select Dates" : "Select Months"}
              </h2>
              <button
                onClick={closeDatePickerModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              {stayType === "short" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Check-in Date</label>
                    <input
                      type="date"
                      min={today}
                      value={checkInDate}
                      onChange={(event) => setCheckInDate(event.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      min={checkInDate || today}
                      value={checkOutDate}
                      onChange={(event) => setCheckOutDate(event.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate) && (
                    <p className="text-sm text-red-600">Check-out date must be after check-in date.</p>
                  )}
                  {checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate) && isAtLeastThreeMonths(checkInDate, checkOutDate) && (
                    <p className="text-sm text-red-600">Short stay cannot be 3 months or more. Please choose Long Stay.</p>
                  )}
                </>
              )}

              {stayType === "long" && (
                <>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">From Month</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Month</label>
                        <select
                          value={fromMonth}
                          onChange={(event) => setFromMonth(event.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {monthNames.map((month, monthIndex) => (
                            <option key={month} value={month} disabled={fromYear === String(currentYear) && monthIndex < currentMonthIndex}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Year</label>
                        <select
                          value={fromYear}
                          onChange={(event) => setFromYear(event.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">To Month</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Month</label>
                        <select
                          value={toMonth}
                          onChange={(event) => setToMonth(event.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {monthNames.map((month, monthIndex) => (
                            <option
                              key={month}
                              value={month}
                              disabled={
                                (toYear === String(currentYear) && monthIndex < currentMonthIndex) ||
                                (fromMonth && fromYear && toYear === fromYear && monthIndex < monthNames.indexOf(fromMonth))
                              }
                            >
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Year</label>
                        <select
                          value={toYear}
                          onChange={(event) => setToYear(event.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {fromMonth && fromYear && !isLongStayStartFromCurrentOrFuture(fromMonth, fromYear) && (
                    <p className="text-sm text-red-600">Start month must be current month or later.</p>
                  )}
                  {fromMonth && fromYear && toMonth && toYear && !isLongStayRangeChronological(fromMonth, fromYear, toMonth, toYear) && (
                    <p className="text-sm text-red-600">End month must be after start month.</p>
                  )}
                  {fromMonth && fromYear && toMonth && toYear && getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear) > 0 && getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear) < 3 && (
                    <p className="text-sm text-red-600">Long stay must be at least 3 months.</p>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDatePickerModal}
                  className="w-1/2 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinueToAvailability}
                  disabled={stayType === "short"
                    ? !checkInDate || !checkOutDate || checkInDate < today || new Date(checkOutDate) <= new Date(checkInDate) || isAtLeastThreeMonths(checkInDate, checkOutDate)
                    : !fromMonth || !fromYear || !toMonth || !toYear || !isLongStayStartFromCurrentOrFuture(fromMonth, fromYear) || !isLongStayRangeChronological(fromMonth, fromYear, toMonth, toYear) || getLongStayMonthCount(fromMonth, fromYear, toMonth, toYear) < 3
                  }
                  className="w-1/2 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAvailabilityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Availability Check</h2>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {availabilityLoading ? (
                <div className="text-center text-slate-600">Checking availability...</div>
              ) : (
                <>
                  {availabilityResult && (
                    <div className={`rounded-xl p-4 ${availabilityResult.available ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className={`text-lg font-bold ${availabilityResult.available ? 'text-emerald-700' : 'text-red-700'}`}>
                        {availabilityResult.available ? 'Available!' : 'Not Available'}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {availabilityResult.stayType === 'short'
                          ? `Duration: ${availabilityResult.checkInDate} → ${availabilityResult.checkOutDate}`
                          : `Duration: ${availabilityResult.months} month${availabilityResult.months > 1 ? 's' : ''} (${availabilityResult.checkInDate} → ${availabilityResult.checkOutDate})`}
                      </p>
                    </div>
                  )}

                  {availabilityError && (
                    <div className="rounded-xl p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                      {availabilityError}
                    </div>
                  )}

                  {!availabilityResult && !availabilityError && (
                    <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 text-sm text-slate-700">
                      Please select stay type and duration to run availability.
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleBookNow}
                  disabled={!availabilityResult?.available || availabilityLoading}
                  className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {availabilityResult?.available ? 'Book Now' : 'Book Now'}
                </button>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuthChoiceModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Continue Booking</h2>
              <button
                onClick={() => setShowAuthChoiceModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                To continue booking this apartment, please login or sign up first.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChooseAuthAction("login")}
                  className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => handleChooseAuthAction("signup")}
                  className="w-full bg-slate-100 text-slate-800 font-semibold py-3 rounded-xl hover:bg-slate-200 transition"
                >
                  Sign up
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAuthChoiceModal(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
