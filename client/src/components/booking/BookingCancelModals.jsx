import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function BookingCancelModals({
  showCancelConfirmModal,
  showCancelSuccessModal,
  cancellingBooking,
  bookingData,
  cancelledBookingId,
  onCloseConfirm,
  onConfirmCancel,
}) {
  return (
    <>
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Cancel This Booking?</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-slate-700">
                If you continue, your reservation will be cancelled and this payment session will be closed.
              </p>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
                Booking ID: <span className="font-semibold">{bookingData?._id}</span>
              </div>
            </div>

            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onCloseConfirm}
                disabled={cancellingBooking}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={onConfirmCancel}
                disabled={cancellingBooking}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingBooking ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Cancelled</h3>
            <p className="text-sm text-slate-600 mb-4">Your booking was cancelled successfully.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700 mb-4">
              Booking ID: <span className="font-semibold">{cancelledBookingId}</span>
            </div>
            <p className="text-xs text-slate-500">Redirecting to My Bookings...</p>
          </div>
        </div>
      )}
    </>
  );
}
