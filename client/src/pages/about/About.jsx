import React from 'react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import { Leaf, Users, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: "Sustainability First",
      description: "We prioritize properties with verified high Eco-Ratings, driving the transition to greener, more energy-efficient urban living."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "By connecting environmentally conscious renters with like-minded landlords, we're building a sustainable ecosystem."
    },
    {
      icon: ShieldCheck,
      title: "Verified Trust",
      description: "Authentic renter reviews and transparent sensor-backed rating systems ensure you know exactly what you're renting."
    },
    {
      icon: Globe,
      title: "Local Impact, Global Reach",
      description: "Every green apartment rented reduces urban carbon footprints, contributing to broader climate goals worldwide."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-900 border-b-8 border-emerald-500 py-24 sm:py-32">
        {/* Background Design Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-800 rounded-full blur-[120px] opacity-40 -mr-[200px] -mt-[200px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-900 rounded-full blur-[100px] opacity-50 -ml-[100px] -mb-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-300 text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm">
              <Leaf size={16} /> Our Mission
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8">
              Redefining renting for a <span className="text-emerald-400">sustainable</span> future.
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100/90 leading-relaxed max-w-2xl font-light">
              GreenRent was founded on a simple premise: finding an apartment shouldn't mean compromising on your environmental values. We make eco-friendly living accessible, verified, and rewarding.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                Why we built GreenRent.
              </h2>
              <div className="space-y-6 text-lg text-slate-600">
                <p>
                  As urban populations grow, the environmental impact of residential living has never been more critical. Yet, transparency regarding energy scores, air quality, and sustainable practices in the rental market was virtually non-existent.
                </p>
                <p>
                  We built GreenRent to bridge that gap. We introduced a comprehensive <strong className="text-emerald-700">Eco-Rating framework</strong> and a verified renter review system. Now, renters can filter homes based on true sustainability, and landlords are financially incentivized to green their properties.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <blockquote className="text-xl font-medium italic text-slate-800 border-l-4 border-emerald-500 pl-6 py-2">
                  "Our platform doesn't just list apartments; it sparks a competition for betters, greener living spaces."
                </blockquote>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-3xl transform translate-x-4 translate-y-4"></div>
              <img 
                src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800" 
                alt="Green sustainable modern building" 
                className="relative rounded-3xl shadow-xl z-10 w-full h-auto object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl z-20 max-w-xs border border-slate-100">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                    10k+
                  </div>
                  <p className="font-bold text-slate-900">Eco-Properties</p>
                </div>
                <p className="text-sm text-slate-500">Verified and actively reducing carbon emissions globally.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-white py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600">The principles that drive our decision-making and platform growth.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-slate-50 rounded-3xl p-8 hover:bg-emerald-50 hover:shadow-lg transition-all duration-300 border border-slate-100">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-emerald-600">
                  <value.icon size={28} className="stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full blur-[80px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10">
              Ready to find your next sustainable home?
            </h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of environmentally conscious renters and responsible landlords building a better future today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link 
                to="/properties" 
                className="inline-flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-4 rounded-full transition-colors text-lg"
              >
                Browse Properties <ArrowRight size={20} />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full transition-colors text-lg border border-white/20"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
