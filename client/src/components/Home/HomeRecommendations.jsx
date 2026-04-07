import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  TrendingUp,
  Leaf,
  ShieldCheck,
  Bus,
  Settings
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const formatPrice = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function HomeRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/recommendations`, { withCredentials: true });
        setRecommendations((res.data.recommendations || []).slice(0, 8));
      } catch (err) {
        console.error('Failed to load home recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  // Check scroll position to show/hide arrows
  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Initial check after cards render
    const timer = setTimeout(updateScrollButtons, 100);
    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [recommendations]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} /> Personalized for you
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Top Picks Based on <span className="text-emerald-600">Your Eco Profile</span>
            </h2>
            <p className="mt-2 text-slate-500 max-w-xl">
              Ranked by Smart Eco Score calculated from your budget, green priorities, and transit needs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/preference-setup"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:border-emerald-300 hover:bg-emerald-50 transition-all"
            >
              <Settings size={15} className="text-emerald-500" />
              Edit Preferences
            </Link>
            <Link
              to="/recommendations"
              className="group flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-sm"
            >
              View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Loading Skeleton — horizontal row */}
        {isLoading && (
          <div className="flex gap-5 overflow-hidden pb-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex-none w-[280px] h-[340px] rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty — guide user to set preferences */}
        {!isLoading && recommendations.length === 0 && (
          <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No matches yet</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
              Tell us your budget and eco priorities to see personalized recommendations here.
            </p>
            <Link
              to="/preference-setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
            >
              Set My Preferences <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Horizontal scrollable row with arrow buttons */}
        {!isLoading && recommendations.length > 0 && (
          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Cards Row */}
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`.recommendations-scroll::-webkit-scrollbar { display: none; }`}</style>
              {recommendations.map((property) => (
                <HomeRecommendationCard key={property._id} property={property} />
              ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Right fade gradient to hint there's more */}
            {canScrollRight && (
              <div className="absolute top-0 right-0 bottom-2 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
            )}
            {canScrollLeft && (
              <div className="absolute top-0 left-0 bottom-2 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function HomeRecommendationCard({ property }) {
  const { smartScore, scoringBreakdown } = property;

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group flex-none w-[280px] flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf size={32} className="text-slate-200" />
          </div>
        )}
        {/* Smart Score Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-emerald-100">
          <TrendingUp size={13} className="text-emerald-600" />
          <span className="text-sm font-black text-slate-900">{smartScore}</span>
          <span className="text-[10px] text-slate-400 font-semibold">/100</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>
          <span className="text-emerald-600 font-extrabold text-sm whitespace-nowrap">
            {formatPrice(property.price)}
          </span>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
          <MapPin size={12} /> {property.location?.city || 'Sri Lanka'}
        </p>

        {/* Score indicators */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <ScoreChip label="Eco" value={scoringBreakdown?.eco} icon={ShieldCheck} color="text-emerald-500" bg="bg-emerald-50" />
          <ScoreChip label="Transit" value={scoringBreakdown?.mobility} icon={Bus} color="text-blue-500" bg="bg-blue-50" />
        </div>
      </div>
    </Link>
  );
}

function ScoreChip({ label, value, icon: Icon, color, bg }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${bg}`}>
      <Icon size={12} className={color} />
      <div>
        <p className="text-[9px] uppercase font-bold text-slate-400 leading-none">{label}</p>
        <p className="text-xs font-black text-slate-700 leading-tight">{value ?? '--'}%</p>
      </div>
    </div>
  );
}
