import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Heart } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import WishlistGrid from "../../components/Property/WishlistGrid";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

        <WishlistGrid wishlist={wishlist} removingIds={removingIds} onRemove={handleRemove} isLoading={loading} error={error} />
      </main>

      <Footer />
    </div>
  );
}
