import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Zap,
  Star,
  Leaf,
} from 'lucide-react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import HomeRecommendations from '../../components/Home/HomeRecommendations';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { backendUser } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main>
        <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
          <div className="hero-image-bg absolute inset-0" />
          <div className="absolute inset-0 bg-slate-900/45" />

          <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 border border-emerald-200 text-emerald-700 text-sm font-medium mb-8 backdrop-blur-sm">
              <Leaf className="w-4 h-4" />
              <span>The new standard for eco-friendly living</span>
            </div>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-tight text-white">
              Find a home that cares about the <span className="text-emerald-600">planet.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              GreenRent connects eco-conscious tenants with sustainable properties.
              We verify eco-ratings so you know exactly what you are renting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/properties"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white h-12 px-6 text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Find an Apartment <Search className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/add-apartment"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 h-12 px-6 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                List a Property
              </Link>
            </div>
          </div>
        </section>

        {backendUser && <HomeRecommendations />}

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Why choose GreenRent?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                We bring transparency to rentals by rewarding sustainable landlords
                and helping renters reduce utility costs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 hover:bg-emerald-50/50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Eco Ratings</h3>
                <p className="text-slate-600">
                  Every property receives a transparent 0-100 eco score based on
                  energy, insulation, and water efficiency.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 hover:bg-emerald-50/50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lower Utility Bills</h3>
                <p className="text-slate-600">
                  Highly-rated properties are more efficient, helping renters save
                  monthly on electricity, heating, and water.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 hover:bg-emerald-50/50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <Star className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real Renter Reviews</h3>
                <p className="text-slate-600">
                  Read authentic tenant feedback about comfort, utility costs, and
                  landlord responsiveness before booking.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">The GreenRent Eco Score</h2>
                <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
                  We enforce transparency. Listings need complete eco details to stay
                  visible, helping renters compare sustainability easily.
                </p>
                <ul className="space-y-3 text-slate-300">
                  <li>• Energy Source and Heating</li>
                  <li>• Insulation and Window Quality</li>
                  <li>• Water Saving Fixtures</li>
                  <li>• Natural Light and Ventilation</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-700">
                  <div>
                    <h4 className="text-lg font-medium mb-1">Overall Eco Score</h4>
                    <p className="text-slate-400 text-sm">Based on key sustainability categories</p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-400">86</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <ScoreBar label="Energy Efficiency" score={90} />
                  <ScoreBar label="Insulation" score={85} />
                  <ScoreBar label="Water Usage" score={70} />
                  <ScoreBar label="Materials" score={95} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-emerald-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Ready to find your sustainable home?
            </h2>
            <p className="text-emerald-100 text-base md:text-lg mb-10">
              Join renters and landlords creating greener living choices.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/properties"
                className="inline-flex items-center justify-center rounded-lg bg-white text-emerald-700 h-12 px-6 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Browse Apartments
              </Link>
              <Link
                to="/add-apartment"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-700 text-white h-12 px-6 text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{score}/100</span>
      </div>
      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
