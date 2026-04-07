import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Leaf, 
  MapPin, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Bus, 
  Zap, 
  ChevronRight,
  Info,
  Calendar,
  Settings,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Navbar from '../../components/Home/Navbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/recommendations`, { withCredentials: true });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} /> AI-Powered Matching
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Recommended <span className="text-emerald-600">for You</span>
            </h1>
            <p className="mt-3 text-slate-500 text-lg max-w-2xl">
              Our Smart Eco Score calculates the best match based on your budget, required amenities, and sustainability goals.
            </p>
          </div>
          
          <Link 
            to="/preference-setup" 
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-emerald-300 transition-all shadow-sm"
          >
            <Settings size={18} className="text-emerald-500" />
            Update Preferences
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-12 text-center bg-white rounded-3xl border border-red-100">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button onClick={fetchRecommendations} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">Try Again</button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && recommendations.length === 0 && (
          <div className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Leaf className="text-slate-300 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">No matches found yet</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Try broadening your budget or reducing mandatory amenities to see more listings.</p>
            <Link to="/preference-setup" className="mt-8 inline-block px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20">Adjust Preferences</Link>
          </div>
        )}

        {/* Recommendation Grid */}
        {!isLoading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((property, idx) => (
              <RecommendationCard key={property._id} property={property} rank={idx + 1} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function RecommendationCard({ property, rank }) {
  const { smartScore, scoringBreakdown, mobility } = property;
  
  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
      {/* Rank Badge */}
      <div className="absolute top-5 left-5 z-20 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-lg border-2 border-white shadow-lg">
        #{rank}
      </div>

      {/* Property Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.images?.[0] ? (
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center"><MapPin size={40} className="text-slate-300" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        
        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
          <div className="text-white">
            <h3 className="font-extrabold text-xl line-clamp-1">{property.title}</h3>
            <p className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14} /> {property.location?.city}</p>
          </div>
          <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg font-black text-sm shadow-lg">
            {formatPrice(property.price)}
          </div>
        </div>
      </div>

      {/* Score Breakdown Area */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Smart Eco Score</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-emerald-600">{smartScore}</span>
              <span className="text-slate-400 text-sm font-bold">/100</span>
            </div>
          </div>
          <div className="bg-emerald-100/50 p-2 rounded-2xl flex flex-col items-center min-w-[70px]">
            <TrendingUp size={18} className="text-emerald-600 mb-1" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Match</span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <ScoreBar label="Eco Verification" value={scoringBreakdown?.eco} color="bg-emerald-500" icon={ShieldCheck} />
          <ScoreBar label="Transit & Mobility" value={scoringBreakdown?.mobility} color="bg-blue-500" icon={Bus} />
          <ScoreBar label="Price Suitability" value={scoringBreakdown?.priceMatch} color="bg-amber-500" icon={Zap} />
          <ScoreBar label="Personal Match" value={scoringBreakdown?.prefMatch} color="bg-indigo-500" icon={Sparkles} />
        </div>

        <div className="mt-auto pt-6 border-t border-dashed border-slate-200">
          <Link 
            to={`/properties/${property._id}`}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-center flex items-center justify-center gap-2 group/btn hover:bg-emerald-600 transition-colors shadow-xl shadow-slate-900/10"
          >
            Check Availability <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color, icon: Icon }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><Icon size={12} className="opacity-70" /> {label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${value || 0}%` }}
        />
      </div>
    </div>
  );
}
