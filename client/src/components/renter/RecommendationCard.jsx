import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Bus, MapPin, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';

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

export default function RecommendationCard({ property, rank, apiBaseUrl, formatPrice }) {
  const [aiInsight, setAiInsight] = useState(property.aiInsight || null);
  const [isAiLoading, setIsAiLoading] = useState(!property.aiInsight && rank <= 3);
  const { smartScore, scoringBreakdown } = property;

  useEffect(() => {
    if (!aiInsight && rank <= 3) {
      const fetchInsight = async () => {
        try {
          const res = await axios.get(`${apiBaseUrl}/api/recommendations/ai-insight/${property._id}`, { withCredentials: true });
          if (res.data?.success) {
            setAiInsight(res.data.insight);
          }
        } catch (err) {
          console.error('Failed to fetch AI insight:', err);
        } finally {
          setIsAiLoading(false);
        }
      };
      fetchInsight();
    }
  }, [property._id, rank, aiInsight, apiBaseUrl]);

  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
      <div className="absolute top-5 left-5 z-20 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-lg border-2 border-white shadow-lg">
        #{rank}
      </div>

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

      <div className="p-6 flex-1 flex flex-col">
        {isAiLoading ? (
          <div className="mb-4 bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-2xl flex gap-3 items-center animate-pulse">
            <Sparkles className="text-emerald-300 shrink-0" size={18} />
            <div className="space-y-2 flex-1">
              <div className="h-2 bg-emerald-100 rounded-full w-3/4"></div>
              <div className="h-2 bg-emerald-100 rounded-full w-1/2"></div>
            </div>
          </div>
        ) : aiInsight ? (
          <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex gap-3 items-start shadow-sm shadow-emerald-100/50 animate-in fade-in duration-700">
            <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-emerald-900 leading-relaxed font-medium tracking-tight">"{aiInsight}"</p>
          </div>
        ) : null}

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
