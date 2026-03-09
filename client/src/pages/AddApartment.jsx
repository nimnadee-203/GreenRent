import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const INITIAL_FORM = {
  title: "",
  description: "",
  address: "",
  price: "",
  propertyType: "apartment",
  imageUrl: "",
  solarPower: false,
  rainwaterHarvesting: false,
  energyEfficientAppliances: false,
};

export default function AddApartment() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/data`, { withCredentials: true });
      setUser(response.data?.userData || null);
    } catch (fetchError) {
      setUser(null);
      setError(fetchError?.response?.data?.message || "Please login to continue.");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onFieldChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleBecomeSeller = async () => {
    setError("");
    setSuccess("");
    setIsUpgrading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/request-seller`,
        {},
        {
          withCredentials: true,
        }
      );
      await fetchUser();
      setSuccess("Seller access enabled. You can now add apartments.");
    } catch (upgradeError) {
      setError(upgradeError?.response?.data?.message || "Could not upgrade seller role.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const payload = {
      title: form.title,
      description: form.description,
      location: {
        address: form.address,
      },
      price: Number(form.price),
      propertyType: form.propertyType,
      ecoFeatures: {
        solarPower: form.solarPower,
        rainwaterHarvesting: form.rainwaterHarvesting,
        energyEfficientAppliances: form.energyEfficientAppliances,
      },
      images: form.imageUrl ? [form.imageUrl] : [],
    };

    try {
      await axios.post(`${API_BASE_URL}/api/properties`, payload, {
        withCredentials: true,
      });
      setSuccess("Apartment listed successfully.");
      setForm(INITIAL_FORM);
    } catch (submitError) {
      const serverErrors = submitError?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        setError(serverErrors.join(" | "));
      } else {
        setError(submitError?.response?.data?.message || "Failed to create apartment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddProperty = user && (user.role === "seller" || user.role === "admin");

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Add Apartment</h1>
        <p className="mt-2 text-slate-600">Create a new listing for renters to discover.</p>

        {authLoading && <p className="mt-6 text-slate-600">Checking your account...</p>}

        {!authLoading && !user && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            Please use Email Login (not Google-only session) to add listings.
          </div>
        )}

        {!authLoading && user && !canAddProperty && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-800">Seller access required</p>
            <p className="mt-1 text-sm text-slate-600">
              Your account is logged in, but only sellers can post listings. Click below to become a seller.
            </p>
            <button
              type="button"
              onClick={handleBecomeSeller}
              disabled={isUpgrading}
              className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-70"
            >
              {isUpgrading ? "Updating..." : "Become a Seller"}
            </button>
          </div>
        )}

        {!authLoading && canAddProperty && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <Input label="Title" value={form.title} onChange={onFieldChange("title")} placeholder="2BHK apartment near metro" />
            <TextArea
              label="Description"
              value={form.description}
              onChange={onFieldChange("description")}
              placeholder="Add highlights about your apartment"
            />
            <Input label="Address" value={form.address} onChange={onFieldChange("address")} placeholder="Street, city, state" />
            <Input
              label="Monthly Rent (INR)"
              value={form.price}
              onChange={onFieldChange("price")}
              type="number"
              min="0"
              placeholder="15000"
            />

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Property Type</span>
              <select
                value={form.propertyType}
                onChange={onFieldChange("propertyType")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="townhouse">Townhouse</option>
                <option value="other">Other</option>
              </select>
            </label>

            <Input
              label="Image URL (optional)"
              value={form.imageUrl}
              onChange={onFieldChange("imageUrl")}
              placeholder="https://..."
            />

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Eco Features</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Checkbox
                  label="Solar Power"
                  checked={form.solarPower}
                  onChange={onFieldChange("solarPower")}
                />
                <Checkbox
                  label="Rainwater Harvesting"
                  checked={form.rainwaterHarvesting}
                  onChange={onFieldChange("rainwaterHarvesting")}
                />
                <Checkbox
                  label="Efficient Appliances"
                  checked={form.energyEfficientAppliances}
                  onChange={onFieldChange("energyEfficientAppliances")}
                />
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-70"
            >
              {isSubmitting ? "Publishing..." : "Publish Listing"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
      />
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        {...props}
        rows={4}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
      />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
