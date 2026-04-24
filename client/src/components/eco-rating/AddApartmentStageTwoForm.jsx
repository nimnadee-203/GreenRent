import React from "react";
import { BatteryCharging, CheckCircle2, Droplets, Leaf, MapPin, Recycle, Sun, Wind, Zap } from "lucide-react";

export default function AddApartmentStageTwoForm({
  ecoForm,
  onEcoFieldChange,
  coordinateHint,
  error,
  isSubmitting,
  onSubmit,
  onSkip,
}) {
  return (
    <form onSubmit={onSubmit} className="p-6 sm:p-10 lg:p-12 space-y-10">
      <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center mb-4 text-emerald-800"><MapPin className="w-5 h-5 mr-2" /><h3 className="font-semibold">Location Coordinates</h3></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputWithIcon icon={MapPin} label="Latitude" type="number" step="any" value={ecoForm.latitude} onChange={onEcoFieldChange("latitude")} required />
          <InputWithIcon icon={MapPin} label="Longitude" type="number" step="any" value={ecoForm.longitude} onChange={onEcoFieldChange("longitude")} required />
        </div>
        {coordinateHint && (
          <p className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {coordinateHint}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Energy Rating</label>
          <select value={ecoForm.energyRating} onChange={onEcoFieldChange("energyRating")} required className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm">
            <option value="" disabled>Select Energy Rating</option>
            <option value="A">A - Excellent</option><option value="B">B - Good</option><option value="C">C - Average</option><option value="D">D - Poor</option><option value="E">E - Very Poor</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Transport Distance</label>
          <select value={ecoForm.transportDistance} onChange={onEcoFieldChange("transportDistance")} required className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm">
            <option value="" disabled>Select Distance</option>
            <option value="< 1 km">{"< 1 km"}</option><option value="1-3 km">1-3 km</option><option value="> 3 km">{"> 3 km"}</option>
          </select>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4"><Leaf className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-lg text-slate-900">Green Amenities</h3></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FeatureToggle icon={Sun} label="Solar Panels" checked={ecoForm.solarPanels} onChange={onEcoFieldChange("solarPanels")} />
          <FeatureToggle icon={Zap} label="LED Lighting" checked={ecoForm.ledLighting} onChange={onEcoFieldChange("ledLighting")} />
          <FeatureToggle icon={Wind} label="Efficient AC" checked={ecoForm.efficientAc} onChange={onEcoFieldChange("efficientAc")} />
          <FeatureToggle icon={Droplets} label="Water Saving Taps" checked={ecoForm.waterSavingTaps} onChange={onEcoFieldChange("waterSavingTaps")} />
          <FeatureToggle icon={Droplets} label="Rainwater Harvest" checked={ecoForm.rainwaterHarvesting} onChange={onEcoFieldChange("rainwaterHarvesting")} />
          <FeatureToggle icon={CheckCircle2} label="Water Meter" checked={ecoForm.waterMeter} onChange={onEcoFieldChange("waterMeter")} />
          <FeatureToggle icon={Recycle} label="Recycling Setup" checked={ecoForm.recyclingAvailable} onChange={onEcoFieldChange("recyclingAvailable")} />
          <FeatureToggle icon={Leaf} label="Composting" checked={ecoForm.compostAvailable} onChange={onEcoFieldChange("compostAvailable")} />
          <FeatureToggle icon={BatteryCharging} label="EV Charging" checked={ecoForm.evCharging} onChange={onEcoFieldChange("evCharging")} />
          <FeatureToggle icon={Wind} label="Good Ventilation" checked={ecoForm.goodVentilationSunlight} onChange={onEcoFieldChange("goodVentilationSunlight")} />
        </div>
      </div>
      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="button" onClick={onSkip} className="text-sm font-bold text-slate-500">Skip</button>
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-emerald-700">{isSubmitting ? "Confirming..." : "Publish Listing"}</button>
      </div>
    </form>
  );
}
// Reusable input component with icon
function InputWithIcon({ icon: Icon, label, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 flex items-center text-sm font-semibold text-slate-700"><Icon className="w-4 h-4 mr-2 text-slate-400" />{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-800" />
    </div>
  );
}
// Reusable feature toggle component
function FeatureToggle({ icon: Icon, label, checked, onChange }) {
  return (
    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 bg-white"}`}>
      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${checked ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 font-semibold text-sm text-slate-700 select-none">{label}</div>
      <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${checked ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}>{checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}</div>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}
