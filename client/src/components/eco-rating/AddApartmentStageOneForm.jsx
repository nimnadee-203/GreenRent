import React from "react";
import { AlignLeft, Banknote, CheckCircle2, Droplets, Home, Image as ImageIcon, Leaf, MapPin, Recycle, Sun, Trash2, Wind, Zap, BatteryCharging } from "lucide-react";

export default function AddApartmentStageOneForm({
  form,
  setForm,
  onFieldChange,
  onImageFilesChange,
  removeSelectedImage,
  error,
  success,
  isSubmitting,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="p-6 sm:p-10 lg:p-12 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="space-y-7 lg:col-span-7">
          <InputWithIcon icon={Home} label="Property Title" value={form.title} onChange={onFieldChange("title")} required />
          <InputWithIcon icon={MapPin} label="Address" value={form.address} onChange={onFieldChange("address")} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithIcon icon={MapPin} label="Display Address" value={form.displayAddress} onChange={onFieldChange("displayAddress")} placeholder="e.g., No. 12, Palm Grove Residences" />
            <InputWithIcon icon={MapPin} label="City" value={form.city} onChange={onFieldChange("city")} placeholder="e.g., Colombo" />
            <InputWithIcon icon={MapPin} label="State / Province" value={form.state} onChange={onFieldChange("state")} placeholder="e.g., Western Province" />
            <InputWithIcon icon={MapPin} label="Country" value={form.country} onChange={onFieldChange("country")} placeholder="e.g., Sri Lanka" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Stay Type</label>
              <select
                value={form.stayType}
                onChange={onFieldChange("stayType")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="long">Long Stay</option>
                <option value="short">Short Stay</option>
                <option value="both">Both</option>
              </select>
            </div>

            {(form.stayType === "long" || form.stayType === "both") && (
              <InputWithIcon
                icon={Banknote}
                label="Monthly Price (LKR)"
                value={form.monthlyPrice}
                onChange={onFieldChange("monthlyPrice")}
                type="number"
                min="0"
                required
              />
            )}

            {(form.stayType === "short" || form.stayType === "both") && (
              <InputWithIcon
                icon={Banknote}
                label="Daily Price (LKR)"
                value={form.dailyPrice}
                onChange={onFieldChange("dailyPrice")}
                type="number"
                min="0"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithIcon icon={Home} label="Area (sq.ft)" value={form.area} onChange={onFieldChange("area")} type="number" min="0" placeholder="e.g., 1200" />
            <div className="flex flex-col">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Property Type</label>
              <select value={form.propertyType} onChange={onFieldChange("propertyType")} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="townhouse">Townhouse</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="mb-1.5 flex items-center text-sm font-semibold text-slate-700">
                <Home className="w-4 h-4 mr-2 text-slate-400" />
                Bedrooms
              </label>
              <input
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={onFieldChange("bedrooms")}
                placeholder="e.g., 2"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1.5 flex items-center text-sm font-semibold text-slate-700">
                <Home className="w-4 h-4 mr-2 text-slate-400" />
                Bathrooms
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.bathrooms}
                onChange={onFieldChange("bathrooms")}
                placeholder="e.g., 1"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {(form.stayType === "short" || form.stayType === "both") && (
              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center text-sm font-semibold text-slate-700">
                  <Home className="w-4 h-4 mr-2 text-slate-400" />
                  Maximum Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxGuests}
                  onChange={onFieldChange("maxGuests")}
                  placeholder="e.g., 4"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            )}

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors min-h-[50px]">
              <input
                type="checkbox"
                checked={form.parking}
                onChange={onFieldChange("parking")}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">Parking</span>
            </label>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <div className="flex flex-col">
            <label className="mb-1.5 flex items-center text-sm font-semibold text-slate-700"><AlignLeft className="w-4 h-4 mr-2 text-slate-400" />Description</label>
            <textarea value={form.description} onChange={onFieldChange("description")} required className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 min-h-[220px] resize-y" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-sm font-semibold text-slate-700"><ImageIcon className="w-4 h-4 mr-2 text-slate-400" />Property Images</label>
              <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                Browse images
                <input type="file" accept="image/*" multiple className="hidden" onChange={onImageFilesChange} />
              </label>
            </div>

            <div className="space-y-3 max-h-[270px] overflow-y-auto pr-1">
              {form.imageFiles.length === 0 && (
                <p className="text-xs text-slate-500">No images selected yet.</p>
              )}

              {form.imageFiles.map((file, index) => (
                <div key={`image-${index}`} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="radio"
                      name="cover-image"
                      checked={form.coverImageIndex === index}
                      onChange={() => setForm((prev) => ({ ...prev, coverImageIndex: index }))}
                      className="text-emerald-600"
                    />
                    Set as cover image
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          {error && <p className="text-sm font-medium text-red-600 bg-red-50 py-2 px-4 rounded-lg">{error}</p>}
          {success && <p className="text-sm font-medium text-emerald-600 bg-emerald-50 py-2 px-4 rounded-lg">{success}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-black disabled:opacity-70 shadow-md">{isSubmitting ? "Saving..." : "Continue to Eco-Rating"}</button>
      </div>
    </form>
  );
}

function InputWithIcon({ icon: Icon, label, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 flex items-center text-sm font-semibold text-slate-700"><Icon className="w-4 h-4 mr-2 text-slate-400" />{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-800" />
    </div>
  );
}
