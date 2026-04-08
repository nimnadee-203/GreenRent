import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Home/Navbar';
import RecommendationsHeader from '../../components/renter/RecommendationsHeader';
import RecommendationCard from '../../components/renter/RecommendationCard';
import {
  RecommendationsLoadingState,
  RecommendationsErrorState,
  RecommendationsEmptyState,
} from '../../components/renter/RecommendationsStates';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/recommendations`, { withCredentials: true });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RecommendationsHeader />

        {isLoading && <RecommendationsLoadingState />}

        {!isLoading && error && <RecommendationsErrorState error={error} onRetry={fetchRecommendations} />}

        {!isLoading && !error && recommendations.length === 0 && <RecommendationsEmptyState />}

        {!isLoading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((property, idx) => (
              <RecommendationCard
                key={property._id}
                property={property}
                rank={idx + 1}
                apiBaseUrl={API_BASE_URL}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
