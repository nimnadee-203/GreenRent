import React from "react";
import { CheckCircle2, MapPin, MessageCircle, Heart, Share2 } from "lucide-react";

export default function BookingSidebar({ viewModel }) {
  const {
    summaryPrefersShortStay,
    summaryRate,
    summaryGuestCount,
    setSummaryGuests,
    includedGuests,
    summaryExtraGuestFee,
    summaryExtraGuests,
    summaryAdditionalFee,
    formatCurrency,
    handleCheckAvailabilityClick,
    scrollToSection,
    mapSectionRef,
    reviewsSectionRef,
    handleWishlistToggle,
    wishlistLoading,
    isWishlisted,
    handleShareListing,
    shareFeedback,
  } = viewModel;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 md:p-5">
          <h3 className="text-xl font-bold text-slate-900">Your price summary</h3>
          <div className="mt-5 flex items-center justify-between gap-4 text-sm text-slate-700">
            <span>{summaryPrefersShortStay ? "Rate per night" : "Rate per month"}</span>
            <span className="text-base font-semibold text-slate-900">{formatCurrency(summaryRate)}</span>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">
              {summaryPrefersShortStay ? "Number of guests (short stay)" : "Occupancy"}
            </p>
            <div className="mt-3 flex items-start gap-3">
              {summaryPrefersShortStay ? (
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={summaryGuestCount}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (!Number.isFinite(nextValue)) {
                      setSummaryGuests(1);
                      return;
                    }
                    setSummaryGuests(Math.max(1, Math.min(15, nextValue)));
                  }}
                  className="w-20 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-center text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  aria-label="Number of guests for price summary"
                />
              ) : (
                <div className="min-w-[56px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-center text-base font-semibold text-slate-900">
                  {summaryGuestCount}
                </div>
              )}
              <p className="text-sm leading-5 text-slate-500">
                {summaryPrefersShortStay
                  ? `First ${includedGuests} guest${includedGuests > 1 ? "s" : ""} included; each extra guest + Rs ${summaryExtraGuestFee.toLocaleString("en-LK")}/night.`
                  : "Monthly rentals are priced per month for the full property."}
              </p>
            </div>
            {summaryPrefersShortStay && (
              <p className="mt-3 text-sm text-slate-600">
                Extra guests: {summaryExtraGuests} (additional fee: {formatCurrency(summaryAdditionalFee)})
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-emerald-100 bg-emerald-50/60 px-4 py-4 md:px-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {summaryPrefersShortStay ? "Price" : "Monthly Price"}
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {formatCurrency(summaryRate + summaryAdditionalFee)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Includes taxes and charges</p>
              <p className="mt-1 text-base font-semibold text-slate-700">
                In property currency: LKR {Number(summaryRate + summaryAdditionalFee).toLocaleString("en-LK")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <button
          onClick={handleCheckAvailabilityClick}
          className="rounded-xl px-4 py-3 border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 min-w-[170px]"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Check Availability
        </button>
        <button
          onClick={() => scrollToSection(mapSectionRef)}
          className="rounded-xl px-4 py-3 border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 min-w-[170px]"
        >
          <MapPin className="w-5 h-5 text-emerald-600" />
          View on Map
        </button>
        <button
          onClick={() => scrollToSection(reviewsSectionRef)}
          className="rounded-xl px-4 py-3 border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 min-w-[170px]"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          View Reviews
        </button>
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={`rounded-xl px-4 py-3 border font-semibold transition-all flex items-center justify-center gap-2 min-w-[170px] ${
            isWishlisted
              ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
          } ${wishlistLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
          {wishlistLoading ? "Saving..." : isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </button>
        <button
          onClick={handleShareListing}
          className="rounded-xl px-4 py-3 border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 min-w-[140px]"
        >
          <Share2 className="w-5 h-5 text-slate-700" />
          Share
        </button>
      </div>
      {shareFeedback && (
        <p className="mt-3 text-xs text-center font-medium text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
          {shareFeedback}
        </p>
      )}
    </div>
  );
}
