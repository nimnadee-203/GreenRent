import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Home/Navbar';
import { Home, MapPin, AlignLeft, Image as ImageIcon, Banknote, Leaf, CheckCircle2, Sun, Zap, Wind, Droplets, Recycle, BatteryCharging, Loader2, ArrowLeft, Trash2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const INITIAL_FORM = {
  title: '',
  description: '',
  address: '',
  displayAddress: '',
  city: '',
  state: '',
  country: '',
  price: '',
  stayType: 'long',
  monthlyPrice: '',
  dailyPrice: '',
  area: '',
  propertyType: 'apartment',
  imageFiles: [],
  coverImageIndex: 0,
  bedrooms: '',
  bathrooms: '',
  maxGuests: '',
  parking: false,
};
const INITIAL_ECO_FORM = { latitude: '', longitude: '', energyRating: 'C', solarPanels: false, ledLighting: false, efficientAc: false, waterSavingTaps: false, rainwaterHarvesting: false, waterMeter: false, recyclingAvailable: false, compostAvailable: false, transportDistance: '1-3 km', evCharging: false, goodVentilationSunlight: false };

export default function AddApartment() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stage, setStage] = useState(1);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [ecoForm, setEcoForm] = useState(INITIAL_ECO_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/data`, { withCredentials: true });
      setUser(response.data?.userData || null);
    } catch (fetchError) {
      setUser(null);
      setError(fetchError?.response?.data?.message || 'Please login to continue.');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const onFieldChange = (field) => (event) =>
    setForm((prev) => ({
      ...prev,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));
  const onEcoFieldChange = (field) => (event) => setEcoForm((prev) => ({ ...prev, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const onImageFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB per file
    const oversizedFiles = selectedFiles.filter((f) => f.size > MAX_FILE_SIZE);

    if (oversizedFiles.length) {
      setError(
        `Some images are too large (max 2MB per file). Please select smaller images. Oversized: ${oversizedFiles.map((f) => f.name).join(", ")}`
      );
      event.target.value = '';
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...selectedFiles],
    }));

    event.target.value = '';
  };

  const removeSelectedImage = (index) => {
    setForm((prev) => {
      if (prev.imageFiles.length === 1) {
        return {
          ...prev,
          imageFiles: [],
          coverImageIndex: 0,
        };
      }

      const nextImageFiles = prev.imageFiles.filter((_, i) => i !== index);
      let nextCoverIndex = prev.coverImageIndex;
      if (index === prev.coverImageIndex) {
        nextCoverIndex = 0;
      } else if (index < prev.coverImageIndex) {
        nextCoverIndex = prev.coverImageIndex - 1;
      }

      return {
        ...prev,
        imageFiles: nextImageFiles,
        coverImageIndex: Math.max(0, Math.min(nextCoverIndex, nextImageFiles.length - 1)),
      };
    });
  };

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  /**
   * Compress an image file using Canvas API
   * Returns a data URL with the compressed image
   */
  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Resize to max 800px width, maintain aspect ratio
          let width = img.width;
          let height = img.height;
          if (width > 800) {
            height = Math.round((height * 800) / width);
            width = 800;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    });
  };

  const handleBecomeSeller = async () => {
    setError(''); setSuccess(''); setIsUpgrading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/request-seller`, {}, { withCredentials: true });
      await fetchUser();
      setSuccess('Seller access enabled. You can now add apartments.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not upgrade seller role.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleStage1Submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setIsSubmitting(true);

    try {
      if ((form.stayType === 'long' || form.stayType === 'both') && (!form.monthlyPrice || Number(form.monthlyPrice) < 0)) {
        setError('Please enter a valid monthly price for long stay.');
        return;
      }

      if ((form.stayType === 'short' || form.stayType === 'both') && (!form.dailyPrice || Number(form.dailyPrice) < 0)) {
        setError('Please enter a valid daily price for short stay.');
        return;
      }

      if ((form.stayType === 'short' || form.stayType === 'both') && (!form.maxGuests || Number(form.maxGuests) < 1)) {
        setError('Please enter a valid maximum number of guests for short stay.');
        return;
      }

      // Compress and convert images to base64
      let compressedImages = [];
      if (form.imageFiles.length > 0) {
        setError('Processing images...'); // Show progress
        compressedImages = await Promise.all(
          form.imageFiles.map((file) => compressImage(file))
        );
        setError(''); // Clear progress message
      }

      const payload = {
        title: form.title,
        description: form.description,
        location: {
          address: form.address,
          displayAddress: form.displayAddress,
          city: form.city,
          state: form.state,
          country: form.country,
        },
        // Keep legacy price for existing screens (fallback display value)
        price:
          form.stayType === 'short'
            ? Number(form.dailyPrice)
            : Number(form.monthlyPrice),
        stayType: form.stayType,
        propertyType: form.propertyType,
        ecoFeatures: {},
        images: compressedImages,
      };

      if (form.stayType === 'long' || form.stayType === 'both') {
        payload.monthlyPrice = Number(form.monthlyPrice);
      }

      if (form.stayType === 'short' || form.stayType === 'both') {
        payload.dailyPrice = Number(form.dailyPrice);
      }

      // Only add optional fields if they have values
      if (form.bedrooms) payload.bedrooms = Number(form.bedrooms);
      if (form.bathrooms) payload.bathrooms = Number(form.bathrooms);
      if (form.area) payload.area = Number(form.area);
      if (form.parking) payload.parking = form.parking;
      if (form.stayType === 'short' || form.stayType === 'both') {
        if (form.maxGuests) {
          payload.maxGuests = Number(form.maxGuests);
        }
      } else {
        payload.maxGuests = null;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/properties`, payload, { withCredentials: true });
      setCreatedPropertyId(response.data._id);
      
      // Check if address was successfully geocoded
      const hasCoordinates = response.data.location?.coordinates?.lat && response.data.location?.coordinates?.lng;
      
      if (hasCoordinates) {
        setEcoForm(prev => ({ 
          ...prev, 
          latitude: response.data.location.coordinates.lat || prev.latitude, 
          longitude: response.data.location.coordinates.lng || prev.longitude 
        }));
        setSuccess('Apartment listed successfully! Let\'s build its Eco-Profile.');
      } else {
        // Address couldn't be geocoded, but property was created
        setSuccess('Apartment listed successfully! The address couldn\'t be located on the map yet, but your property has been created. You can view it on the map once the address is verified.');
      }
      
      setStage(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      console.error('Submit error details:', {
        status: submitError?.response?.status,
        message: submitError?.response?.data?.message,
        errors: submitError?.response?.data?.errors,
        fullError: submitError,
      });
      const serverErrors = submitError?.response?.data?.errors;
      const errorMsg = submitError?.response?.data?.message || 'Failed to create apartment.';
      setError(Array.isArray(serverErrors) && serverErrors.length ? serverErrors.join(' | ') : errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStage2Submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setIsSubmitting(true);
    const payload = { listingId: createdPropertyId, location: { latitude: Number(ecoForm.latitude), longitude: Number(ecoForm.longitude) }, criteria: { energyRating: ecoForm.energyRating, solarPanels: ecoForm.solarPanels, ledLighting: ecoForm.ledLighting, efficientAc: ecoForm.efficientAc, waterSavingTaps: ecoForm.waterSavingTaps, rainwaterHarvesting: ecoForm.rainwaterHarvesting, waterMeter: ecoForm.waterMeter, recyclingAvailable: ecoForm.recyclingAvailable, compostAvailable: ecoForm.compostAvailable, transportDistance: ecoForm.transportDistance, evCharging: ecoForm.evCharging, goodVentilationSunlight: ecoForm.goodVentilationSunlight } };
    try {
      await axios.post(`${API_BASE_URL}/api/eco-ratings`, payload, { withCredentials: true });
      navigate('/my-listings');
    } catch (submitError) {
      const serverErrors = submitError?.response?.data?.errors;
      setError(Array.isArray(serverErrors) && serverErrors.length ? serverErrors.join(' | ') : (submitError?.response?.data?.message || 'Failed to save eco-rating.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddProperty = user && (user.role === 'seller' || user.role === 'admin');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        {authLoading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : !user ? (
           <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center max-w-2xl mx-auto shadow-sm">
             <h3 className="text-lg font-semibold text-slate-900">Authentication Required</h3>
             <p className="mt-2 text-slate-600">Please log in to continue.</p>
           </div>
        ) : !canAddProperty ? (
           <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center max-w-2xl mx-auto shadow-sm overflow-hidden relative">
             <h3 className="text-2xl font-bold text-slate-900">Become a Landlord</h3>
             <button onClick={handleBecomeSeller} disabled={isUpgrading} className="mt-8 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 transition-all">{isUpgrading ? 'Upgrading...' : 'Upgrade Now'}</button>
           </div>
        ) : (
          <>
            <div className="mb-12 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex md:absolute md:left-0 items-center justify-center rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <div className="text-center w-full">
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">List Your Property</h1>
                </div>
                <div className="flex md:absolute md:right-0 items-center gap-2">
                  <Link
                    to="/chat"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 shadow-sm"
                  >
                    Chat
                  </Link>
                  <Link
                    to="/my-listings"
                    className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    My Listings
                  </Link>
                </div>
              </div>
              <div className="mt-9 flex items-center justify-center space-x-5">
                 <Step number={1} title="Property Details" active={stage===1} completed={stage>1} />
                 <div className="w-12 h-px bg-slate-200 sm:w-24"></div>
                 <Step number={2} title="Eco-Profile" active={stage===2} completed={stage>2} />
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all">
              {stage === 1 ? (
                <form onSubmit={handleStage1Submit} className="p-6 sm:p-10 lg:p-12 space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    <div className="space-y-7 lg:col-span-7">
                      <InputWithIcon icon={Home} label="Property Title" value={form.title} onChange={onFieldChange('title')} required />
                      <InputWithIcon icon={MapPin} label="Address" value={form.address} onChange={onFieldChange('address')} required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputWithIcon icon={MapPin} label="Display Address" value={form.displayAddress} onChange={onFieldChange('displayAddress')} placeholder="e.g., No. 12, Palm Grove Residences" />
                        <InputWithIcon icon={MapPin} label="City" value={form.city} onChange={onFieldChange('city')} placeholder="e.g., Colombo" />
                        <InputWithIcon icon={MapPin} label="State / Province" value={form.state} onChange={onFieldChange('state')} placeholder="e.g., Western Province" />
                        <InputWithIcon icon={MapPin} label="Country" value={form.country} onChange={onFieldChange('country')} placeholder="e.g., Sri Lanka" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Stay Type</label>
                          <select
                            value={form.stayType}
                            onChange={onFieldChange('stayType')}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="long">Long Stay</option>
                            <option value="short">Short Stay</option>
                            <option value="both">Both</option>
                          </select>
                        </div>

                        {(form.stayType === 'long' || form.stayType === 'both') && (
                          <InputWithIcon
                            icon={Banknote}
                            label="Monthly Price (LKR)"
                            value={form.monthlyPrice}
                            onChange={onFieldChange('monthlyPrice')}
                            type="number"
                            min="0"
                            required
                          />
                        )}

                        {(form.stayType === 'short' || form.stayType === 'both') && (
                          <InputWithIcon
                            icon={Banknote}
                            label="Daily Price (LKR)"
                            value={form.dailyPrice}
                            onChange={onFieldChange('dailyPrice')}
                            type="number"
                            min="0"
                            required
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputWithIcon icon={Home} label="Area (sq.ft)" value={form.area} onChange={onFieldChange('area')} type="number" min="0" placeholder="e.g., 1200" />
                        <div className="flex flex-col">
                          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Property Type</label>
                          <select value={form.propertyType} onChange={onFieldChange('propertyType')} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10">
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
                            onChange={onFieldChange('bedrooms')}
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
                            step="0.5"
                            value={form.bathrooms}
                            onChange={onFieldChange('bathrooms')}
                            placeholder="e.g., 1"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          />
                        </div>

                        {(form.stayType === 'short' || form.stayType === 'both') && (
                          <div className="flex flex-col">
                            <label className="mb-1.5 flex items-center text-sm font-semibold text-slate-700">
                              <Home className="w-4 h-4 mr-2 text-slate-400" />
                              Maximum Guests
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={form.maxGuests}
                              onChange={onFieldChange('maxGuests')}
                              placeholder="e.g., 4"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />
                          </div>
                        )}

                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors min-h-[50px]">
                          <input
                            type="checkbox"
                            checked={form.parking}
                            onChange={onFieldChange('parking')}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                          />
                          <span className="text-sm font-medium text-slate-700">Parking</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-6 lg:col-span-5">
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-slate-700"><AlignLeft className="w-4 h-4 mr-2 text-slate-400" />Description</label>
                        <textarea value={form.description} onChange={onFieldChange('description')} required className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 min-h-[220px] resize-y" />
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center text-sm font-semibold text-slate-700"><ImageIcon className="w-4 h-4 mr-2 text-slate-400" />Property Images</label>
                          <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                            Browse images
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={onImageFilesChange}
                            />
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
                    <button type="submit" disabled={isSubmitting} className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-black disabled:opacity-70 shadow-md">{isSubmitting ? 'Saving...' : 'Continue to Eco-Rating'}</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleStage2Submit} className="p-6 sm:p-10 lg:p-12 space-y-10">
                  <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center mb-4 text-emerald-800"><MapPin className="w-5 h-5 mr-2" /><h3 className="font-semibold">Location Coordinates</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputWithIcon icon={MapPin} label="Latitude" type="number" step="any" value={ecoForm.latitude} onChange={onEcoFieldChange('latitude')} required />
                      <InputWithIcon icon={MapPin} label="Longitude" type="number" step="any" value={ecoForm.longitude} onChange={onEcoFieldChange('longitude')} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex flex-col">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Energy Rating</label>
                      <select value={ecoForm.energyRating} onChange={onEcoFieldChange('energyRating')} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm">
                        <option value="A">A - Excellent</option><option value="B">B - Good</option><option value="C">C - Average</option><option value="D">D - Poor</option><option value="E">E - Very Poor</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Transport Distance</label>
                      <select value={ecoForm.transportDistance} onChange={onEcoFieldChange('transportDistance')} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm">
                        <option value="< 1 km">{'< 1 km'}</option><option value="1-3 km">1-3 km</option><option value="> 3 km">{'> 3 km'}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-4"><Leaf className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-lg text-slate-900">Green Amenities</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <FeatureToggle icon={Sun} label="Solar Panels" checked={ecoForm.solarPanels} onChange={onEcoFieldChange('solarPanels')} />
                      <FeatureToggle icon={Zap} label="LED Lighting" checked={ecoForm.ledLighting} onChange={onEcoFieldChange('ledLighting')} />
                      <FeatureToggle icon={Wind} label="Efficient AC" checked={ecoForm.efficientAc} onChange={onEcoFieldChange('efficientAc')} />
                      <FeatureToggle icon={Droplets} label="Water Saving Taps" checked={ecoForm.waterSavingTaps} onChange={onEcoFieldChange('waterSavingTaps')} />
                      <FeatureToggle icon={Droplets} label="Rainwater Harvest" checked={ecoForm.rainwaterHarvesting} onChange={onEcoFieldChange('rainwaterHarvesting')} />
                      <FeatureToggle icon={CheckCircle2} label="Water Meter" checked={ecoForm.waterMeter} onChange={onEcoFieldChange('waterMeter')} />
                      <FeatureToggle icon={Recycle} label="Recycling Setup" checked={ecoForm.recyclingAvailable} onChange={onEcoFieldChange('recyclingAvailable')} />
                      <FeatureToggle icon={Leaf} label="Composting" checked={ecoForm.compostAvailable} onChange={onEcoFieldChange('compostAvailable')} />
                      <FeatureToggle icon={BatteryCharging} label="EV Charging" checked={ecoForm.evCharging} onChange={onEcoFieldChange('evCharging')} />
                      <FeatureToggle icon={Wind} label="Good Ventilation" checked={ecoForm.goodVentilationSunlight} onChange={onEcoFieldChange('goodVentilationSunlight')} />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button type="button" onClick={() => navigate('/my-listings')} className="text-sm font-bold text-slate-500">Skip</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-emerald-700">{isSubmitting ? 'Confirming...' : 'Publish Listing'}</button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Step({ number, title, active, completed }) {
  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${completed ? 'bg-emerald-500 text-white' : active ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'}`}>
        {completed ? <CheckCircle2 className="w-6 h-6" /> : number}
      </div>
      <span className={`ml-3 font-medium text-sm hidden sm:block ${(active || completed) ? 'text-slate-900' : 'text-slate-400'}`}>{title}</span>
    </div>
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

function FeatureToggle({ icon: Icon, label, checked, onChange }) {
  return (
    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white'}`}>
      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 font-semibold text-sm text-slate-700 select-none">{label}</div>
      <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>{checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}</div>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}
