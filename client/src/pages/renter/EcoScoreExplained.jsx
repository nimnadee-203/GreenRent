import React from 'react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import EcoScoreHero from '../../components/renter/EcoScoreHero';
import EcoScoreCategories from '../../components/renter/EcoScoreCategories';
import EcoScoreFaq from '../../components/renter/EcoScoreFaq';

const EcoScoreExplained = () => {
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

                    <EcoScoreHero />

                    <EcoScoreCategories />

                    <EcoScoreFaq />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EcoScoreExplained;
