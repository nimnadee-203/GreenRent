import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Heart, MapPin, Bed, Bath, Maximize2, Trash2 } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingIds, setRemovingIds] = useState([]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/wishlist`, {
        withCredentials: true,
      });
      setWishlist(Array.isArray(response.data?.wishlist) ? response.data.wishlist : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Please login to view your wishlist.");
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (propertyId) => {
    if (removingIds.includes(propertyId)) return;

    try {
      setRemovingIds((prev) => [...prev, propertyId]);
      await axios.delete(`${API_BASE_URL}/api/user/wishlist/${propertyId}`, {
        withCredentials: true,
      });
      setWishlist((prev) => prev.filter((item) => item._id !== propertyId));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to remove from wishlist.");
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== propertyId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-500" /> Wishlist
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Your saved properties in one place.</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Listings
          </Link>
        </div>

        {loading && <div className="text-center py-20 text-slate-500 font-medium">Loading wishlist...</div>}

        {!loading && error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <p className="font-semibold">Could not load wishlist.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Login
            </Link>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-800">Your wishlist is empty.</p>
            <p className="mt-2 text-sm text-slate-500">Tap the heart on any property card to save it here.</p>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map((property) => {
              const bedrooms = property.bedrooms ?? property.beds ?? 1;
              const bathrooms = property.bathrooms ?? property.baths ?? 1;
              const primaryImage = property.images?.[0] || FALLBACK_IMAGE;

              return (
                <article
                  key={property._id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
                >
                  <Link to={`/properties/${property._id}`} className="block group">
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col">
                    <Link to={`/properties/${property._id}`}>
                      <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{property.title}</h2>
                    </Link>

                    <p className="mt-1 text-sm text-slate-500 flex items-center line-clamp-1">
                      <MapPin className="w-4 h-4 mr-1" /> {property.location?.address || "Address not provided"}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="inline-flex items-center"><Bed className="w-4 h-4 mr-1" />{bedrooms} Beds</span>
                      <span className="inline-flex items-center"><Bath className="w-4 h-4 mr-1" />{bathrooms} Baths</span>
                      {property.area && (
                        <span className="inline-flex items-center"><Maximize2 className="w-4 h-4 mr-1" />{Number(property.area).toLocaleString("en-LK")} sq.ft</span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xl font-bold text-slate-900">Rs {Number(property.price || 0).toLocaleString("en-LK")}</p>
                      <button
                        type="button"
                        onClick={() => handleRemove(property._id)}
                        disabled={removingIds.includes(property._id)}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
