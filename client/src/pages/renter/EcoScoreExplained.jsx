import React from 'react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import { HelpCircle, BookOpen, Star, Zap, Droplet, Wind } from 'lucide-react';

const EcoScoreExplained = () => {
    const categories = [
        {
            title: "Energy Efficiency",
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            score: "35%",
            description: "How well the property conserves energy, including insulation, LED lighting, and smart thermostats."
        },
        {
            title: "Water Management",
            icon: <Droplet className="w-6 h-6 text-blue-500" />,
            score: "25%",
            description: "Efficient plumbing fixtures, rainwater harvesting, and greywater recycling systems."
        },
        {
            title: "Air Quality",
            icon: <Wind className="w-6 h-6 text-emerald-500" />,
            score: "20%",
            description: "Ventilation systems, low-VOC materials, and proximity to green spaces."
        },
        {
            title: "Waste & Materials",
            icon: <BookOpen className="w-6 h-6 text-purple-500" />,
            score: "20%",
            description: "Recycling accessibility, composting facilities, and use of sustainable building materials."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Eco Score Explained</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            How we calculate the environmental impact of your next home.
                        </p>
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex gap-6 items-start">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    {cat.icon}
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xl font-bold text-slate-900">{cat.title}</h3>
                                        <span className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                            {cat.score} weight
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">
                                        {cat.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-12 text-white">
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <HelpCircle className="w-6 h-6 text-emerald-400" />
                            Frequently Asked Questions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                            <div>
                                <h4 className="font-semibold text-emerald-400 mb-3 text-lg">Who verifies these scores?</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    Initial scores are based on landlord data, but they are audited through renter reviews and environment sensor data (like AQI) monitored through our real-time integrations.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-emerald-400 mb-3 text-lg">Can a score change?</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    Yes! If a landlord installs solar panels or upgrades home insulation, the score is updated immediately upon verification.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EcoScoreExplained;
