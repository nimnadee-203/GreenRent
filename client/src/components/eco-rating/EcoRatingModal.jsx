import React from "react";
import { BatteryCharging, CheckCircle2, Droplets, Leaf, Recycle, Sun, Wind, X, Zap } from "lucide-react";

export default function EcoRatingModal({
  isOpen,
  activeProperty,
  ecoForm,
  onEcoFieldChange,
  onClose,
  onSubmit,
  onClear,
  isSubmitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl my-auto flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Configure Eco-Profile</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{activeProperty?.title}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-10 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Energy Rating (EPC)</label>
                <select value={ecoForm.energyRating} onChange={onEcoFieldChange("energyRating")} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                  <option value="A">A - Excellent Energy Efficiency</option><option value="B">B - Good</option><option value="C">C - Average</option><option value="D">D - Poor</option><option value="E">E - Very Poor</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Public Transport Proximity</label>
                <select value={ecoForm.transportDistance} onChange={onEcoFieldChange("transportDistance")} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                  <option value="< 1 km">Under 1 km (Optimal)</option><option value="1-3 km">1-3 km (Moderate)</option><option value="> 3 km">Over 3 km (Remote)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-5"><Leaf className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-lg text-slate-900">Green Amenities</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FeatureToggle icon={Sun} label="Solar Panels" checked={ecoForm.solarPanels} onChange={onEcoFieldChange("solarPanels")} />
                <FeatureToggle icon={Zap} label="LED Lighting" checked={ecoForm.ledLighting} onChange={onEcoFieldChange("ledLighting")} />
                <FeatureToggle icon={Wind} label="Efficient AC" checked={ecoForm.efficientAc} onChange={onEcoFieldChange("efficientAc")} />
                <FeatureToggle icon={Droplets} label="Water Saving Taps" checked={ecoForm.waterSavingTaps} onChange={onEcoFieldChange("waterSavingTaps")} />
                <FeatureToggle icon={Droplets} label="Rainwater Harvest" checked={ecoForm.rainwaterHarvesting} onChange={onEcoFieldChange("rainwaterHarvesting")} />
                <FeatureToggle icon={CheckCircle2} label="Water Meter" checked={ecoForm.waterMeter} onChange={onEcoFieldChange("waterMeter")} />
                <FeatureToggle icon={Recycle} label="Recycling Setup" checked={ecoForm.recyclingAvailable} onChange={onEcoFieldChange("recyclingAvailable")} />
                <FeatureToggle icon={Leaf} label="Composting Base" checked={ecoForm.compostAvailable} onChange={onEcoFieldChange("compostAvailable")} />
                <FeatureToggle icon={BatteryCharging} label="EV Charging" checked={ecoForm.evCharging} onChange={onEcoFieldChange("evCharging")} />
                <FeatureToggle icon={Wind} label="Good Ventilation" checked={ecoForm.goodVentilationSunlight} onChange={onEcoFieldChange("goodVentilationSunlight")} />
              </div>
            </div>
          </div>

          <div className="p-6 sm:px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50 flex-shrink-0">
            <div>
              {activeProperty?.ecoRatingId && (
                <button type="button" onClick={() => onClear(activeProperty._id)} className="rounded-xl bg-amber-50 px-6 py-3.5 text-sm font-bold text-amber-600 hover:bg-amber-100 transition-colors">
                  Clear Rating
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="rounded-xl px-6 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-md flex items-center">{isSubmitting ? "Saving..." : <><Leaf className="w-4 h-4 mr-2" /> Publish Eco-Profile</>}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeatureToggle({ icon: Icon, label, checked, onChange }) {
  return (
    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${checked ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 font-bold text-sm text-slate-700 select-none">{label}</div>
      <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? "bg-emerald-500 border-emerald-500" : "bg-slate-50 border-slate-300"}`}>{checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}</div>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}
