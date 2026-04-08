import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import MapDisplay from '../../components/Property/MapDisplay';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function PropertyMap() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/properties`);
        setProperties(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load properties.');
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full px-4 md:px-8 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-8 h-8 text-emerald-600" />
              Properties Map
            </h1>
            <p className="mt-2 text-slate-600">Browse available properties on the map</p>
          </div>

          <MapDisplay properties={properties} isLoading={isLoading} error={error} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
