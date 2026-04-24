import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// review popup
const ReviewModal = ({ propertyId, ecoRatingId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // currunt step 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [criteria, setCriteria] = useState({
    energyEfficiency: 5,
    waterEfficiency: 5,
    wasteManagement: 5,
    transitAccess: 5,
    greenAmenities: 5,
  });

  const [verification, setVerification] = useState({
    solarPanels: null,
    ledLighting: null,
    efficientAc: null,
    waterSavingTaps: null,
    recyclingAvailable: null,
    goodVentilationSunlight: null,
  });

  const [reviewText, setReviewText] = useState("");
  const [livingDuration, setLivingDuration] = useState("< 3 months");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  // Handle form submissionto submit the review
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ecoRatingId) {
      setError("Cannot review property without an existing landlord eco-rating.");
      return;
    }

    const cleanedVerification = {};
    for (const key in verification) {
      if (verification[key] !== null) cleanedVerification[key] = verification[key];
    }
    // buid data object to send to backend
    const payload = {
      listingId: propertyId,
      ecoRatingId,
      criteria,
      verification: cleanedVerification,
      review: reviewText,
      livingDuration,
      wouldRecommend,
    };

    try {
      setLoading(true);
      setError("");
      await axios.post(`${API_BASE_URL}/api/renter-reviews`, payload, { withCredentials: true });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  // This updates one verification field when user clicks it.
  const handleVerificationClick = (key, value) => {
    setVerification((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in zoom-in duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Rate Eco Criteria</h3>
        <p className="text-sm text-slate-500 mb-4">Score the apartment from 0-10 on these sustainability aspects based on your living experience.</p>

        <div className="space-y-5">
          {Object.entries(criteria).map(([key, value]) => (
            <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold capitalize text-slate-700">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <span className="font-bold text-emerald-600">{value} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={value}
                onChange={(event) => setCriteria({ ...criteria, [key]: Number(event.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setStep(2)}
        className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition"
      >
        Next Step
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Verify Landlord Claims</h3>
        <p className="text-sm text-slate-500 mb-4">Did the apartment actually have these features? Click True, False, or leave blank if unsure.</p>

        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 rounded-xl">
          {Object.entries(verification).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
              <span className="text-sm font-medium capitalize text-slate-700">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleVerificationClick(key, true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${value === true ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleVerificationClick(key, false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${value === false ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setStep(1)}
        className="w-full bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 transition"
      >
        Back
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[220] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Review Apartment</h2>
            <p className="text-sm text-slate-500">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {step === 1 ? renderStep1() : renderStep2()}
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
