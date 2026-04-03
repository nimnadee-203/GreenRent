import React from 'react';
import { Newspaper, Megaphone, CalendarDays } from 'lucide-react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';

const Press = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Press</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Latest announcements and media updates from GreenRent.
            </p>
          </div>

          <div className="space-y-6">
            <article className="bg-white rounded-2xl border border-slate-200 p-7">
              <div className="flex items-center gap-2 text-emerald-700 mb-3">
                <Newspaper className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">News</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">GreenRent expands eco-rating coverage</h2>
              <p className="text-slate-600 mb-4">
                We expanded our property sustainability evaluation model to include more location-based environmental indicators.
              </p>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <CalendarDays className="w-4 h-4" />
                <span>April 2026</span>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-slate-200 p-7">
              <div className="flex items-center gap-2 text-emerald-700 mb-3">
                <Megaphone className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Announcement</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Community feedback milestone reached</h2>
              <p className="text-slate-600 mb-4">
                GreenRent has crossed a major renter review milestone, helping improve trust and transparency across listings.
              </p>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <CalendarDays className="w-4 h-4" />
                <span>April 2026</span>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Press;
