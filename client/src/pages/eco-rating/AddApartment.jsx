import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Home/Navbar';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import SellerApplicationModal from '../../components/seller/SellerApplicationModal';
import AddApartmentStageOneForm from '../../components/eco-rating/AddApartmentStageOneForm';
import AddApartmentStageTwoForm from '../../components/eco-rating/AddApartmentStageTwoForm';

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
  const [isSellerFormOpen, setIsSellerFormOpen] = useState(false);
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

  const handleSellerApplicationSubmitted = async () => {
    setError('');
    await fetchUser();
    setSuccess('Seller application submitted successfully. We will review your request soon.');
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
  const hasPendingSellerRequest = Boolean(user?.sellerRequest);

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
             <h3 className="text-2xl font-bold text-slate-900">Want to List Your Property?</h3>
             <p className="mt-3 text-sm text-slate-600">
               {hasPendingSellerRequest
                 ? 'Your seller application is pending review. You will be able to list apartments after approval.'
                 : 'Complete the seller application to start listing apartments on GreenRent.'}
             </p>
             {error && <p className="mt-4 text-sm font-medium text-red-600 bg-red-50 py-2 px-4 rounded-lg">{error}</p>}
             {success && <p className="mt-4 text-sm font-medium text-emerald-600 bg-emerald-50 py-2 px-4 rounded-lg">{success}</p>}
             <button
               onClick={() => {
                 setError('');
                 setSuccess('');
                 setIsSellerFormOpen(true);
               }}
               disabled={hasPendingSellerRequest}
               className="mt-8 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 transition-all"
             >
               {hasPendingSellerRequest ? 'Application Pending' : 'Become a Seller'}
             </button>
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
                <AddApartmentStageOneForm
                  form={form}
                  setForm={setForm}
                  onFieldChange={onFieldChange}
                  onImageFilesChange={onImageFilesChange}
                  removeSelectedImage={removeSelectedImage}
                  error={error}
                  success={success}
                  isSubmitting={isSubmitting}
                  onSubmit={handleStage1Submit}
                />
              ) : (
                <AddApartmentStageTwoForm
                  ecoForm={ecoForm}
                  onEcoFieldChange={onEcoFieldChange}
                  error={error}
                  isSubmitting={isSubmitting}
                  onSubmit={handleStage2Submit}
                  onSkip={() => navigate('/my-listings')}
                />
              )}
            </div>
          </>
        )}
      </main>
      <SellerApplicationModal
        isOpen={isSellerFormOpen}
        onClose={() => setIsSellerFormOpen(false)}
        onSubmitted={handleSellerApplicationSubmitted}
      />
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
