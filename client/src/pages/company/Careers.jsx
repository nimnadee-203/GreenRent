import React from 'react';
import { Briefcase, Users, Sparkles, HeartHandshake } from 'lucide-react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';

const Careers = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Careers at GreenRent</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join us to build a cleaner, greener rental future for everyone.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Why Work With Us</h2>
            <p className="text-slate-600 mb-8">
              We are a mission-driven team combining sustainability, technology, and community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                <Users className="w-6 h-6 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">People First</h3>
                <p className="text-slate-600 text-sm">Collaborative culture with real ownership and impact.</p>
              </div>
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                <Sparkles className="w-6 h-6 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">Meaningful Work</h3>
                <p className="text-slate-600 text-sm">Build products that improve how cities live sustainably.</p>
              </div>
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                <HeartHandshake className="w-6 h-6 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">Supportive Team</h3>
                <p className="text-slate-600 text-sm">Mentorship, growth, and a respectful working environment.</p>
              </div>
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                <Briefcase className="w-6 h-6 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">Open Roles</h3>
                <p className="text-slate-600 text-sm">No active roles right now — check back soon for updates.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
