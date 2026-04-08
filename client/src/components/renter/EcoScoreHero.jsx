import React from 'react';
import { Star } from 'lucide-react';

export default function EcoScoreHero() {
  return (
    <div className="bg-emerald-600 rounded-3xl p-12 text-white mb-16 flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl font-bold mb-4">The Universal Green Standard</h2>
        <p className="text-emerald-50 text-lg opacity-90 leading-relaxed">
          Our Eco-Rating is a scientific assessment designed to give you a clear understanding of a property's sustainability. We aggregate data from local environment APIs and landlord certifications into a single 0-5 leaf rating.
        </p>
      </div>
      <div className="flex-shrink-0 bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/20">
        <div className="text-center">
          <span className="text-6xl font-bold">4.2</span>
          <div className="flex gap-1 mt-2 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 opacity-30'}`} />
            ))}
          </div>
          <p className="text-sm mt-4 text-emerald-100 uppercase tracking-widest">Example Rating</p>
        </div>
      </div>
    </div>
  );
}
