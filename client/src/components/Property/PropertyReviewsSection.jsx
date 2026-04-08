import React from "react";
import { CalendarDays, CheckCircle2, MessageCircle, SendHorizontal, ShieldCheck, Star, XCircle } from "lucide-react";

export default function PropertyReviewsSection({ vm }) {
  const {
    reviewsSectionRef,
    displayReviews,
    averageScoreOutOfFive,
    reviewsData,
    ratingBuckets,
    canReviewApartment,
    setShowReviewModal,
    backendUser,
    reviewActionLoadingById,
    moderateReview,
    replyDrafts,
    setReplyDrafts,
    submitReply,
    replySubmittingByReview,
    replyError,
  } = vm;

  return (
    <div ref={reviewsSectionRef} className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 lg:p-10 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Renter Reviews & Confirmations</h2>
          <p className="text-slate-500 text-sm mt-1">Actual feedback from previous and current tenants</p>
        </div>
      </div>

      {displayReviews.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-xl">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <Star className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">This property hasn't received any renter reviews or eco-rating confirmations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {displayReviews.map((review) => (
            <div key={review._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white transition-colors duration-200 shadow-sm hover:shadow-md h-full flex flex-col">
              {backendUser?.role === "admin" && (
                <div className="mb-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => moderateReview(review._id, review.status === "approved" ? "hide" : "unhide")}
                    disabled={Boolean(reviewActionLoadingById[review._id])}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {review.status === "approved" ? "Hide" : "Unhide"}
                  </button>
                  <button
                    type="button"
                    onClick={() => moderateReview(review._id, "delete")}
                    disabled={Boolean(reviewActionLoadingById[review._id])}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {review.renterName?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{review.renterName || "Anonymous"}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <CalendarDays className="w-3 h-3 mr-1" /> {review.livingDuration}
                    </p>
                  </div>
                </div>
                <div className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-800 text-xs">{review.totalScore}/10</span>
                </div>
              </div>

              <p className="text-sm text-slate-600 italic mb-4 flex-grow">"{review.review || 'No written comment provided.'}"</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(review.criteria || {}).map(([key, value]) => (
                  <div key={key} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs font-semibold text-slate-800">{value}/10</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                <span className={`font-semibold ${review.wouldRecommend ? 'text-emerald-700' : 'text-red-700'}`}>
                  {review.wouldRecommend ? 'Recommended by renter' : 'Not recommended by renter'}
                </span>
                <span className="capitalize">{review.status === 'rejected' ? 'hidden' : (review.status || 'approved')}</span>
              </div>

              {review.verification && Object.keys(review.verification).length > 0 && (
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 mb-2.5 uppercase tracking-wider">Tenant Verified Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(review.verification).map(([key, val]) => {
                      if (val === null) return null;
                      return (
                        <span key={key} className={`inline-flex items-center px-2 py-1 rounded text-[10px] sm:text-xs font-medium border ${val ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                          {val ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> Replies
                </p>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(review.replies || []).length === 0 ? (
                    <p className="text-xs text-slate-500">No replies yet.</p>
                  ) : (
                    (review.replies || []).map((reply) => (
                      <div key={reply._id} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                        <p className="text-[11px] font-semibold text-slate-800">{reply.userName || "Anonymous"}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{reply.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyDrafts[review._id] || ""}
                    onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [review._id]: event.target.value }))}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs"
                    maxLength={500}
                  />
                  <button
                    type="button"
                    onClick={() => submitReply(review._id)}
                    disabled={Boolean(replySubmittingByReview[review._id]) || !(replyDrafts[review._id] || '').trim()}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    <SendHorizontal className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {replyError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {replyError}
        </div>
      )}

      {canReviewApartment && (
        <button 
          onClick={() => setShowReviewModal(true)}
          className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Review Apartment
        </button>
      )}
    </div>
  );
}
