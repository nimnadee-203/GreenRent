import React from "react";
import { Edit2, Image as ImageIcon, Trash2 as TrashIcon, X } from "lucide-react";

export default function UpdateDetailsModal({
  isOpen,
  updateForm,
  existingUpdateImages,
  onFieldChange,
  onImageFilesChange,
  onRemoveSelectedImage,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 items-center flex justify-between border-b border-slate-100 flex-shrink-0">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Edit2 className="w-6 h-6 text-emerald-500" />
            Update Property Details
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col min-h-0">
          <div className="p-8 overflow-y-auto flex-1 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
              <input type="text" value={updateForm.title} onChange={onFieldChange("title")} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea value={updateForm.description} onChange={onFieldChange("description")} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 min-h-[120px]" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stay Type</label>
                <select value={updateForm.stayType} onChange={onFieldChange("stayType")} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white">
                  <option value="long">Long Stay</option>
                  <option value="short">Short Stay</option>
                  <option value="both">Both</option>
                </select>
              </div>
              {(updateForm.stayType === "long" || updateForm.stayType === "both") && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Price (LKR)</label>
                  <input type="number" min="0" value={updateForm.monthlyPrice} onChange={onFieldChange("monthlyPrice")} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
                </div>
              )}
              {(updateForm.stayType === "short" || updateForm.stayType === "both") && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Daily Price (LKR)</label>
                  <input type="number" min="0" value={updateForm.dailyPrice} onChange={onFieldChange("dailyPrice")} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Area (sq.ft)</label>
                <input type="number" value={updateForm.area} onChange={onFieldChange("area")} placeholder="e.g., 1200" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input type="text" value={updateForm.address} onChange={onFieldChange("address")} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Display Address</label>
                <input type="text" value={updateForm.displayAddress} onChange={onFieldChange("displayAddress")} placeholder="No. 12, Palm Grove Residences" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                <input type="text" value={updateForm.city} onChange={onFieldChange("city")} placeholder="Colombo" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">State / Province</label>
                <input type="text" value={updateForm.state} onChange={onFieldChange("state")} placeholder="Western Province" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                <input type="text" value={updateForm.country} onChange={onFieldChange("country")} placeholder="Sri Lanka" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bedrooms</label>
                <input type="number" min="0" value={updateForm.bedrooms} onChange={onFieldChange("bedrooms")} placeholder="e.g., 2" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bathrooms</label>
                <input type="number" min="0" step="1" value={updateForm.bathrooms} onChange={onFieldChange("bathrooms")} placeholder="e.g., 1" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              {(updateForm.stayType === "short" || updateForm.stayType === "both") && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Guests</label>
                  <input type="number" min="1" value={updateForm.maxGuests} onChange={onFieldChange("maxGuests")} placeholder="e.g., 4" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                </div>
              )}
              <label className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={updateForm.parking} onChange={onFieldChange("parking")} className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
                <span className="text-sm font-medium text-slate-700">Parking</span>
              </label>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center text-sm font-semibold text-slate-700"><ImageIcon className="w-4 h-4 mr-2 text-slate-400" />Property Images</label>
                <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                  Add images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onImageFilesChange} />
                </label>
              </div>
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Existing images</p>
                {existingUpdateImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingUpdateImages.map((image, index) => (
                      <div key={`existing-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <img src={image} alt={`Existing property ${index + 1}`} className="h-24 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No existing images found for this listing.</p>
                )}
              </div>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {updateForm.imageFiles.length === 0 && <p className="text-xs text-slate-500">No new images selected. Existing images will be kept.</p>}
                {updateForm.imageFiles.map((file, index) => (
                  <div key={`image-${index}`} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={() => onRemoveSelectedImage(index)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-70">{isSubmitting ? "Saving..." : "Update Property"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
