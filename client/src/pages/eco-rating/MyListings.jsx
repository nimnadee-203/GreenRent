import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import { Leaf, Clock, AlertCircle, CheckCircle2, MapPin, Home, Eye } from "lucide-react";
import { formatDistanceToNow, isPast, addHours } from "date-fns";
import MyListingsListingCard from "../../components/eco-rating/MyListingsListingCard";
import EcoRatingModal from "../../components/eco-rating/EcoRatingModal";
import UpdateDetailsModal from "../../components/eco-rating/UpdateDetailsModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
};

const INITIAL_ECO_FORM = { energyRating: 'C', solarPanels: false, ledLighting: false, efficientAc: false, waterSavingTaps: false, rainwaterHarvesting: false, waterMeter: false, recyclingAvailable: false, compostAvailable: false, transportDistance: '1-3 km', evCharging: false, goodVentilationSunlight: false };

export default function MyListings() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [listView, setListView] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modals
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    price: '',
    stayType: 'long',
    monthlyPrice: '',
    dailyPrice: '',
    address: '',
    displayAddress: '',
    city: '',
    state: '',
    country: '',
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    parking: false,
    area: '',
    imageFiles: [],
    coverImageIndex: 0
  });
  const [ecoModalOpen, setEcoModalOpen] = useState(false);
  const [activeProperty, setActiveProperty] = useState(null);
  const [ecoForm, setEcoForm] = useState(INITIAL_ECO_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setError("");
    setIsLoading(true);
    try {
      const userResponse = await axios.get(`${API_BASE_URL}/api/user/data`, { withCredentials: true });
      const userData = userResponse.data?.userData;
      setUser(userData || null);

      if (userData?.id) {
        const listingsResponse = await axios.get(`${API_BASE_URL}/api/properties`, {
          params: { ownerId: userData.id, sortBy: "createdAt", sortOrder: "desc" },
        });
        setListings(Array.isArray(listingsResponse.data) ? listingsResponse.data : []);
      } else {
        setListings([]);
      }
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load your listings.");
      setUser(null);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh timers every minute to keep UI active
    const interval = setInterval(() => setListings((prev) => [...prev]), 60000);
    return () => clearInterval(interval);
  }, []);

  const deleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/properties/${id}`, { withCredentials: true });
      setListings((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete listing.");
    }
  };

  const clearEcoRating = async (id) => {
    if (!window.confirm("Are you sure you want to clear the current Eco-Rating? You will be given a strict 1-hour window to submit a new one before the listing is hidden.")) return;
    try {
      await axios.put(`${API_BASE_URL}/api/properties/${id}/clear-eco-rating`, {}, { withCredentials: true });
      await fetchData();
      setEcoModalOpen(false);
    } catch (err) {
      const details = Array.isArray(err?.response?.data?.errors) ? ` (${err.response.data.errors.join(', ')})` : '';
      const message = (err?.response?.data?.message || "Failed to clear eco rating") + details;
      alert(message);
    }
  };

  const openUpdateModal = (property) => {
    const initialStayType = property.stayType || 'long';
    setActiveProperty(property);
    setUpdateForm({
      title: property.title || '',
      description: property.description || '',
      price: property.price || '',
      stayType: initialStayType,
      monthlyPrice: property.monthlyPrice ?? ((initialStayType === 'long' || initialStayType === 'both') ? (property.price || '') : ''),
      dailyPrice: property.dailyPrice ?? ((initialStayType === 'short' || initialStayType === 'both') ? (property.price || '') : ''),
      address: property.location?.address || '',
      displayAddress: property.location?.displayAddress || '',
      city: property.location?.city || '',
      state: property.location?.state || '',
      country: property.location?.country || '',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      maxGuests: property.maxGuests || '',
      parking: property.parking || false,
      area: property.area || '',
      imageFiles: [],
      coverImageIndex: 0
    });
    setUpdateModalOpen(true);
  };

  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    });
  };

  const submitUpdateDetails = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if ((updateForm.stayType === 'long' || updateForm.stayType === 'both') && (!updateForm.monthlyPrice || Number(updateForm.monthlyPrice) < 0)) {
        alert('Please enter a valid monthly price for long stay.');
        return;
      }

      if ((updateForm.stayType === 'short' || updateForm.stayType === 'both') && (!updateForm.dailyPrice || Number(updateForm.dailyPrice) < 0)) {
        alert('Please enter a valid daily price for short stay.');
        return;
      }

      if ((updateForm.stayType === 'short' || updateForm.stayType === 'both') && (!updateForm.maxGuests || Number(updateForm.maxGuests) < 1)) {
        alert('Please enter a valid maximum number of guests for short stay.');
        return;
      }

      const existingImages = Array.isArray(activeProperty?.images)
        ? activeProperty.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
        : [];

      const compressedImages = updateForm.imageFiles.length > 0
        ? await Promise.all(updateForm.imageFiles.map(compressImage))
        : existingImages;
      
      const payload = {
        title: updateForm.title,
        description: updateForm.description,
        price: updateForm.stayType === 'short' ? Number(updateForm.dailyPrice) : Number(updateForm.monthlyPrice),
        stayType: updateForm.stayType,
        monthlyPrice: (updateForm.stayType === 'long' || updateForm.stayType === 'both') ? Number(updateForm.monthlyPrice) : null,
        dailyPrice: (updateForm.stayType === 'short' || updateForm.stayType === 'both') ? Number(updateForm.dailyPrice) : null,
        location: {
          address: updateForm.address,
          displayAddress: updateForm.displayAddress,
          city: updateForm.city,
          state: updateForm.state,
          country: updateForm.country,
        },
        images: compressedImages,
        parking: Boolean(updateForm.parking),
      };

      // Only add optional fields if they have values
      if (updateForm.bedrooms) payload.bedrooms = Number(updateForm.bedrooms);
      if (updateForm.bathrooms) payload.bathrooms = Number(updateForm.bathrooms);
      if (updateForm.area) payload.area = Number(updateForm.area);
      if (updateForm.stayType === 'short' || updateForm.stayType === 'both') {
        if (updateForm.maxGuests) {
          payload.maxGuests = Number(updateForm.maxGuests);
        }
      } else {
        payload.maxGuests = null;
      }
      await axios.put(`${API_BASE_URL}/api/properties/${activeProperty._id}`, payload, { withCredentials: true });
      setUpdateModalOpen(false);
      fetchData();
    } catch (err) {
      const errors = err?.response?.data?.errors;
      const message = err?.response?.data?.message;
      const status = err?.response?.status;
      const details = Array.isArray(errors) && errors.length ? errors.join(" | ") : message;

      if (details) {
        alert(details);
      } else if (status === 413) {
        alert("Image payload is too large. Try fewer/smaller images.");
      } else {
        alert("Failed to update property details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateFieldChange = (field) => (event) => setUpdateForm((prev) => ({ ...prev, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const existingUpdateImages = Array.isArray(activeProperty?.images)
    ? activeProperty.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
    : [];

  const onUpdateImageFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const oversizedFiles = selectedFiles.filter((f) => f.size > MAX_FILE_SIZE);

    if (oversizedFiles.length) {
      alert(`Some images are too large (max 2MB per file). Please select smaller images.`);
      event.target.value = '';
      return;
    }

    setUpdateForm((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...selectedFiles],
    }));
    event.target.value = '';
  };

  const removeSelectedUpdateImage = (index) => {
    setUpdateForm((prev) => {
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

  const openEcoModal = (property) => {
    setActiveProperty(property);
    if (property.ecoRatingId) {
      const criteria = property.ecoRatingId.criteria || {};
      setEcoForm({ ...INITIAL_ECO_FORM, ...criteria });
    } else {
      setEcoForm(INITIAL_ECO_FORM);
    }
    setEcoModalOpen(true);
  };

  const onEcoFieldChange = (field) => (event) => setEcoForm((prev) => ({ ...prev, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const submitEcoRating = async (event) => {
    event.preventDefault(); setIsSubmitting(true);
    try {
      // Create or update eco rating
      const payload = {
        listingId: activeProperty._id,
        location: {
          latitude: activeProperty.location?.coordinates?.lat || 0,
          longitude: activeProperty.location?.coordinates?.lng || 0
        },
        criteria: ecoForm
      };
      
      if (activeProperty.ecoRatingId) {
        await axios.put(`${API_BASE_URL}/api/eco-ratings/${activeProperty.ecoRatingId._id}`, payload, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE_URL}/api/eco-ratings`, payload, { withCredentials: true });
      }
      setEcoModalOpen(false);
      fetchData(); // reload
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.errors?.[0] || "Failed to save eco-rating.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEcoStatus = (property) => {
    if (property.visibilityStatus === 'hidden') {
      return {
        status: 'hidden',
        label: 'Hidden (Admin)',
        reason: 'admin',
        color: 'text-red-700 bg-red-50 border-red-200',
      };
    }

    if (property.visibilityStatus === 'visible') {
      return {
        status: 'active',
        label: 'Visible (Admin Override)',
        score: property.ecoRatingId?.totalScore,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    }

    if (property.ecoRatingId) {
      return { status: 'active', label: 'Eco-Rated', score: property.ecoRatingId.totalScore, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    
    // Calculates deadline
    const deadline = property.ecoRatingClearedAt 
      ? addHours(new Date(property.ecoRatingClearedAt), 1) 
      : addHours(new Date(property.createdAt), 48);
      
    if (isPast(deadline)) {
      return { status: 'hidden', label: 'Hidden (Missing Rating)', deadline, color: 'text-red-700 bg-red-50 border-red-200' };
    }
    
    return { status: 'pending', label: 'Pending Rating', deadline, color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const listingCounts = useMemo(() => {
    let visible = 0;
    let hidden = 0;

    for (const property of listings) {
      const ecoState = getEcoStatus(property);
      if (ecoState.status === 'hidden') hidden += 1;
      else visible += 1;
    }

    return {
      all: listings.length,
      visible,
      hidden,
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (listView === 'all') return listings;

    return listings.filter((property) => {
      const ecoState = getEcoStatus(property);
      if (listView === 'hidden') return ecoState.status === 'hidden';
      if (listView === 'visible') return ecoState.status !== 'hidden';
      return true;
    });
  }, [listings, listView]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_45%,_#f8fafc_100%)] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm mb-8">
          <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 w-52 h-52 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-emerald-700 font-semibold mb-1">Landlord Space</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                Overview & Listings
              </h1>
              <p className="text-slate-600 mt-2">Manage your properties, monitor visibility, and keep eco-ratings up to date.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/add-apartment" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
                <Home size={16} />
                List New Property
              </Link>
              <Link to="/chat" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">
                Chat
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Total Listings</p>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Home size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{listingCounts.all}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Visible to Public</p>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Eye size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{listingCounts.visible}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Hidden / Action Required</p>
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <AlertCircle size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{listingCounts.hidden}</p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Leaf size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Guide: How to Add & Maintain Eco-Ratings</h3>
              <p className="mt-1 text-sm text-slate-700">
                To keep your properties visible to renters, they must maintain a valid Eco-Rating. 
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>When you create a new listing, it's visible for exactly <strong>48 hours</strong> to give you time to add an Eco-Rating.</li>
                <li>Click the <strong>Add Eco-Rating</strong> button on your listing below, fill in the green features (solar, water saving, etc.), and submit.</li>
                <li>Once rated, your listing stays visible indefinitely and renters can read its precise sustainability breakdown.</li>
                <li>If you clear an existing rating, you are given a <strong>1-hour grace period</strong> to update it before the listing is hidden from the public.</li>
              </ul>
            </div>
          </div>
        </section>

        {isLoading && <div className="text-center py-20 text-slate-500 font-medium">Loading your listings...</div>}
        {!isLoading && error && <div className="mb-6 rounded-xl bg-red-50 p-4 font-medium text-sm text-red-700 border border-red-100">{error}</div>}
        
        {!isLoading && !error && !user && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-lg font-semibold text-slate-800">Please login to view your listings.</p>
          </div>
        )}

        {!isLoading && !error && user && listings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><MapPin className="w-8 h-8 text-slate-400" /></div>
            <p className="text-lg font-semibold text-slate-900">You haven't listed any properties yet.</p>
            <p className="mt-2 text-slate-500 text-sm max-w-sm mx-auto">Get started by adding your first property and highlighting its green features.</p>
          </div>
        )}

        {!isLoading && listings.length > 0 && (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setListView('all')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${listView === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                All ({listingCounts.all})
              </button>
              <button
                type="button"
                onClick={() => setListView('visible')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${listView === 'visible' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                Visible ({listingCounts.visible})
              </button>
              <button
                type="button"
                onClick={() => setListView('hidden')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${listView === 'hidden' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                Hidden ({listingCounts.hidden})
              </button>
            </div>

            {filteredListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-lg font-semibold text-slate-900">No listings in this view.</p>
                <p className="mt-2 text-slate-500 text-sm">Switch filters above to view all, visible, or hidden listings you created.</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((property) => {
              const ecoState = getEcoStatus(property);
              const cardEcoState = {
                ...ecoState,
                timeLeftText: ecoState.deadline ? formatDistanceToNow(ecoState.deadline) : "",
              };
              
              return (
                <MyListingsListingCard
                  key={property._id}
                  property={property}
                  ecoState={cardEcoState}
                  formatPrice={formatPrice}
                  onOpenUpdateModal={openUpdateModal}
                  onOpenEcoModal={openEcoModal}
                  onDeleteListing={deleteListing}
                />
              );
            })}
              </div>
            )}
          </>
        )}
      </main>

      <EcoRatingModal
        isOpen={ecoModalOpen}
        activeProperty={activeProperty}
        ecoForm={ecoForm}
        onEcoFieldChange={onEcoFieldChange}
        onClose={() => setEcoModalOpen(false)}
        onSubmit={submitEcoRating}
        onClear={clearEcoRating}
        isSubmitting={isSubmitting}
      />

      <UpdateDetailsModal
        isOpen={updateModalOpen}
        updateForm={updateForm}
        existingUpdateImages={existingUpdateImages}
        onFieldChange={onUpdateFieldChange}
        onImageFilesChange={onUpdateImageFilesChange}
        onRemoveSelectedImage={removeSelectedUpdateImage}
        isSubmitting={isSubmitting}
        onClose={() => setUpdateModalOpen(false)}
        onSubmit={submitUpdateDetails}
      />
    </div>
  );
}
