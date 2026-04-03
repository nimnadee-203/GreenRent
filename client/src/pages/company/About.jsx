import React from 'react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import { Leaf, Info, Target, Users, Landmark } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">About GreenRent</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Redefining urban living through sustainability and transparency.
                        </p>
                    </div>

                    <div className="relative mb-24 rounded-3xl overflow-hidden shadow-2xl h-[400px]">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-teal-500/60 flex items-center justify-center p-12">
                            <div className="text-center text-white max-w-2xl">
                                <h2 className="text-3xl font-bold mb-6 italic">"A sustainable home is the foundation of a sustainable lifestyle."</h2>
                                <p className="text-emerald-50 opacity-90 leading-relaxed text-lg">
                                    GreenRent was founded in 2026 with a simple mission: to make eco-friendly living accessible and transparent for every city dweller, while rewarding landlords for sustainable practices.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                            <div className="bg-emerald-100 p-4 rounded-2xl w-fit mx-auto mb-6">
                                <Leaf className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Eco-Rating System</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Our proprietary algorithm evaluates properties based on energy efficiency, waste management, and sustainable materials.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                            <div className="bg-emerald-100 p-4 rounded-2xl w-fit mx-auto mb-6">
                                <Target className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Reducing the carbon footprint of the residential rental market through data-driven recommendations and community feedback.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                            <div className="bg-emerald-100 p-4 rounded-2xl w-fit mx-auto mb-6">
                                <Users className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">The Community</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Connecting passionate eco-conscious renters with landlords who care about the future of our planet.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">Advocating for Change</h2>
                                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                                    We believe that visibility is the first step toward progress. By providing detailed eco-ratings for every property, we empower renters to make informed decisions and motivate landlords to upgrade their properties.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-slate-700">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <span>Independent Verification of Sustainable Credentials</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <span>Focus on Long-Term Urban Resilience</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <span>Support for Eco-Friendly Architecture</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-emerald-50 rounded-2xl p-8 flex items-center justify-center border-2 border-emerald-100 border-dashed aspect-square">
                                <Landmark className="w-32 h-32 text-emerald-600 opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;
