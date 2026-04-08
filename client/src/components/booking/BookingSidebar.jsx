import React from "react";

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

    </div>
  );
}
