import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Leaf,
  Star,
  CheckCircle2,
  XCircle,
  Wind,
  Zap,
  Droplets,
  Bus,
  Trash2,
  CalendarDays,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [ecoRating, setEcoRating] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch property
        const propRes = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
        setProperty(propRes.data);

        // Fetch eco ratings
        const ecoRes = await axios.get(`${API_BASE_URL}/api/eco-ratings?listingId=${id}`);
        if (ecoRes.data && ecoRes.data.length > 0) {
          setEcoRating(ecoRes.data[0]);
        }

        // Fetch user reviews
        try {
          const revRes = await axios.get(`${API_BASE_URL}/api/renter-reviews/listing/${id}`);
          setReviewsData({
            reviews: revRes.data.reviews || [],
            summary: revRes.data.summary || null
          });
        } catch (revErr) {
          console.error("Reviews not found or error:", revErr);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
        <p className="text-slate-600 mb-6">{error || "Property not found."}</p>
        <Link to="/properties" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          Back to Listings
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
      ? property.images 
      : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"];

  const primaryImage = images[currentImageIndex];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="w-full mx-auto px-4 md:px-8 xl:px-12 py-8">
        <Link to="/properties" className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to apartments
        </Link>
        
        {/* Hero Image Section */}
        <div 
          className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img src={primaryImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
          
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-md text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-md text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider z-10 pointer-events-none">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="text-white">
              <span className="inline-block px-3 py-1 bg-emerald-500/90 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                {property.propertyType || "Apartment"}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white shadow-sm">{property.title}</h1>
              <div className="flex items-center text-slate-200">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span className="text-sm md:text-base">{property.location?.address || "Address not provided"}</span>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg text-slate-900 text-center min-w-[120px]">
              <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Rent</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-600">Rs {Number(property.price).toLocaleString('en-LK')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg"><Bed className="w-5 h-5"/></div>
                <div><p className="text-xs text-slate-500 font-medium">Bedrooms</p><p className="font-semibold text-slate-900">{property.bedrooms ?? property.beds ?? 1}</p></div>
              </div>
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><Bath className="w-5 h-5"/></div>
                <div><p className="text-xs text-slate-500 font-medium">Bathrooms</p><p className="font-semibold text-slate-900">{property.bathrooms ?? property.baths ?? 1}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><Maximize className="w-5 h-5"/></div>
                <div><p className="text-xs text-slate-500 font-medium">Area</p><p className="font-semibold text-slate-900">{property.area ?? "N/A"} sqft</p></div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this Property</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Eco Features directly on property model */}
            {property.ecoFeatures && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center"><Leaf className="w-5 h-5 mr-2 text-emerald-500" /> Declared Eco Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                  {Object.entries(property.ecoFeatures).map(([key, value]) => {
                    if (value === true || value === "Yes" || value === "true") {
                      return (
                        <div key={key} className="flex items-center text-sm font-medium text-slate-700">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Official Eco Rating */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Leaf className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center flex-wrap gap-2 mb-2 justify-between">
                  <h3 className="font-bold text-xl">Landlord Eco Rating</h3>
                  {ecoRating && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30">
                      Verified
                    </span>
                  )}
                </div>
                
                {ecoRating ? (
                  <>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-5xl font-black">{ecoRating.totalScore}</span>
                      <span className="text-emerald-100 font-medium mb-1.5">/ 100</span>
                    </div>                      {typeof ecoRating.airQualityScore === 'number' && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-50 bg-emerald-800/40 p-2 rounded-lg backdrop-blur-sm w-fit border border-emerald-500/30">
                           <span className="font-semibold">Air Quality (AQI):</span>
                           <span className="bg-emerald-500 px-2 py-0.5 rounded text-white font-bold">{ecoRating.airQualityScore} / 10</span>
                           {ecoRating.externalSignals?.airQuality?.source && (
                              <span className="text-[10px] opacity-70 ml-1">via {ecoRating.externalSignals.airQuality.source}</span>
                           )}
                        </div>
                      )}                    <div className="my-6 grid grid-cols-2 gap-4">
                      {ecoRating.criteria && Object.entries(ecoRating.criteria).slice(0, 4).map(([k, v]) => (
                        <div key={k} className="bg-white/10 rounded-lg p-2.5 backdrop-blur-sm">
                          <p className="text-[10px] text-emerald-100 uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="font-semibold text-sm truncate">
                            {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-emerald-100">
                    <p>No official Eco Rating provided by the landlord yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Renter Summary */}
             <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" />
                  Renter Feedback
                </h3>
                
                {reviewsData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-slate-800">
                          {reviewsData.summary ? Number(reviewsData.summary.averageScore).toFixed(1) : "-"}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Avg Score</p>
                      </div>
                      <div className="h-10 w-px bg-slate-200"></div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-800">{reviewsData.reviews.length}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Reviews</p>
                      </div>
                      <div className="h-10 w-px bg-slate-200"></div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-emerald-600">
                          {reviewsData.summary ? Math.round(reviewsData.summary.recommendationRate) : 0}%
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Recommend</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic pb-2">No renter reviews yet. Be the first to verify this property!</p>
                )}

                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Review Apartment
                </button>
             </div>

          </div>
        </div>

        {/* Reviews List Section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 lg:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Renter Reviews & Confirmations</h2>
              <p className="text-slate-500 text-sm mt-1">Actual feedback from previous and current tenants</p>
            </div>
          </div>

          {reviewsData.reviews.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-xl">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Star className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">This property hasn't received any renter reviews or eco-rating confirmations yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">      
              {reviewsData.reviews.map((review) => (
                <div key={review._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white transition-colors duration-200 shadow-sm hover:shadow-md h-full flex flex-col">
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

                  <p className="text-sm text-slate-600 italic mb-4 flex-grow">"{review.review}"</p>

                  {review.verification && Object.keys(review.verification).length > 0 && (
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 mb-2.5 uppercase tracking-wider">Tenant Verified Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(review.verification).slice(0, 4).map(([key, val]) => {
                          if (val === null) return null;
                          return (
                            <span key={key} className={`inline-flex items-center px-2 py-1 rounded text-[10px] sm:text-xs font-medium border ${val ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                              {val ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          );
                        })}
                        {Object.keys(review.verification).length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            +{Object.keys(review.verification).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-slate-900/95 backdrop-blur-sm animate-in fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition z-50"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-6xl max-h-full flex items-center justify-center pointer-events-none">
            <img 
              src={images[currentImageIndex]} 
              alt={property.title} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()} 
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(e); }}
                  className="absolute left-0 md:-left-12 lg:-left-16 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition pointer-events-auto"
                >
                  <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextImage(e); }}
                  className="absolute right-0 md:-right-12 lg:-right-16 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition pointer-events-auto"
                >
                  <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider pointer-events-none">
                {currentImageIndex + 1} / {images.length}
             </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal 
          propertyId={id} 
          ecoRatingId={ecoRating?._id}
          onClose={() => setShowReviewModal(false)} 
          onSuccess={() => {
            setShowReviewModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

const ReviewModal = ({ propertyId, ecoRatingId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [criteria, setCriteria] = useState({
    energyEfficiency: 5,
    waterEfficiency: 5,
    wasteManagement: 5,
    transitAccess: 5,
    greenAmenities: 5
  });
  
  const [verification, setVerification] = useState({
    solarPanels: null,
    ledLighting: null,
    efficientAc: null,
    waterSavingTaps: null,
    recyclingAvailable: null,
    goodVentilationSunlight: null
  });

  const [reviewText, setReviewText] = useState("");
  const [livingDuration, setLivingDuration] = useState("< 3 months");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ecoRatingId) {
      setError("Cannot review property without an existing landlord eco-rating.");
      return;
    }

    // Convert nulls to undefined so they are stripped or handled properly if skipped
    const cleanedVerification = {};
    for (const key in verification) {
      if (verification[key] !== null) cleanedVerification[key] = verification[key];
    }

    const payload = {
      listingId: propertyId,
      ecoRatingId: ecoRatingId,
      criteria,
      verification: cleanedVerification,
      review: reviewText,
      livingDuration,
      wouldRecommend
    };

    try {
      setLoading(true);
      setError("");
      
      // Axios request - we assume token is passed via cookies
      await axios.post(`${API_BASE_URL}/api/renter-reviews`, payload, {
        withCredentials: true
      });
      
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationClick = (key, val) => {
    setVerification(prev => ({
      ...prev,
      [key]: prev[key] === val ? null : val // toggle off if already selected
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
                min="0" max="10" step="1"
                value={value}
                onChange={(e) => setCriteria({...criteria, [key]: Number(e.target.value)})}
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
      <div className="flex gap-3">
        <button 
          type="button"
          onClick={() => setStep(1)}
          className="w-1/3 bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 transition"
        >
          Back
        </button>
        <button 
          type="button"
          onClick={() => setStep(3)}
          className="w-2/3 bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition"
        >
          Next Step
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Final Thoughts</h3>
        <p className="text-sm text-slate-500 mb-4">Share your overall experience to help future renters.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Living Duration</label>
            <select 
              value={livingDuration}
              onChange={(e) => setLivingDuration(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="< 3 months">Less than 3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value="6-12 months">6-12 months</option>
              <option value="1-2 years">1-2 years</option>
              <option value="> 2 years">More than 2 years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Written Review</label>
            <textarea 
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others what it was like living here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            ></textarea>
          </div>

          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
            <input 
              type="checkbox" 
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">I would recommend this apartment to others</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button 
          type="button"
          onClick={() => setStep(2)}
          className="w-1/3 bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 transition"
        >
          Back
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-2/3 bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-70 flex justify-center items-center"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Submit Review'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <XCircle className="w-5 h-5" />
        </button>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Add Review</h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-emerald-500 w-6' : 'bg-slate-200 w-3'}`} />
              ))}
            </div>
          </div>
          
          <form>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;