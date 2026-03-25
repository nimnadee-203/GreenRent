import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function MyListings() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState({ title: "", price: "", availabilityStatus: "available" });

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
  }, []);

  const beginEdit = (property) => {
    setEditId(property._id);
    setEditForm({
      title: property.title || "",
      price: property.price || "",
      availabilityStatus: property.availabilityStatus || "available",
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/properties/${editId}`,
        {
          title: editForm.title,
          price: Number(editForm.price),
          availabilityStatus: editForm.availabilityStatus,
        },
        { withCredentials: true }
      );
      setEditId("");
      fetchData();
    } catch (editError) {
      setError(editError?.response?.data?.message || "Failed to update listing.");
    }
  };

  const deleteListing = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/properties/${id}`, { withCredentials: true });
      setListings((previous) => previous.filter((item) => item._id !== id));
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || "Failed to delete listing.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
        <p className="mt-2 text-slate-600">Update or delete only the apartments you own.</p>

        {isLoading && <p className="mt-6 text-slate-600">Loading your listings...</p>}
        {!isLoading && error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {!isLoading && !error && !user && (
          <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Please login to view your listings.</p>
        )}

        {!isLoading && !error && user && listings.length === 0 && (
          <p className="mt-6 rounded-lg bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">No listings found for your account.</p>
        )}

        {!isLoading && listings.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((property) => (
              <article key={property._id} className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">{property.title}</h2>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{property.description}</p>
                <p className="mt-2 text-sm text-slate-500">{property.location?.address}</p>
                <p className="mt-2 font-semibold text-slate-900">{formatPrice(property.price)}</p>

                {editId === property._id ? (
                  <div className="mt-4 space-y-2">
                    <input
                      value={editForm.title}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Title"
                    />
                    <input
                      value={editForm.price}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Price"
                    />
                    <select
                      value={editForm.availabilityStatus}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, availabilityStatus: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="archived">Archived</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId("")}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(property)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteListing(property._id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
