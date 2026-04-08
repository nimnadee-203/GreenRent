import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Download } from "lucide-react";

export default function PaymentSuccessView({
  property,
  bookingData,
  downloadReceipt,
  formatLkr,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_15%_85%,rgba(187,247,208,0.7),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(209,213,255,0.75),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(254,249,195,0.65),transparent_48%),linear-gradient(135deg,#f7fafc,#eef2ff_45%,#f8fafc)]">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-sky-500" />
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="relative px-6 py-8 sm:px-10 sm:py-10 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm mb-6">
            <CheckCircle className="w-4 h-4" />
            Payment completed
          </div>

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_18px_40px_rgba(16,185,129,0.35)]">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">
            Booking confirmed.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
            Your payment for <span className="font-semibold text-slate-900">{property.title}</span> was successful and your booking is now secured on GreenRent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Booking Ref</div>
              <div className="text-sm font-semibold text-slate-900 break-all">#{bookingData?._id}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Status</div>
              <div className="text-sm font-semibold text-slate-900">Paid / Confirmed</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Total Paid</div>
              <div className="text-sm font-semibold text-slate-900">{formatLkr(bookingData?.totalPrice)}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900 mb-7">
            Download your receipt now, or return home to browse more GreenRent listings.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={downloadReceipt}
              className="w-full sm:w-auto min-w-[210px] inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Download className="w-4 h-4" />
              Download Receipt / Invoice
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto min-w-[210px] inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Return to Home
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-6">Thank you for choosing GreenRent for your stay.</p>
        </div>
      </div>
    </div>
  );
}
