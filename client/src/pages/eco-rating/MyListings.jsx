import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import { Leaf, Clock, AlertCircle, Edit2, Trash2, Eye, Ban, CheckCircle2, ChevronRight, Sun, Zap, Wind, Droplets, Recycle, BatteryCharging, MapPin, X, Home, Banknote, Image as ImageIcon, Trash2 as TrashIcon } from "lucide-react";
import { formatDistanceToNow, isPast, addHours } from "date-fns";

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
    bedrooms: '',
    bathrooms: '',
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
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
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
        location: { address: updateForm.address },
        images: compressedImages,
        parking: Boolean(updateForm.parking),
      };

      // Only add optional fields if they have values
      if (updateForm.bedrooms) payload.bedrooms = Number(updateForm.bedrooms);
      if (updateForm.bathrooms) payload.bathrooms = Number(updateForm.bathrooms);
      if (updateForm.area) payload.area = Number(updateForm.area);
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Listings</h1>
            <p className="mt-2 text-slate-500 font-medium">Manage your properties and keep their eco-ratings up to date.</p>
          </div>
          <div className="flex gap-3">
             <Link to="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
               Back to Dashboard
             </Link>
             <Link to="/add-apartment" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-black transition-all">
               List New Property
             </Link>
          </div>
        </div>

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
              
              return (
                <div key={property._id} className="group flex flex-col rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <MapPin className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-semibold uppercase tracking-wider">No Image</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md flex items-center shadow-sm ${ecoState.color}`}>
                        {ecoState.status === 'active' && <Leaf className="w-3.5 h-3.5 mr-1.5" />}
                        {ecoState.status === 'pending' && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                        {ecoState.status === 'hidden' && <Ban className="w-3.5 h-3.5 mr-1.5" />}
                        {ecoState.label}
                        {ecoState.status === 'active' && <span className="ml-1.5 px-1.5 py-0.5 bg-white/50 rounded-md">{ecoState.score}/100</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{property.title}</h2>
                       <span className="text-lg font-extrabold text-emerald-600">{formatPrice(property.price)}</span>
                    </div>
                    <div className="flex flex-col gap-1 mb-4">
                      <p className="text-sm text-slate-500 flex items-center"><MapPin className="w-4 h-4 mr-1 opacity-70" /> {property.location?.address}</p>
                      <p className="text-sm text-slate-500 flex items-center"><Clock className="w-4 h-4 mr-1 opacity-70" /> Posted on: {new Date(property.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    {/* Deadline Warning Area */}
                    {ecoState.status !== 'active' && (
                      <div className={`mt-auto mb-5 p-4 rounded-xl border ${ecoState.status === 'hidden' ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'}`}>
                        <div className="flex gap-3">
                           <AlertCircle className={`w-5 h-5 flex-shrink-0 ${ecoState.status === 'hidden' ? 'text-red-600' : 'text-amber-600'}`} />
                           <div>
                             <p className={`text-sm font-bold ${ecoState.status === 'hidden' ? 'text-red-800' : 'text-amber-800'}`}>
                               {ecoState.status === 'hidden' ? 'Listing Hidden' : 'Action Required'}
                             </p>
                             <p className={`text-xs mt-1 leading-relaxed ${ecoState.status === 'hidden' ? 'text-red-600' : 'text-amber-700'}`}>
                               {ecoState.status === 'hidden'
                                 ? ecoState.reason === 'admin'
                                   ? 'Your property is hidden by an admin visibility override.'
                                   : 'Your property is hidden from public view because it lacks an Eco-Rating.'
                                 : `Add an Eco-Rating before time runs out or your listing will be hidden. Time left: ${formatDistanceToNow(ecoState.deadline)}.`}
                             </p>
                           </div>
                        </div>
                      </div>
                    )}

                    <div className={ecoState.status === 'active' ? "mt-auto pt-5 border-t border-slate-100" : "pt-5 border-t border-slate-100"}>
                      <div className="grid grid-cols-2 gap-2">
                         <Link to={`/properties/${property._id}`} className={`flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${ecoState.status !== 'hidden' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'border opacity-50 cursor-not-allowed text-slate-400'}`}>
                             <Eye className="w-4 h-4 mr-1.5" /> View
                           </Link>
                           <button onClick={() => openUpdateModal(property)} className="flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                             <Edit2 className="w-4 h-4 mr-1.5" /> Update Details
                           </button>
                        <button onClick={() => openEcoModal(property)} className="flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                          {ecoState.status === 'active' ? <><Leaf className="w-4 h-4 mr-1.5" /> Edit Rating</> : <><Leaf className="w-4 h-4 mr-1.5" /> Add Rating</>}
                        </button>
                        <button onClick={() => deleteListing(property._id)} className="flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                           <Trash2 className="w-4 h-4 mr-1.5 font-bold" /> Delete Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Eco Rating Modal */}
      {ecoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl my-auto flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Configure Eco-Profile</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{activeProperty?.title}</p>
              </div>
              <button onClick={() => setEcoModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={submitEcoRating} className="flex flex-col min-h-0 overflow-hidden">
                <div className="p-6 sm:p-8 space-y-10 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Energy Rating (EPC)</label>
                    <select value={ecoForm.energyRating} onChange={onEcoFieldChange('energyRating')} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                      <option value="A">A - Excellent Energy Efficiency</option><option value="B">B - Good</option><option value="C">C - Average</option><option value="D">D - Poor</option><option value="E">E - Very Poor</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Public Transport Proximity</label>
                    <select value={ecoForm.transportDistance} onChange={onEcoFieldChange('transportDistance')} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 py-3.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                      <option value="< 1 km">Under 1 km (Optimal)</option><option value="1-3 km">1-3 km (Moderate)</option><option value="> 3 km">Over 3 km (Remote)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-5"><Leaf className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-lg text-slate-900">Green Amenities</h3></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <FeatureToggle icon={Sun} label="Solar Panels" checked={ecoForm.solarPanels} onChange={onEcoFieldChange('solarPanels')} />
                    <FeatureToggle icon={Zap} label="LED Lighting" checked={ecoForm.ledLighting} onChange={onEcoFieldChange('ledLighting')} />
                    <FeatureToggle icon={Wind} label="Efficient AC" checked={ecoForm.efficientAc} onChange={onEcoFieldChange('efficientAc')} />
                    <FeatureToggle icon={Droplets} label="Water Saving Taps" checked={ecoForm.waterSavingTaps} onChange={onEcoFieldChange('waterSavingTaps')} />
                    <FeatureToggle icon={Droplets} label="Rainwater Harvest" checked={ecoForm.rainwaterHarvesting} onChange={onEcoFieldChange('rainwaterHarvesting')} />
                    <FeatureToggle icon={CheckCircle2} label="Water Meter" checked={ecoForm.waterMeter} onChange={onEcoFieldChange('waterMeter')} />
                    <FeatureToggle icon={Recycle} label="Recycling Setup" checked={ecoForm.recyclingAvailable} onChange={onEcoFieldChange('recyclingAvailable')} />
                    <FeatureToggle icon={Leaf} label="Composting Base" checked={ecoForm.compostAvailable} onChange={onEcoFieldChange('compostAvailable')} />
                    <FeatureToggle icon={BatteryCharging} label="EV Charging" checked={ecoForm.evCharging} onChange={onEcoFieldChange('evCharging')} />
                    <FeatureToggle icon={Wind} label="Good Ventilation" checked={ecoForm.goodVentilationSunlight} onChange={onEcoFieldChange('goodVentilationSunlight')} />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50 flex-shrink-0">
                  <div>
                    {activeProperty?.ecoRatingId && (
                      <button type="button" onClick={() => clearEcoRating(activeProperty._id)} className="rounded-xl bg-amber-50 px-6 py-3.5 text-sm font-bold text-amber-600 hover:bg-amber-100 transition-colors">
                        Clear Rating
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setEcoModalOpen(false)} className="rounded-xl px-6 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-md flex items-center">{isSubmitting ? 'Saving...' : <><Leaf className="w-4 h-4 mr-2" /> Publish Eco-Profile</>}</button>
                  </div>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Details Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 items-center flex justify-between border-b border-slate-100 flex-shrink-0">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Edit2 className="w-6 h-6 text-emerald-500" />
                Update Property Details
              </h2>
              <button onClick={() => setUpdateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitUpdateDetails} className="flex flex-col min-h-0">
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                  <input type="text" value={updateForm.title} onChange={onUpdateFieldChange('title')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={updateForm.description} onChange={onUpdateFieldChange('description')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 min-h-[120px]" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Stay Type</label>
                    <select value={updateForm.stayType} onChange={onUpdateFieldChange('stayType')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white">
                      <option value="long">Long Stay</option>
                      <option value="short">Short Stay</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  {(updateForm.stayType === 'long' || updateForm.stayType === 'both') && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Price (LKR)</label>
                      <input type="number" min="0" value={updateForm.monthlyPrice} onChange={onUpdateFieldChange('monthlyPrice')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
                    </div>
                  )}
                  {(updateForm.stayType === 'short' || updateForm.stayType === 'both') && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Daily Price (LKR)</label>
                      <input type="number" min="0" value={updateForm.dailyPrice} onChange={onUpdateFieldChange('dailyPrice')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Area (sq.ft)</label>
                    <input type="number" value={updateForm.area} onChange={onUpdateFieldChange('area')} placeholder="e.g., 1200" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                    <input type="text" value={updateForm.address} onChange={onUpdateFieldChange('address')} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bedrooms</label>
                    <input type="number" min="0" value={updateForm.bedrooms} onChange={onUpdateFieldChange('bedrooms')} placeholder="e.g., 2" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bathrooms</label>
                    <input type="number" min="0" step="0.5" value={updateForm.bathrooms} onChange={onUpdateFieldChange('bathrooms')} placeholder="e.g., 1" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                  </div>
                  <label className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={updateForm.parking} onChange={onUpdateFieldChange('parking')} className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
                    <span className="text-sm font-medium text-slate-700">Parking</span>
                  </label>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center text-sm font-semibold text-slate-700"><ImageIcon className="w-4 h-4 mr-2 text-slate-400" />Property Images</label>
                    <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                      Add images
                      <input type="file" accept="image/*" multiple className="hidden" onChange={onUpdateImageFilesChange} />
                    </label>
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
                          <button type="button" onClick={() => removeSelectedUpdateImage(index)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                <button type="button" onClick={() => setUpdateModalOpen(false)} className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-70">{isSubmitting ? 'Saving...' : 'Update Property'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureToggle({ icon: Icon, label, checked, onChange }) {
  return (
    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 font-bold text-sm text-slate-700 select-none">{label}</div>
      <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-50 border-slate-300'}`}>{checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}</div>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}
