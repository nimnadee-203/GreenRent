import React, { useState } from 'react';
import Navbar from '../../components/Home/Navbar';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Home, PlusCircle, Star, TrendingUp, Bell, Clock, ArrowRight, Leaf, ShieldAlert, X } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const { currentUser, backendUser, fetchBackendUser } = useAuth();
  const [requestStatus, setRequestStatus] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || "Guest";
  const isLandlord = backendUser?.role === 'seller' || backendUser?.role === 'admin';
  
  const handleBecomeLandlord = async () => {
    try {
      setRequestStatus('loading');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/request-seller`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setRequestStatus('success');
        // Refresh backend user to see the changed sellerRequest status
        await fetchBackendUser();
      }
    } catch (error) {
      console.error("Error requesting to become landlord", error);
      setRequestStatus('error');
    }
  };

  // Mock stats for premium presentation
  const stats = [
    { label: isLandlord ? 'Active Listings' : 'Saved Properties', value: isLandlord ? '3' : '12', icon: Home, trend: '+1 this month' },
    { label: isLandlord ? 'Avg Eco-Rating' : 'Average Rating', value: '8.4', icon: Leaf, trend: 'Top 15%' },
    { label: 'Total Reviews', value: isLandlord ? '24' : '5', icon: Star, trend: '4.8/5 Avg' },
    { label: isLandlord ? 'Profile Views' : 'Searches', value: isLandlord ? '862' : '42', icon: TrendingUp, trend: '+12% vs last week' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-200">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-lg text-slate-500 mt-2">
              Here's what's happening with your properties today.
            </p>
          </div>
          <div className="flex gap-4">
            {isLandlord ? (
              <>
                <Link
                  to="/my-listings"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
                >
                  <LayoutDashboard size={18} />
                  Manage Listings
                </Link>
                <Link
                  to="/add-apartment"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
                >
                  <PlusCircle size={18} />
                  Add Property
                </Link>
              </>
            ) : (
              <button 
                onClick={handleBecomeLandlord}
                disabled={backendUser?.sellerRequest === 'pending' || requestStatus === 'loading' || requestStatus === 'success'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition shadow-sm shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {backendUser?.sellerRequest === 'pending' || requestStatus === 'success' ? (
                  <>
                    <Clock size={18} className="animate-pulse" />
                    Request Pending...
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} />
                    Become a Landlord
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {stat.value}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <stat.icon size={22} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50/50 inline-block px-2 py-1 rounded-md">
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Complex Content Split */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Activity Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View all <ArrowRight size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {[ 
                  { action: "New 5-star review from Sarah", asset: "Eco Haven Loft", time: "2 hours ago" },
                  { action: "Booking inquiry from David M.", asset: "Riverside Suite", time: "5 hours ago" },
                  { action: "Eco-Rating badge upgraded", asset: "Green Retreat", time: "1 day ago" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 mt-1">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{item.action}</p>
                      <p className="text-sm text-slate-500">Property: <span className="font-medium text-slate-700">{item.asset}</span></p>
                      <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <Leaf className="w-10 h-10 mb-4 opacity-80" />
                <h2 className="text-2xl font-bold mb-2">
                  {isLandlord ? "Boost your Eco-Rating" : "Find Greener Homes"}
                </h2>
                <p className="text-emerald-50 mb-6 text-sm leading-relaxed">
                  {isLandlord 
                    ? "Provide verified sensor data for your properties to unlock the 'Certified Green' badge and rank higher in search results."
                    : "Use our tailored filters to discover apartments rated highly for low emissions, great air quality, and noise reduction."}
                </p>
                {isLandlord ? (
                  <button onClick={() => setShowGuideModal(true)} className="block w-full text-center py-3 bg-white text-emerald-700 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition">
                    Learn How to Upgrade
                  </button>
                ) : (
                  <Link to="/properties" className="block w-full text-center py-3 bg-white text-emerald-700 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition">
                    Browse Properties
                  </Link>
                )}
              </div>
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-teal-900 opacity-30 rounded-full blur-xl"></div>
            </div>

            {isLandlord && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Bell size={18} className="text-amber-500" /> Need Attention
                </h3>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-sm text-amber-800 font-semibold mb-1">Verify Address</p>
                  <p className="text-xs text-amber-700/80 mb-3">Your latest listing "Skyline Eco Pad" requires manual address verification.</p>
                  <button className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">
                    Verify Now
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Landlord Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-auto overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Leaf className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">How to Update Eco-Ratings</h2>
              </div>
              <button onClick={() => setShowGuideModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
               <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                 <h4 className="font-bold text-amber-800 flex items-center mb-1"><Clock className="w-4 h-4 mr-2" /> Important Deadlines</h4>
                 <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1 mt-2">
                   <li><strong>New Listings:</strong> You have <strong>48 hours</strong> from creation to add an Eco-Rating.</li>
                   <li><strong>Cleared Ratings:</strong> If you clear an existing rating, you have <strong>1 hour</strong> to submit a new one.</li>
                   <li>Failing to meet these deadlines will cause your listing to be <strong>hidden from public view</strong>.</li>
                 </ul>
               </div>

               <div className="space-y-4">
                 <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">1</div>
                   <div>
                     <h4 className="font-bold text-slate-900">Navigate to My Listings</h4>
                     <p className="text-sm text-slate-600 mt-1">Go to your dashboard and click "Manage Listings" or use the top navigation to visit the My Listings page.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">2</div>
                   <div>
                     <h4 className="font-bold text-slate-900">Add or Edit Rating</h4>
                     <p className="text-sm text-slate-600 mt-1">Locate your property. Click the <strong>"Add Rating"</strong> or <strong>"Edit Rating"</strong> button depending on its current status.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">3</div>
                   <div>
                     <h4 className="font-bold text-slate-900">Select Green Features</h4>
                     <p className="text-sm text-slate-600 mt-1">Check off all applicable green amenities like Solar Panels, LED Lighting, Water Meters, and select your Energy Rating (EPC).</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">4</div>
                   <div>
                     <h4 className="font-bold text-slate-900">Clear & Renew (Optional)</h4>
                     <p className="text-sm text-slate-600 mt-1">If your property has undergone renovations, you can use the <strong>"Clear Rating"</strong> button. Remember, you must submit the new rating within 1 hour!</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
               <Link to="/my-listings" className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md">
                 Go to My Listings
               </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
