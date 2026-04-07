import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Leaf, 
  Bus, 
  Sparkles, 
  CheckCircle2, 
  DollarSign,
  Building2,
  Zap,
  Droplets,
  Wind,
  Recycle,
  BatteryCharging,
  Sun
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const STEPS = [
  { id: 'basics', title: 'The Basics', subtitle: 'Set your living space and budget' },
  { id: 'priority', title: 'Eco Priority', subtitle: 'How green do you want to live?' },
  { id: 'amenities', title: 'Green Features', subtitle: 'Select must-have amenities' }
];

export default function PreferenceSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [prefs, setPrefs] = useState({
    budgetMax: 150000,
    propertyType: 'Apartment',
    ecoPriority: 'Medium',
    transportPreference: 'Public Transport',
    greenAmenities: []
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      savePreferences();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleAmenity = (amenity) => {
    setPrefs(prev => ({
      ...prev,
      greenAmenities: prev.greenAmenities.includes(amenity)
        ? prev.greenAmenities.filter(a => a !== amenity)
        : [...prev.greenAmenities, amenity]
    }));
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/recommendations/preferences`, prefs, { withCredentials: true });
      navigate('/recommendations');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-400">GreenRent</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <span className={idx <= currentStep ? 'text-emerald-400 font-semibold' : ''}>
                  {step.title}
                </span>
                {idx < STEPS.length - 1 && <ChevronRight size={14} className="opacity-30" />}
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {STEPS[currentStep].title}
          </h1>
          <p className="text-slate-400 text-lg">{STEPS[currentStep].subtitle}</p>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {currentStep === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <DollarSign size={16} /> Maximum Monthly Budget (LKR)
                </label>
                <div className="relative">
                  <input 
                    type="range" 
                    min="20000" 
                    max="1000000" 
                    step="10000"
                    value={prefs.budgetMax}
                    onChange={(e) => setPrefs({...prefs, budgetMax: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between mt-4">
                    <span className="text-slate-500 text-xs">20k</span>
                    <span className="text-emerald-400 font-mono text-2xl font-bold bg-emerald-500/10 px-4 py-1 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      {prefs.budgetMax.toLocaleString()} LKR
                    </span>
                    <span className="text-slate-500 text-xs">1M+</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <Building2 size={16} /> Property Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['Apartment', 'House', 'Studio', 'Shared Room', 'Any'].map(type => (
                    <button
                      key={type}
                      onClick={() => setPrefs({...prefs, propertyType: type})}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                        prefs.propertyType === type 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.15)]' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <Home size={24} />
                      <span className="font-bold">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <Sparkles size={16} /> Eco Living Priority
                </label>
                <div className="space-y-4">
                  {[
                    { id: 'High', label: 'Maximum Impact', desc: 'Prioritize properties with highest energy ratings and renewable tech.' },
                    { id: 'Medium', label: 'Balanced Choice', desc: 'Good energy efficiency with reasonable rent prices.' },
                    { id: 'Low', label: 'Entry Level', desc: 'Focus on budget with basic eco features like LED lighting.' }
                  ].map(priority => (
                    <button
                      key={priority.id}
                      onClick={() => setPrefs({...prefs, ecoPriority: priority.id})}
                      className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 flex items-center gap-6 ${
                        prefs.ecoPriority === priority.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${prefs.ecoPriority === priority.id ? 'bg-emerald-500 text-white' : 'bg-slate-800'}`}>
                        <Leaf size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{priority.label}</p>
                        <p className="text-sm opacity-60">{priority.desc}</p>
                      </div>
                      {prefs.ecoPriority === priority.id && <CheckCircle2 className="ml-auto" size={24} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <Bus size={16} /> Transport Preference
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['Public Transport', 'Walking/Cycling', 'EV Charging', 'Any'].map(trans => (
                    <button
                      key={trans}
                      onClick={() => setPrefs({...prefs, transportPreference: trans})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        prefs.transportPreference === trans
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="font-bold text-sm tracking-tight">{trans}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
                  <Zap size={16} /> Must-Have Amenities (Boosts Smart Score)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'solarPanels', label: 'Solar Power', icon: Sun },
                    { id: 'ledLighting', label: 'LED Lights', icon: Zap },
                    { id: 'efficientAc', label: 'Energy-Star AC', icon: Wind },
                    { id: 'waterSavingTaps', label: 'Water Efficiency', icon: Droplets },
                    { id: 'rainwaterHarvesting', label: 'Rainwater', icon: Droplets },
                    { id: 'recyclingAvailable', label: 'Recycling', icon: Recycle },
                    { id: 'compostAvailable', label: 'Composting', icon: Leaf },
                    { id: 'evCharging', label: 'EV Charger', icon: BatteryCharging },
                    { id: 'goodVentilationSunlight', label: 'Daylight/Air', icon: Wind },
                  ].map(amenity => {
                    const Icon = amenity.icon;
                    const isSelected = prefs.greenAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all group ${
                          isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div className={`mb-3 transition-colors ${isSelected ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-400'}`}>
                          <Icon size={24} />
                        </div>
                        <span className="font-bold text-sm leading-tight block">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 font-bold transition-opacity ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft size={20} /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white rounded-2xl font-black text-lg transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center gap-3"
          >
            {isLoading ? 'Saving...' : (currentStep === STEPS.length - 1 ? 'Find Recommended' : 'Next Step')}
            {!isLoading && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
