import React from "react";
import { MapPin, CheckCircle2, Heart, Share2, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertyDetailsHeader({ vm }) {
  const {
    property,
    images,
    primaryImage,
    currentImageIndex,
    autoplayEnabled,
    setAutoplayEnabled,
    setIsLightboxOpen,
    handlePrevImage,
    handleNextImage,
    propertyStayType,
    toLocationLabel,
    handleCheckAvailabilityClick,
    scrollToSection,
    mapSectionRef,
    reviewsSectionRef,
    handleWishlistToggle,
    wishlistLoading,
    isWishlisted,
    handleShareListing,
    shareFeedback,
    hasMonthlyPrice,
    hasDailyPrice,
  } = vm;

  return (
    <>
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <div
          className="xl:col-span-9 w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer"
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

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setAutoplayEnabled((prev) => !prev);
                }}
                className="absolute top-4 left-4 bg-black/50 hover:bg-black/65 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider z-10"
                aria-pressed={autoplayEnabled}
                aria-label={autoplayEnabled ? "Turn autoplay off" : "Turn autoplay on"}
              >
                Auto-play: {autoplayEnabled ? "On" : "Off"}
              </button>
            </>
          )}

          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-white max-w-3xl">
              <span className="inline-block px-3 py-1 bg-emerald-500/90 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                {property.propertyType || "Apartment"}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white shadow-sm">{property.title}</h1>
              <div className="flex items-center text-slate-200">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span className="text-sm md:text-base">{toLocationLabel(property.location)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm flex flex-col gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-slate-900 text-center">
              {propertyStayType === "both" ? (
                <>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Long Stay (Monthly)</p>
                  <p className="text-xl md:text-2xl font-bold text-emerald-600 mb-2">
                    Rs {Number(hasMonthlyPrice ? property.monthlyPrice : property.price).toLocaleString("en-LK")}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Short Stay (Daily)</p>
                  <p className="text-lg md:text-xl font-bold text-emerald-700">
                    Rs {Number(hasDailyPrice ? property.dailyPrice : property.price).toLocaleString("en-LK")}
                  </p>
                </>
              ) : propertyStayType === "short" ? (
                <>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Daily Rent</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                    Rs {Number(hasDailyPrice ? property.dailyPrice : property.price).toLocaleString("en-LK")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Rent</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                    Rs {Number(hasMonthlyPrice ? property.monthlyPrice : property.price).toLocaleString("en-LK")}
                  </p>
                </>
              )}
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
          </aside>
        </div>
      </section>
    </>
  );
}
