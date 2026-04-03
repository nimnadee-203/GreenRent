import React from 'react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Have questions about green living or our platform? We're here to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-semibold text-slate-900 mb-8">Get in Touch</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-emerald-100 p-3 rounded-xl">
                                        <Phone className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Phone</p>
                                        <p className="text-slate-600">0771145331</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-emerald-100 p-3 rounded-xl">
                                        <Mail className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Email</p>
                                        <p className="text-slate-600">support@greenrent.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-emerald-100 p-3 rounded-xl">
                                        <MapPin className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Office</p>
                                        <p className="text-slate-600">123 Eco Way, Green City<br />Sustainability District</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-emerald-50 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                                    <p className="font-semibold text-emerald-900">Live Support</p>
                                </div>
                                <p className="text-emerald-700 text-sm leading-relaxed">
                                    Our team typically responds within 2 hours during business hours (9 AM - 6 PM).
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                    <textarea rows="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
